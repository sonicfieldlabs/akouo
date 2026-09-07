"""Shared offline validation for installed AKOUO contracts."""
from __future__ import annotations
import json
import math
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


def contract_errors(name: str, value: Any, *, schemas_dir: Path | None = None) -> list[str]:
    """Resolve canonical schema references only from the local package/directory."""
    if nonfinite(value):
        return ["<root>: numbers must be finite JSON numbers"]
    directory = Path(schemas_dir) if schemas_dir is not None else schema_path(name).parent
    schemas = [json.loads(path.read_text(encoding="utf-8")) for path in sorted(directory.glob("*.schema.json"))]
    registry = Registry().with_resources((schema["$id"], Resource.from_contents(schema)) for schema in schemas)
    schema = next(schema for schema in schemas if schema["$id"] == f"https://akouo.dev/schemas/{name}.schema.json")
    validator = Draft202012Validator(schema, registry=registry)
    return [f"{'/'.join(str(p) for p in error.path) or '<root>'}: {error.message}"
            for error in validator.iter_errors(value)]
