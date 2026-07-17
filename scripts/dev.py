#!/usr/bin/env python3
"""Run the HeatRelay frontend and backend with coordinated shutdown."""

from __future__ import annotations

import os
import shutil
import signal
import stat
import subprocess
import sys
import time
from collections.abc import Mapping
from pathlib import Path

from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[1]
VENV_PYTHON = ROOT / ".venv" / "bin" / "python"
FRONTEND = ROOT / "frontend"
LOCAL_ENV_FILE = ROOT / ".env.local"
OPENAI_API_KEY_ENV = "OPENAI_API_KEY"


def _warn_local_env_ignored(reason: str) -> None:
    print(
        f"Warning: ignored .env.local because {reason}.",
        file=sys.stderr,
        flush=True,
    )


def read_local_openai_api_key(path: Path = LOCAL_ENV_FILE) -> str | None:
    """Read only the backend OpenAI key from an explicit regular env file."""

    try:
        path_mode = path.lstat().st_mode
    except FileNotFoundError:
        return None
    except OSError:
        _warn_local_env_ignored("it could not be inspected safely")
        return None

    if stat.S_ISLNK(path_mode):
        _warn_local_env_ignored("symlinks are not accepted")
        return None
    if not stat.S_ISREG(path_mode):
        _warn_local_env_ignored("it is not a regular file")
        return None

    no_follow = getattr(os, "O_NOFOLLOW", None)
    if no_follow is None:
        _warn_local_env_ignored("this platform cannot prevent symlink traversal")
        return None

    try:
        descriptor = os.open(path, os.O_RDONLY | no_follow)
    except OSError:
        _warn_local_env_ignored("it could not be opened safely")
        return None

    try:
        with os.fdopen(descriptor, encoding="utf-8") as stream:
            opened_mode = os.fstat(stream.fileno()).st_mode
            if not stat.S_ISREG(opened_mode):
                _warn_local_env_ignored("it is not a regular file")
                return None
            if opened_mode & (stat.S_IRWXG | stat.S_IRWXO):
                _warn_local_env_ignored(
                    "its permissions allow group or other access"
                )
                return None
            values = dotenv_values(
                stream=stream,
                interpolate=False,
                verbose=False,
            )
    except (OSError, UnicodeError):
        _warn_local_env_ignored("it could not be read safely")
        return None

    value = values.get(OPENAI_API_KEY_ENV)
    return value if isinstance(value, str) and value else None


def build_service_environments(
    parent_environment: Mapping[str, str] | None = None,
    local_env_path: Path = LOCAL_ENV_FILE,
) -> tuple[dict[str, str], dict[str, str]]:
    """Build isolated backend and frontend child environments."""

    inherited = dict(os.environ if parent_environment is None else parent_environment)
    backend_environment = inherited.copy()
    if OPENAI_API_KEY_ENV not in backend_environment:
        local_key = read_local_openai_api_key(local_env_path)
        if local_key is not None:
            backend_environment[OPENAI_API_KEY_ENV] = local_key

    frontend_environment = inherited.copy()
    frontend_environment.pop(OPENAI_API_KEY_ENV, None)
    return backend_environment, frontend_environment


def process_group_exists(process_group_id: int) -> bool:
    """Return whether a process group still has at least one member."""

    try:
        os.killpg(process_group_id, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True


def stop_services(
    services: list[tuple[str, subprocess.Popen[bytes]]],
    grace_period_seconds: float = 5,
) -> None:
    """Terminate complete service process groups, then force-stop stragglers."""

    for name, process in services:
        if process_group_exists(process.pid):
            try:
                os.killpg(process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            except PermissionError:
                print(
                    "Warning: permission denied sending SIGTERM to "
                    f"{name} process group {process.pid}; "
                    "cleanup may be incomplete.",
                    file=sys.stderr,
                    flush=True,
                )

    deadline = time.monotonic() + grace_period_seconds
    while time.monotonic() < deadline:
        for _, process in services:
            process.poll()
        if all(not process_group_exists(process.pid) for _, process in services):
            break
        time.sleep(0.1)

    for name, process in services:
        if process_group_exists(process.pid):
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            except PermissionError:
                print(
                    "Warning: permission denied sending SIGKILL to "
                    f"{name} process group {process.pid}; "
                    "cleanup may be incomplete.",
                    file=sys.stderr,
                    flush=True,
                )

    for _, process in services:
        try:
            process.wait(timeout=1)
        except subprocess.TimeoutExpired:
            pass

    force_stop_deadline = time.monotonic() + 1
    while time.monotonic() < force_stop_deadline:
        if all(not process_group_exists(process.pid) for _, process in services):
            break
        time.sleep(0.05)


def main() -> int:
    if not VENV_PYTHON.exists():
        print("Missing .venv. Run `make setup` first.", file=sys.stderr)
        return 1

    npm = shutil.which("npm")
    if npm is None:
        print("npm is required. Install Node.js and run `make setup`.", file=sys.stderr)
        return 1

    backend_environment, frontend_environment = build_service_environments()
    commands = [
        (
            "backend",
            [
                str(VENV_PYTHON),
                "-m",
                "uvicorn",
                "backend.app.main:app",
                "--host",
                "127.0.0.1",
                "--port",
                "8000",
            ],
            backend_environment,
        ),
        (
            "frontend",
            [
                npm,
                "--prefix",
                str(FRONTEND),
                "run",
                "dev",
            ],
            frontend_environment,
        ),
    ]

    services: list[tuple[str, subprocess.Popen[bytes]]] = []
    received_signal: int | None = None

    def request_shutdown(signum: int, _frame: object) -> None:
        nonlocal received_signal
        received_signal = signum

    signal.signal(signal.SIGINT, request_shutdown)
    signal.signal(signal.SIGTERM, request_shutdown)

    try:
        for name, command, environment in commands:
            print(f"Starting {name}: {' '.join(command)}", flush=True)
            process = subprocess.Popen(
                command,
                cwd=ROOT,
                env=environment,
                start_new_session=True,
            )
            services.append((name, process))

        print("Frontend: http://127.0.0.1:5173", flush=True)
        print("API health: http://127.0.0.1:8000/api/health", flush=True)
        print("Press Ctrl-C to stop both services.", flush=True)

        while True:
            if received_signal is not None:
                print("Shutdown requested.", flush=True)
                return 0

            for name, process in services:
                return_code = process.poll()
                if return_code is not None:
                    print(
                        f"{name} exited with status {return_code}; stopping all services.",
                        file=sys.stderr,
                        flush=True,
                    )
                    return return_code if return_code != 0 else 1

            time.sleep(0.2)
    finally:
        print("Stopping HeatRelay services...", flush=True)
        stop_services(services)


if __name__ == "__main__":
    raise SystemExit(main())
