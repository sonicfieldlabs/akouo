"""Installed caching and editable offline schema resolution."""
import json
from pathlib import Path
from unittest.mock import patch

import pytest

from akouo_contract import validation


def write_schemas(directory, kind="string"):
    for name, body in {
        "fixture": {"$ref": "https://akouo.dev/schemas/value.schema.json"},
        "value": {"type": kind},
    }.items():
        (directory / f"{name}.schema.json").write_text(json.dumps({
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": f"https://akouo.dev/schemas/{name}.schema.json", **body,
        }))


def test_installed_registry_is_reused_and_cross_references_stay_offline(tmp_path):
    write_schemas(tmp_path)
    validation._packaged_validators.cache_clear()
    with patch.object(validation, "schema_path", return_value=tmp_path / "route-decision.schema.json"):
        assert validation.contract_errors("fixture", "valid") == []
        with patch.object(Path, "read_text", side_effect=AssertionError("resources reread")):
            assert validation.contract_errors("fixture", "another") == []
            assert validation.contract_errors("fixture", 1)
    validation._packaged_validators.cache_clear()


def test_explicit_directory_edits_and_removals_are_visible(tmp_path):
    write_schemas(tmp_path)
    assert validation.contract_errors("fixture", "valid", schemas_dir=tmp_path) == []
    write_schemas(tmp_path, "integer")
    assert validation.contract_errors("fixture", "invalid", schemas_dir=tmp_path)
    assert validation.contract_errors("fixture", 1, schemas_dir=tmp_path) == []
    (tmp_path / "fixture.schema.json").unlink()
    with pytest.raises(ValueError, match="Unknown AKOUO contract schema: fixture"):
        validation.contract_errors("fixture", 1, schemas_dir=tmp_path)


def test_unknown_contract_has_a_descriptive_error(tmp_path):
    write_schemas(tmp_path)
    with pytest.raises(ValueError, match="Unknown AKOUO contract schema: absent"):
        validation.contract_errors("absent", {}, schemas_dir=tmp_path)


def test_duplicate_identities_are_rejected(tmp_path):
    write_schemas(tmp_path)
    (tmp_path / "duplicate.schema.json").write_bytes((tmp_path / "value.schema.json").read_bytes())
    with pytest.raises(ValueError, match="duplicate canonical identities"):
        validation.contract_errors("fixture", "valid", schemas_dir=tmp_path)
