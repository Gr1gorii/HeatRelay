"""Offline production-package and constraints checks."""

from __future__ import annotations

from importlib.metadata import version
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

EXPECTED_PRODUCTION_CONSTRAINTS = {
    "annotated-doc": "0.0.4",
    "annotated-types": "0.7.0",
    "anyio": "4.14.2",
    "certifi": "2026.6.17",
    "click": "8.4.2",
    "distro": "1.9.0",
    "exceptiongroup": "1.3.1",
    "fastapi": "0.139.2",
    "h11": "0.16.0",
    "httpcore": "1.0.9",
    "httpx": "0.28.1",
    "idna": "3.18",
    "jiter": "0.16.0",
    "openai": "2.46.0",
    "pydantic": "2.13.4",
    "pydantic_core": "2.46.4",
    "sniffio": "1.3.1",
    "starlette": "1.3.1",
    "tqdm": "4.68.4",
    "typing_extensions": "4.16.0",
    "typing-inspection": "0.4.2",
    "uvicorn": "0.51.0",
}


def _constraints() -> dict[str, str]:
    constraints: dict[str, str] = {}
    path = ROOT / "backend/constraints-production.txt"
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        name, pinned = line.split("==", 1)
        constraints[name] = pinned
    return constraints


def test_production_constraints_equal_installed_transitive_closure() -> None:
    constraints = _constraints()
    assert constraints == EXPECTED_PRODUCTION_CONSTRAINTS
    assert {
        name: version(name)
        for name in EXPECTED_PRODUCTION_CONSTRAINTS
    } == EXPECTED_PRODUCTION_CONSTRAINTS


def test_dockerfile_uses_constraints_and_runtime_only_copy_scope() -> None:
    dockerfile = (ROOT / "Dockerfile").read_text(encoding="utf-8")

    assert "--constraint backend/constraints-production.txt" in dockerfile
    assert "COPY backend/app ./backend/app" in dockerfile
    assert "COPY data ./data" in dockerfile
    assert "COPY --from=frontend-build /build/frontend/dist ./frontend/dist" in dockerfile
    assert 'CMD ["python", "-m", "backend.app.production"]' in dockerfile
    assert "COPY backend/tests" not in dockerfile
    assert "COPY . ." not in dockerfile


def test_docker_context_excludes_secrets_and_development_artifacts() -> None:
    patterns = set(
        (ROOT / ".dockerignore").read_text(encoding="utf-8").splitlines()
    )
    assert {
        ".git",
        ".env.*",
        ".venv",
        "backend/tests",
        "frontend/node_modules",
        "frontend/dist",
        "docs",
        "**/__pycache__",
    }.issubset(patterns)


def test_makefile_exposes_single_process_production_commands() -> None:
    makefile = (ROOT / "Makefile").read_text(encoding="utf-8")
    assert "build-production: build" in makefile
    assert "start-production:" in makefile
    assert "-m backend.app.production" in makefile


def test_production_entrypoint_pins_exactly_one_worker() -> None:
    source = (ROOT / "backend/app/production.py").read_text(encoding="utf-8")
    assert "workers=1" in source
    assert "uvicorn.run(" in source
