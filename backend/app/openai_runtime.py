"""Loop-neutral process-local bounds for OpenAI-backed background tasks.

The application rejects provider work instead of queueing when capacity is
exhausted. A reservation remains occupied until its bound task actually
finishes, including when a request has timed out and detached the task.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
import re
from dataclasses import dataclass
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from threading import Lock
from typing import Any, Callable

OPENAI_PROVIDER_TASK_LIMIT = 4
OPENAI_CLIENT_CLEANUP_TASK_LIMIT = 4
MICRODOLLARS_PER_DOLLAR = 1_000_000
_USD_PATTERN = re.compile(r"^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,6})?$")


class ProviderBudgetExhausted(RuntimeError):
    """Raised before provider work when the process daily bound is exhausted."""


class OpenAIDailyBudget:
    """One concurrency-safe UTC-day budget expressed in integer microdollars."""

    def __init__(
        self,
        *,
        daily_budget_usd: Decimal,
        per_call_reservation_usd: Decimal,
        utc_now: Callable[[], datetime] = lambda: datetime.now(timezone.utc),
    ) -> None:
        self._daily_microdollars = self._to_microdollars(
            daily_budget_usd,
            "daily_budget_usd",
        )
        self._reservation_microdollars = self._to_microdollars(
            per_call_reservation_usd,
            "per_call_reservation_usd",
        )
        if self._reservation_microdollars > self._daily_microdollars:
            raise ValueError("per-call reservation must not exceed daily budget")
        self._utc_now = utc_now
        self._lock = Lock()
        self._date: date | None = None
        self._reserved_microdollars = 0

    @staticmethod
    def parse_usd(value: str, name: str) -> Decimal:
        if not value or value != value.strip() or _USD_PATTERN.fullmatch(value) is None:
            raise ValueError(f"{name} must be a canonical decimal")
        try:
            parsed = Decimal(value)
        except InvalidOperation as error:
            raise ValueError(f"{name} must be a canonical decimal") from error
        OpenAIDailyBudget._to_microdollars(parsed, name)
        return parsed

    @staticmethod
    def _to_microdollars(value: Decimal, name: str) -> int:
        if not isinstance(value, Decimal) or not value.is_finite() or value <= 0:
            raise ValueError(f"{name} must be positive and finite")
        microdollars = value * MICRODOLLARS_PER_DOLLAR
        integral = microdollars.to_integral_value()
        if microdollars != integral:
            raise ValueError(f"{name} supports at most six decimal places")
        return int(integral)

    @property
    def daily_microdollars(self) -> int:
        return self._daily_microdollars

    @property
    def reservation_microdollars(self) -> int:
        return self._reservation_microdollars

    @property
    def reserved_microdollars(self) -> int:
        with self._lock:
            return self._reserved_microdollars

    def reserve(self) -> None:
        now = self._utc_now()
        if (
            not isinstance(now, datetime)
            or now.tzinfo is None
            or now.utcoffset() != timezone.utc.utcoffset(now)
        ):
            raise RuntimeError("provider budget clock must return UTC")
        today = now.date()
        with self._lock:
            if self._date != today:
                self._date = today
                self._reserved_microdollars = 0
            if (
                self._reserved_microdollars + self._reservation_microdollars
                > self._daily_microdollars
            ):
                raise ProviderBudgetExhausted()
            self._reserved_microdollars += self._reservation_microdollars


_process_openai_budget = OpenAIDailyBudget(
    daily_budget_usd=Decimal("1000000"),
    per_call_reservation_usd=Decimal("1"),
)
_process_openai_budget_lock = Lock()


def configure_process_openai_budget(budget: OpenAIDailyBudget) -> None:
    """Install the one production budget before serving requests."""

    if not isinstance(budget, OpenAIDailyBudget):
        raise TypeError("budget must be an OpenAIDailyBudget")
    global _process_openai_budget
    with _process_openai_budget_lock:
        _process_openai_budget = budget


def get_process_openai_budget() -> OpenAIDailyBudget:
    with _process_openai_budget_lock:
        return _process_openai_budget


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
    provider_budget: OpenAIDailyBudget | None = None,
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
    try:
        (provider_budget or get_process_openai_budget()).reserve()
    except BaseException:
        cleanup_lease.release()
        provider_lease.release()
        raise
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
