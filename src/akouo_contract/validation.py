"""Shared offline validation for installed AKOUO contracts."""
from __future__ import annotations
import json
import math
from functools import lru_cache
from pathlib import Path
from typing import Any
from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from . import schema_path


def nonfinite(value: Any) -> bool:
    if isinstance(value, float):
        return not math.isfinite(value)
    if isinstance(value, dict):
        return any(nonfinite(item) for item in value.values())
    if isinstance(value, list):
        return any(nonfinite(item) for item in value)
    return False


def _validators(directory: Path) -> dict[str, Draft202012Validator]:
    schemas = [json.loads(path.read_text(encoding="utf-8")) for path in sorted(directory.glob("*.schema.json"))]
    identities = [schema["$id"] for schema in schemas]
    if len(set(identities)) != len(identities):
        raise ValueError("AKOUO schema directory contains duplicate canonical identities")
    registry = Registry().with_resources((schema["$id"], Resource.from_contents(schema)) for schema in schemas)
    return {schema["$id"]: Draft202012Validator(schema, registry=registry) for schema in schemas}


@lru_cache(maxsize=4)
def _packaged_validators(directory: Path) -> dict[str, Draft202012Validator]:
    # Installed package resources are immutable for the life of the process.
    return _validators(directory)


def contract_errors(name: str, value: Any, *, schemas_dir: Path | None = None) -> list[str]:
    """Validate offline, caching installed resources only.

    Explicit schema directories are reread on every call so edits, additions,
    and removals take effect without a timestamp-based invalidation heuristic.
    """
    directory = Path(schemas_dir) if schemas_dir is not None else schema_path("route-decision").parent
    validators = _validators(directory) if schemas_dir is not None else _packaged_validators(directory)
    identity = f"https://akouo.dev/schemas/{name}.schema.json"
    try:
        validator = validators[identity]
    except KeyError:
        raise ValueError(f"Unknown AKOUO contract schema: {name}") from None
    if nonfinite(value):
        return ["<root>: numbers must be finite JSON numbers"]
    return [f"{'/'.join(str(p) for p in error.path) or '<root>'}: {error.message}"
            for error in validator.iter_errors(value)]
