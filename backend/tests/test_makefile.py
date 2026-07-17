import os
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def test_all_root_frontend_npm_targets_remove_openai_key(
    tmp_path: Path,
) -> None:
    fake_npm = tmp_path / "fake-npm"
    fake_npm.write_text(
        "#!/bin/sh\n"
        'if [ "${OPENAI_API_KEY+x}" = "x" ]; then\n'
        "  exit 91\n"
        "fi\n"
        'printf "%s\\n" "$*" >> "$FAKE_NPM_LOG"\n',
        encoding="utf-8",
    )
    fake_npm.chmod(0o700)
    invocation_log = tmp_path / "npm-invocations.log"
    environment = os.environ.copy()
    environment["OPENAI_API_KEY"] = "synthetic-frontend-boundary-value"
    environment["FAKE_NPM_LOG"] = str(invocation_log)

    completed = subprocess.run(
        [
            "make",
            "setup-frontend",
            "test-frontend",
            "build",
            f"NPM={fake_npm}",
        ],
        cwd=ROOT,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )

    assert completed.returncode == 0
    assert invocation_log.read_text(encoding="utf-8").splitlines() == [
        "--prefix frontend ci",
        "--prefix frontend test",
        "--prefix frontend run build",
    ]
