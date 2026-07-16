#!/usr/bin/env python3
"""Run the HeatRelay frontend and backend with coordinated shutdown."""

from __future__ import annotations

import os
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VENV_PYTHON = ROOT / ".venv" / "bin" / "python"
FRONTEND = ROOT / "frontend"


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
        for name, command in commands:
            print(f"Starting {name}: {' '.join(command)}", flush=True)
            process = subprocess.Popen(
                command,
                cwd=ROOT,
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
