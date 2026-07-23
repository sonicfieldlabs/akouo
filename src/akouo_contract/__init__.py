"""Installed access to the canonical AKOÚŌ contract and skill library.

v0.8.0 adds the accountable-listening context: position, apertures, auditory
scale, sources of listening, attributed participants, action authority,
honest absence, and revision lineage remain distinct from apparatus,
covenant, and claims. Contract: ``akouo/v0.8``."""
from __future__ import annotations

import json
# Semgrep's Python 3.7 compatibility rule is inapplicable; this package requires 3.10+.
from importlib.resources import files  # nosemgrep
from pathlib import Path
from typing import Any

__version__ = "0.8.0"
CONTRACT_VERSION = "0.8"
CONTRACT = f"akouo/v{CONTRACT_VERSION}"


def root() -> Path:
    """Return the packaged data root as a filesystem path."""
    return Path(str(files("akouo_contract").joinpath("data")))


def manifest_path() -> Path:
    return root() / "akouo.manifest.json"


def presets_path() -> Path:
    return root() / "presets" / "presets.json"


def schema_path(name: str) -> Path:
    filename = name if name.endswith(".json") else f"{name}.schema.json"
    return root() / "schemas" / filename


def skill_path(skill_id: str) -> Path:
    return root() / "skills" / skill_id / "SKILL.md"


def load_manifest() -> dict[str, Any]:
    return json.loads(manifest_path().read_text(encoding="utf-8"))


def load_presets() -> dict[str, Any]:
    return json.loads(presets_path().read_text(encoding="utf-8"))


__all__ = [
    "CONTRACT",
    "CONTRACT_VERSION",
    "__version__",
    "load_manifest",
    "load_presets",
    "manifest_path",
    "presets_path",
    "root",
    "schema_path",
    "skill_path",
]
