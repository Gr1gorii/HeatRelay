"""Loop-neutral process-local bounds for OpenAI-backed background tasks.

The application rejects provider work instead of queueing when capacity is
exhausted. A reservation remains occupied until its bound task actually
finishes, including when a request has timed out and detached the task.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
from dataclasses import dataclass
from threading import Lock
from typing import Any

OPENAI_PROVIDER_TASK_LIMIT = 4
OPENAI_CLIENT_CLEANUP_TASK_LIMIT = 4


class BoundedTaskCapacity:
    """A non-blocking, event-loop-neutral capacity and task registry."""

    def __init__(self, limit: int) -> None:
        if type(limit) is not int or limit < 1:
            raise ValueError("task capacity limit must be a positive integer")
        self._limit = limit
        self._lock = Lock()
        self._next_token = 0
        self._active: dict[int, _CapacityEntry] = {}

    @property
    def limit(self) -> int:
        return self._limit

    @property
    def in_use(self) -> int:
        with self._lock:
            return len(self._active)

    @property
    def active_task_count(self) -> int:
        with self._lock:
            return sum(entry.task is not None for entry in self._active.values())

    @property
    def quarantined_count(self) -> int:
        """Number of failed client resources retained fail closed."""

        with self._lock:
            return sum(
                entry.quarantined_resource is not None
                for entry in self._active.values()
            )

    def try_acquire(self) -> TaskCapacityLease | None:
        """Reserve capacity immediately or return ``None`` without waiting."""

        with self._lock:
            if len(self._active) >= self._limit:
                return None
            token = self._next_token
            self._next_token += 1
            self._active[token] = _CapacityEntry()
        return TaskCapacityLease(self, token)

    def _bind(self, token: int, task: asyncio.Task[Any]) -> None:
        with self._lock:
            entry = self._active.get(token)
            if entry is None or entry.task is not None:
                raise RuntimeError("task capacity lease cannot be rebound")
            if entry.quarantined_resource is not None:
                raise RuntimeError("quarantined task capacity lease cannot be rebound")
            entry.task = task

    def _quarantine(self, token: int, resource: object) -> None:
        with self._lock:
            entry = self._active.get(token)
            if entry is None:
                raise RuntimeError("released task capacity lease cannot quarantine")
            entry.task = None
            entry.quarantined_resource = resource

    def _release(self, token: int) -> None:
        with self._lock:
            self._active.pop(token, None)


class TaskCapacityLease:
    """One idempotently released reservation from ``BoundedTaskCapacity``."""

    def __init__(self, capacity: BoundedTaskCapacity, token: int) -> None:
        self._capacity = capacity
        self._token = token
        self._released = False
        self._quarantined = False
        self._lock = Lock()

    def bind(
        self,
        task: asyncio.Task[Any],
        *,
        release_when_done: bool = True,
    ) -> None:
        """Retain ``task`` and release this lease only when the task finishes."""

        with self._lock:
            if self._released or self._quarantined:
                raise RuntimeError("released task capacity lease cannot be bound")
            self._capacity._bind(self._token, task)
        if release_when_done:
            task.add_done_callback(self._release_when_done)

    def release(self) -> None:
        """Release an unbound reservation, safely and idempotently."""

        with self._lock:
            if self._released or self._quarantined:
                return
            self._released = True
        self._capacity._release(self._token)

    def quarantine(self, resource: object) -> None:
        """Retain one failed resource without permitting SDK destruction."""

        with self._lock:
            if self._released or self._quarantined:
                return
            self._quarantined = True
        self._capacity._quarantine(self._token, resource)

    def _release_when_done(self, _task: asyncio.Task[Any]) -> None:
        self.release()


@dataclass
class _CapacityEntry:
    task: asyncio.Task[Any] | None = None
    quarantined_resource: object | None = None


@dataclass(frozen=True)
class OpenAIClientReservations:
    """Capacity that must be owned before one OpenAI client is constructed."""

    provider: TaskCapacityLease
    cleanup: TaskCapacityLease


def try_reserve_openai_client(
    provider_capacity: BoundedTaskCapacity,
    cleanup_capacity: BoundedTaskCapacity,
) -> OpenAIClientReservations | None:
    """Atomically enough reserve provider and cleanup work without waiting.

    No application client factory may be invoked before this succeeds. If the
    cleanup reservation is unavailable, the earlier provider reservation is
    released before returning.
    """

    provider_lease = provider_capacity.try_acquire()
    if provider_lease is None:
        return None
    cleanup_lease = cleanup_capacity.try_acquire()
    if cleanup_lease is None:
        provider_lease.release()
        return None
    return OpenAIClientReservations(
        provider=provider_lease,
        cleanup=cleanup_lease,
    )


def close_unstarted_awaitable(awaitable: object) -> None:
    """Close a coroutine that cannot safely be scheduled."""

    if inspect.iscoroutine(awaitable):
        awaitable.close()


class _ClientCleanupOutcome:
    """Resolve one reserved cleanup exactly once."""

    def __init__(
        self,
        *,
        client: Any,
        lease: TaskCapacityLease,
        logger: logging.Logger,
        failure_warning: str,
    ) -> None:
        self._client = client
        self._lease = lease
        self._logger = logger
        self._failure_warning = failure_warning
        self._finished = False
        self._lock = Lock()

    def consume(self, task: asyncio.Task[Any]) -> None:
        with self._lock:
            if self._finished:
                return
            self._finished = True

        try:
            task.result()
        except asyncio.CancelledError:
            # Cancellation is not reported as an ordinary cleanup failure. The
            # client stays alive in finite quarantine so its SDK destructor
            # cannot schedule an untracked close task.
            self._lease.quarantine(self._client)
        except Exception:
            self._lease.quarantine(self._client)
            self._logger.warning(self._failure_warning)
        except BaseException:
            self._lease.quarantine(self._client)
            raise
        else:
            self._lease.release()


async def close_reserved_openai_client(
    client: Any,
    timeout_seconds: float,
    cleanup_lease: TaskCapacityLease,
    *,
    task_name: str,
    timeout_warning: str,
    failure_warning: str,
    logger: logging.Logger,
) -> None:
    """Wait a bounded time for a previously reserved client close.

    Expiry and caller cancellation detach without cancelling the underlying
    close. Successful close releases capacity. Failed close retains the client
    in a finite quarantine and deliberately keeps capacity occupied.
    """

    close_awaitable: object | None = None
    try:
        close_awaitable = client.close()
        cleanup_task = asyncio.create_task(close_awaitable, name=task_name)
        cleanup_lease.bind(cleanup_task, release_when_done=False)
    except Exception:
        if close_awaitable is not None:
            close_unstarted_awaitable(close_awaitable)
        cleanup_lease.quarantine(client)
        logger.warning(failure_warning)
        return
    except BaseException:
        if close_awaitable is not None:
            close_unstarted_awaitable(close_awaitable)
        cleanup_lease.quarantine(client)
        raise

    outcome = _ClientCleanupOutcome(
        client=client,
        lease=cleanup_lease,
        logger=logger,
        failure_warning=failure_warning,
    )
    cleanup_task.add_done_callback(outcome.consume)

    try:
        done, _ = await asyncio.wait({cleanup_task}, timeout=timeout_seconds)
    except asyncio.CancelledError:
        # The callback retains the task, client, and reservation until close
        # really completes. Caller cancellation remains caller cancellation.
        raise

    if cleanup_task in done:
        outcome.consume(cleanup_task)
        return

    logger.warning(timeout_warning)


SHARED_OPENAI_PROVIDER_CAPACITY = BoundedTaskCapacity(
    OPENAI_PROVIDER_TASK_LIMIT
)
SHARED_OPENAI_CLIENT_CLEANUP_CAPACITY = BoundedTaskCapacity(
    OPENAI_CLIENT_CLEANUP_TASK_LIMIT
)
