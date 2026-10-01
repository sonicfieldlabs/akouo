"""Offline validation of the opt-in structured agent report contract."""
from __future__ import annotations

from pathlib import Path
from typing import Any
from .validation import contract_errors

AGENT_REPORT_CONTRACT = "akouo/agent-report/v0.1"


def agent_report_errors(value: Any, *, schemas_dir: Path | None = None) -> list[str]:
    """Use bundled schemas only; unresolved references never trigger network IO.

    This checks report-local references. The consuming application must resolve
    the subject, inputs, apparatus declaration, recipients, and cited evidence.
    """
    errors = contract_errors("agent-report", value, schemas_dir=schemas_dir)
    if errors:
        return errors
    for label, items, key in (("features", value["features"], "feature_id"),
                              ("claims", [feature["claim"] for feature in value["features"]], "claim_id"),
                              ("recipients", value["recipients"], "id")):
        identifiers = [item[key] for item in items]
        if len(set(identifiers)) != len(identifiers):
            errors.append(f"{label}: duplicate {key}")
    for index, feature in enumerate(value["features"]):
        claim = feature["claim"]
        if claim["listening_pass_id"] != value["listening_pass_id"]:
            errors.append(f"features/{index}/claim/listening_pass_id: must match report pass")
        window = claim.get("time_range")
        if window is not None and window["start_s"] > window["end_s"]:
            errors.append(f"features/{index}/claim/time_range: end precedes start")
    if value["report_id"] in value["report_of_refs"]:
        errors.append("report_of_refs: a report cannot be its own input report")
    return errors
