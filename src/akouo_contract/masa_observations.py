"""Application-owned, source-preserving attribution of MASA Observations."""
from __future__ import annotations

import json
from copy import deepcopy
from typing import Callable, Any
from pathlib import Path
from .agent_routes import _validator_errors
from .agent_report import agent_report_errors
from .validation import contract_errors, nonfinite

MASA_OBSERVATION_REPORT_CONTRACT = "akouo/masa-observation-report/v0.1"


def _select(record: dict, observation_ref: str, validate_masa: Callable) -> dict:
    if nonfinite(record):
        raise ValueError("Source numbers must be finite")
    errors = _validator_errors(validate_masa, record)
    if errors:
        raise ValueError("Invalid MASA record: " + "; ".join(errors))
    if record.get("masaVersion") != "0.2.0" or "observation" not in record.get("profiles", []):
        raise ValueError("MASA 0.2.0 Observation-profile support is required")
    selected = [o for o in record["observations"] if o["id"] == observation_ref]
    if len(selected) != 1:
        raise ValueError("Observation reference must resolve uniquely in the source record")
    observation = selected[0]
    if len([s for s in record["sources"] if s["id"] == observation["sourceRef"]]) != 1:
        raise ValueError("Observation source must resolve uniquely")
    return observation


def _project(observation: dict, report: dict) -> tuple[list, str]:
    value, unit = observation["value"], observation["unit"]
    state = value["state"]
    if state == "deleted":
        return [], "omitted_deleted"
    if state == "known":
        if unit["state"] != "known" or not isinstance(unit["value"], str) or not unit["value"].strip():
            return [], "omitted_unknown_unit"
        projected = dict(status="known", value=deepcopy(value["value"]), unit=unit["value"])
        mapping = "copied"
    else:
        projected = dict(status=state, reason=value.get("reason", "The retained source declares this value not applicable."))
        mapping = "qualified_absence"
    claim = dict(claim_id=report["report_id"] + ":attribution", statement=(
        f"Retained observation {observation['id']} attributes {observation['field']} to source {observation['sourceRef']} "
        f"with epistemic status {observation['epistemicStatus']}. This receiving pass does not establish the underlying phenomenon."),
        confidence="undetermined", source="provider", evidence_refs=[observation["id"], observation["sourceRef"]],
        listening_pass_id=report["listening_pass_id"], actionability="none",
        basis="Attribution of a retained MASA observation, not a new measurement or an epistemic upgrade.")
    return [dict(feature_id=report["report_id"] + ":observation", namespace="akouo.masa_observation",
        name=observation["field"], category="undetermined", claim=claim, value=projected)], mapping


_LIMIT = "Retained source attribution only; no new measurement, embodied hearing, freshness assessment, disclosure permission or action authority is established."


def map_masa_observation(record: dict, observation_ref: str, *, mapping_id: str,
                         report_id: str, listener_id: str, listening_pass_id: str,
                         apparatus_ref: str, recipients: list[dict], supported_contracts: list[str],
                         validate_masa: Callable, schemas_dir: Path | None = None) -> dict:
    required = {MASA_OBSERVATION_REPORT_CONTRACT, "masa/0.2.0", "akouo/agent-report/v0.1"}
    if not isinstance(supported_contracts, list) or any(not isinstance(c, str) for c in supported_contracts):
        raise TypeError("Supported contracts must be a list of strings")
    if not required <= set(supported_contracts):
        raise ValueError("Required observation mapping contracts were not negotiated")
    observation = _select(record, observation_ref, validate_masa)
    source_ids = {record["id"]}
    for value in record.values():
        if isinstance(value, list):
            source_ids.update(v['id'] for v in value if isinstance(v, dict) and isinstance(v.get('id'), str))
    if report_id in source_ids or listening_pass_id in source_ids or mapping_id in source_ids:
        raise ValueError("Mapping, receiving report and pass need new identities")
    if len({mapping_id, report_id, listening_pass_id}) != 3:
        raise ValueError("Mapping, receiving report and pass need distinct identities")
    report = dict(contract="akouo/agent-report/v0.1", report_id=report_id, listener_id=listener_id,
        listening_pass_id=listening_pass_id, subject_ref=observation_ref,
        input_refs=[record["id"], observation_ref], apparatus_ref=apparatus_ref,
        report_format="structured", recipients=deepcopy(recipients), report_of_refs=[record["id"]],
        features=[], limitations=[_LIMIT])
    report["features"], projection = _project(observation, report)
    result = dict(contract=MASA_OBSERVATION_REPORT_CONTRACT, mapping_id=mapping_id,
        source_record_ref=record["id"], source_observation_ref=observation_ref, source_snapshot=deepcopy(record),
        report=report, attribution="retained_source", value_projection=projection, execution="not_requested")
    errors = contract_errors("masa-observation-report", result, schemas_dir=schemas_dir)
    errors += agent_report_errors(report, schemas_dir=schemas_dir)
    if errors:
        raise ValueError("; ".join(errors))
    return result


def masa_observation_report_errors(value: Any, *, validate_masa: Callable,
                                   schemas_dir: Path | None = None, source_record: dict | None = None) -> list[str]:
    errors = contract_errors("masa-observation-report", value, schemas_dir=schemas_dir)
    if errors:
        return errors
    if source_record is not None and json.dumps(source_record, sort_keys=True, allow_nan=False) != json.dumps(value["source_snapshot"], sort_keys=True, allow_nan=False):
        errors.append("Retained snapshot differs from the supplied original source record")
    report = value["report"]
    try:
        expected = map_masa_observation(value["source_snapshot"], value["source_observation_ref"],
            mapping_id=value["mapping_id"], report_id=report["report_id"], listener_id=report["listener_id"],
            listening_pass_id=report["listening_pass_id"], apparatus_ref=report["apparatus_ref"], recipients=report["recipients"],
            supported_contracts=[MASA_OBSERVATION_REPORT_CONTRACT, "masa/0.2.0", "akouo/agent-report/v0.1"],
            validate_masa=validate_masa, schemas_dir=schemas_dir)
    except ValueError as error:
        return [str(error)]
    # Canonical JSON comparison distinguishes booleans from numeric values.
    if json.dumps(value, sort_keys=True, separators=(",", ":")) != json.dumps(expected, sort_keys=True, separators=(",", ":")):
        errors.append("Mapping must preserve the canonical retained-source attribution")
    return errors
