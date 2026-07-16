import os
import signal
import subprocess
import sys

from scripts import dev
from scripts.dev import process_group_exists, stop_services


def test_stop_services_kills_a_stubborn_descendant() -> None:
    child_code = (
        "import os, signal, time; "
        "signal.signal(signal.SIGTERM, signal.SIG_IGN); "
        "print(os.getpid(), flush=True); "
        "time.sleep(60)"
    )
    leader_code = (
        "import subprocess, sys, time; "
        f"subprocess.Popen([sys.executable, '-c', {child_code!r}]); "
        "time.sleep(60)"
    )
    leader = subprocess.Popen(
        [sys.executable, "-c", leader_code],
        stdout=subprocess.PIPE,
        text=True,
        start_new_session=True,
    )

    try:
        assert leader.stdout is not None
        child_pid = int(leader.stdout.readline())
        assert child_pid > 0

        stop_services(
            [("test-service", leader)],
            grace_period_seconds=0.2,
        )

        assert leader.poll() is not None
        assert not process_group_exists(leader.pid)
    finally:
        if process_group_exists(leader.pid):
            os.killpg(leader.pid, signal.SIGKILL)
        leader.wait(timeout=1)
        if leader.stdout is not None:
            leader.stdout.close()


def test_stop_services_warns_when_process_group_signals_are_denied(
    monkeypatch,
    capsys,
) -> None:
    class FakeProcess:
        pid = 424242

        def __init__(self) -> None:
            self.wait_timeouts: list[float] = []

        def poll(self) -> None:
            return None

        def wait(self, timeout: float) -> int:
            self.wait_timeouts.append(timeout)
            return 0

    process = FakeProcess()
    sent_signals: list[int] = []

    def deny_signal(_process_group_id: int, signal_to_send: int) -> None:
        sent_signals.append(signal_to_send)
        raise PermissionError("signal denied for test")

    monotonic_values = iter([0.0, 1.0, 2.0, 4.0])

    monkeypatch.setattr(dev, "process_group_exists", lambda _pid: True)
    monkeypatch.setattr(dev.os, "killpg", deny_signal)
    monkeypatch.setattr(
        dev.time,
        "monotonic",
        lambda: next(monotonic_values),
    )

    dev.stop_services(
        [("test-service", process)],
        grace_period_seconds=0,
    )

    stderr = capsys.readouterr().err
    assert sent_signals == [signal.SIGTERM, signal.SIGKILL]
    assert "permission denied sending SIGTERM" in stderr
    assert "permission denied sending SIGKILL" in stderr
    assert stderr.count("cleanup may be incomplete") == 2
    assert "Traceback" not in stderr
    assert process.wait_timeouts == [1]
