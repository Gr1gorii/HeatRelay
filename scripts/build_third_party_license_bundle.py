#!/usr/bin/env python3
"""Build HeatRelay's deterministic production license-text bundle."""

from __future__ import annotations

import argparse
import importlib.metadata
import json
import re
from pathlib import Path

_CONSTRAINT_PATTERN = re.compile(r"^([A-Za-z0-9_.-]+)==([A-Za-z0-9_.+!-]+)$")
_LICENSE_PREFIXES = (
    "copying",
    "copyright",
    "licence",
    "license",
    "notice",
    "thirdpartynotice",
)
_HTML_PARSE_STRINGIFY = ("html-parse-stringify", "3.0.1")


def _section(title: str, source: str, content: bytes) -> bytes:
    boundary = f"\n{'=' * 78}\n{title}\nSource: {source}\n{'=' * 78}\n".encode()
    return boundary + content.rstrip(b"\r\n") + b"\n"


def _python_sections(root: Path) -> list[bytes]:
    sections: list[bytes] = []
    constraints = root / "backend/constraints-production.txt"
    for line in constraints.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        match = _CONSTRAINT_PATTERN.fullmatch(line)
        if match is None:
            raise RuntimeError("Production constraints are not exact pins.")
        name, version = match.groups()
        distribution = importlib.metadata.distribution(name)
        if distribution.version != version:
            raise RuntimeError("Installed Python production closure differs.")
        license_files = sorted(
            (
                file
                for file in distribution.files or ()
                if Path(str(file)).name.lower().startswith(_LICENSE_PREFIXES)
            ),
            key=str,
        )
        if not license_files:
            raise RuntimeError("A Python production license text is unavailable.")
        for license_file in license_files:
            source = distribution.locate_file(license_file)
            sections.append(
                _section(
                    f"Python package: {name} {version}",
                    str(license_file),
                    source.read_bytes(),
                )
            )
    return sections


def _frontend_sections(root: Path) -> list[bytes]:
    lock = json.loads(
        (root / "frontend/package-lock.json").read_text(encoding="utf-8")
    )
    package_entries = [
        (key.removeprefix("node_modules/"), value)
        for key, value in lock["packages"].items()
        if key.startswith("node_modules/") and value.get("dev") is not True
    ]
    sections: list[bytes] = []
    for name, locked in sorted(package_entries):
        version = locked.get("version")
        package_root = root / "frontend/node_modules" / name
        metadata = json.loads(
            (package_root / "package.json").read_text(encoding="utf-8")
        )
        if metadata.get("name") != name or metadata.get("version") != version:
            raise RuntimeError("Installed frontend production closure differs.")
        license_files = sorted(
            (
                path
                for path in package_root.iterdir()
                if path.is_file()
                and path.name.lower().startswith(_LICENSE_PREFIXES)
            ),
            key=lambda path: path.name,
        )
        if not license_files:
            if (name, version) != _HTML_PARSE_STRINGIFY:
                raise RuntimeError("A frontend production license text is unavailable.")
            readme = (package_root / "README.md").read_text(encoding="utf-8")
            marker = "## license\n"
            if marker not in readme:
                raise RuntimeError("The reviewed frontend license declaration changed.")
            declaration = readme[readme.index(marker) :].encode()
            author = json.dumps(
                metadata.get("author"), ensure_ascii=False, sort_keys=True
            ).encode()
            content = b"Package author metadata: " + author + b"\n\n" + declaration
            sections.append(
                _section(
                    f"Frontend package: {name} {version}",
                    "package.json author and README.md license section",
                    content,
                )
            )
            continue
        for license_file in license_files:
            sections.append(
                _section(
                    f"Frontend package: {name} {version}",
                    license_file.name,
                    license_file.read_bytes(),
                )
            )
    return sections


def build_bundle(root: Path) -> bytes:
    header = (
        b"HeatRelay production license and notice bundle\n"
        b"Generated deterministically from the pinned production closures.\n"
    )
    project = [
        _section("HeatRelay project license", "LICENSE", (root / "LICENSE").read_bytes()),
        _section(
            "HeatRelay third-party inventory",
            "THIRD_PARTY_NOTICES.md",
            (root / "THIRD_PARTY_NOTICES.md").read_bytes(),
        ),
    ]
    return header + b"".join(project + _python_sections(root) + _frontend_sections(root))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    arguments = parser.parse_args()
    output = arguments.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(build_bundle(arguments.root.resolve()))


if __name__ == "__main__":
    main()
