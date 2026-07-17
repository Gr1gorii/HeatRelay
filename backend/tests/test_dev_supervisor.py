import os
import signal
import subprocess
import sys
from pathlib import Path

from scripts import dev
from scripts.dev import process_group_exists, stop_services


def test_local_env_key_is_passed_only_to_the_backend(tmp_path: Path) -> None:
    local_env = tmp_path / ".env.local"
    local_env.write_text(
        "OPENAI_API_" + "KEY=local-test-value\nFILE_ONLY=not-forwarded\n",
        encoding="utf-8",
    )
    local_env.chmod(0o600)

    backend_environment, frontend_environment = dev.build_service_environments(
        {"SHARED": "inherited"},
        local_env,
    )

    assert backend_environment == {
        "SHARED": "inherited",
        dev.OPENAI_API_KEY_ENV: "local-test-value",
    }
    assert frontend_environment == {"SHARED": "inherited"}


def test_exported_key_wins_without_reading_the_local_env(monkeypatch) -> None:
    def fail_if_read(_path: Path) -> str | None:
        raise AssertionError("the local env file must not be read")

    monkeypatch.setattr(dev, "read_local_openai_api_key", fail_if_read)

    backend_environment, frontend_environment = dev.build_service_environments(
        {
            "SHARED": "inherited",
            dev.OPENAI_API_KEY_ENV: "exported-test-value",
        },
    )

    assert backend_environment[dev.OPENAI_API_KEY_ENV] == "exported-test-value"
    assert dev.OPENAI_API_KEY_ENV not in frontend_environment
    assert frontend_environment == {"SHARED": "inherited"}


def test_symlinked_local_env_is_refused_without_exposing_its_value(
    tmp_path: Path,
    capsys,
) -> None:
    target = tmp_path / "target.env"
    target.write_text(
        "OPENAI_API_" + "KEY=symlink-test-value\n",
        encoding="utf-8",
    )
    local_env = tmp_path / ".env.local"
    local_env.symlink_to(target)

    assert dev.read_local_openai_api_key(local_env) is None

    stderr = capsys.readouterr().err
    assert "symlinks are not accepted" in stderr
    assert "symlink-test-value" not in stderr


def test_non_regular_local_env_is_refused(tmp_path: Path, capsys) -> None:
    local_env = tmp_path / ".env.local"
    local_env.mkdir()

    assert dev.read_local_openai_api_key(local_env) is None
    assert "not a regular file" in capsys.readouterr().err


def test_group_readable_local_env_is_refused_without_exposing_its_value(
    tmp_path: Path,
    capsys,
) -> None:
    local_env = tmp_path / ".env.local"
    local_env.write_text(
        "OPENAI_API_" + "KEY=group-readable-test-value\n",
        encoding="utf-8",
    )
    local_env.chmod(0o640)

    assert dev.read_local_openai_api_key(local_env) is None

    stderr = capsys.readouterr().err
    assert "permissions allow group or other access" in stderr
    assert "group-readable-test-value" not in stderr


def test_world_readable_local_env_is_refused_without_exposing_its_value(
    tmp_path: Path,
    capsys,
) -> None:
    local_env = tmp_path / ".env.local"
    local_env.write_text(
        "OPENAI_API_" + "KEY=world-readable-test-value\n",
        encoding="utf-8",
    )
    local_env.chmod(0o604)

    assert dev.read_local_openai_api_key(local_env) is None

    stderr = capsys.readouterr().err
    assert "permissions allow group or other access" in stderr
    assert "world-readable-test-value" not in stderr


def test_missing_local_env_is_optional(tmp_path: Path, capsys) -> None:
    assert dev.read_local_openai_api_key(tmp_path / ".env.local") is None
    assert capsys.readouterr().err == ""


def test_main_passes_isolated_environments_to_child_processes(
    monkeypatch,
    capsys,
) -> None:
    backend_environment = {
        "SHARED": "inherited",
        dev.OPENAI_API_KEY_ENV: "backend-test-value",
    }
    frontend_environment = {"SHARED": "inherited"}
    popen_calls: list[dict[str, object]] = []

    class FakeProcess:
        def __init__(self, pid: int) -> None:
            self.pid = pid

        def poll(self) -> int:
            return 0

    def fake_popen(_command: list[str], **kwargs: object) -> FakeProcess:
        popen_calls.append(kwargs)
        return FakeProcess(500000 + len(popen_calls))

    monkeypatch.setattr(dev, "VENV_PYTHON", Path(sys.executable))
    monkeypatch.setattr(dev.shutil, "which", lambda _command: "/test/npm")
    monkeypatch.setattr(
        dev,
        "build_service_environments",
        lambda: (backend_environment, frontend_environment),
    )
    monkeypatch.setattr(dev.subprocess, "Popen", fake_popen)
    monkeypatch.setattr(dev.signal, "signal", lambda *_args: None)
    monkeypatch.setattr(dev, "stop_services", lambda _services: None)

    assert dev.main() == 1
    assert [call["env"] for call in popen_calls] == [
        backend_environment,
        frontend_environment,
    ]

    output = capsys.readouterr()
    assert "backend-test-value" not in output.out
    assert "backend-test-value" not in output.err


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
