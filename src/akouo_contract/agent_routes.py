"""Opt-in route planning over existing skills; no model or action execution."""
from __future__ import annotations

import json
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from . import root
from .agent_report import agent_report_errors
from .spectral_gate import extended_spectrum_decision
from .validation import contract_errors

AGENT_ROUTE_CONTRACT = "akouo/agent-route/v0.1"


def load_agent_routes(*, manifest_path: Path | None = None) -> dict:
    return json.loads((manifest_path or root() / "agent-routes.manifest.json").read_text())


def _validator_errors(validate: Callable, value: Any) -> list[str]:
    if not callable(validate):
        raise TypeError("A negotiated host validator is required")
    errors = validate(value)
    if not isinstance(errors, list) or any(not isinstance(e, str) for e in errors):
        raise TypeError("Host validator must return a list of error strings")
    return errors


def plan_agent_route(request: dict, access: dict, *, validate_access: Callable,
                     spectral_request: dict | None = None, schemas_dir: Path | None = None,
                     manifest_path: Path | None = None) -> dict:
    errors = contract_errors("agent-route-request", request, schemas_dir=schemas_dir)
    if errors:
        raise ValueError("; ".join(errors))
    manifest = load_agent_routes(manifest_path=manifest_path)
    profile = manifest["profiles"][request["profile"]]
    missing = set(profile["required_contracts"]) - set(request["supported_contracts"])
    if missing:
        raise ValueError("Unsupported required contracts: " + ", ".join(sorted(missing)))
    retained_ids = set(request["input_refs"] + request["report_of_refs"])
    retained_ids.update(ref.split("#", 1)[0] for ref in request["report_of_refs"])
    new_ids = [request["request_id"], request["listening_pass_id"], request["report_id"]]
    if len(set(new_ids)) != len(new_ids) or retained_ids.intersection(new_ids):
        raise ValueError("Route, receiving pass and report require distinct new identities")
    permissions = dict(heard_allowed=False, measured_allowed=False, inferred_allowed=True,
                       interpreted_allowed=True, speculative_allowed=False, must_include_undetermined=True)
    reasons = []
    relation = request["relation"]
    if relation["of"] not in profile["relation_of"]:
        reasons.append("The selected profile does not accept this subject type")
    if request["profile"] == "second_report" and relation["ref"] not in {ref.split("#", 1)[0] for ref in request["report_of_refs"]}:
        reasons.append("A second report must reference its retained subject record")
    if any(ref not in request["input_refs"] and ref.split("#", 1)[0] not in request["input_refs"] for ref in request["report_of_refs"]):
        reasons.append("Retained reports must be declared inputs")
    required = {relation["ref"], request["apparatus_ref"], *(r["id"] for r in request["recipients"]), *request["input_refs"], *request["report_of_refs"]}
    if required - set(request["resolved_refs"]):
        reasons.append("Unresolved subject, input, recipient or apparatus references")
    errors = _validator_errors(validate_access, access)
    if errors:
        reasons.append("Invalid access declaration: " + "; ".join(errors))
    elif access.get("contract") != "earworm/listening-access/v1":
        reasons.append("Unsupported access contract")
    elif (access["declaration_id"] != request["apparatus_ref"] or access["subject_ref"] != relation["ref"]):
        reasons.append("Apparatus declaration does not belong to this subject and route")
    if not errors and access.get("contract") == "earworm/listening-access/v1" and relation["of"] == "representation":
        model = access["model_input"]
        if model["status"] != "known":
            if set(request["requested_categories"]) != {"undetermined"}:
                reasons.append("Represented-signal interpretation requires a declared effective model input")
        else:
            if model["representation_ref"] not in request["input_refs"]:
                reasons.append("Effective model representation must be a declared route input")
            if not set(model["evidence_refs"] + model["preprocessing_refs"]) <= set(request["resolved_refs"]):
                reasons.append("Effective model-input evidence is unresolved")
    assessment = None
    if request["profile"] == "beyond":
        if spectral_request is None:
            reasons.append("Beyond-band routing requires an explicit spectral request")
        else:
            assessment = extended_spectrum_decision(access, spectral_request, actor=request["listener_id"],
                validate_access=validate_access, schemas_dir=schemas_dir)
            if spectral_request["subject_ref"] != relation["ref"]:
                reasons.append("Spectral request does not match the route subject")
            if not set(spectral_request["resolved_refs"]) <= set(request["resolved_refs"]):
                reasons.append("Spectral evidence is outside the route's resolved scope")
            if not errors and access.get("model_input", {}).get("status") == "known":
                if access["model_input"]["representation_ref"] not in request["input_refs"]:
                    reasons.append("Effective spectral input must be a declared route input")
            permissions["measured_allowed"] = assessment["measurement_permitted"]
            if assessment["support"] != "supported":
                permissions["inferred_allowed"] = False
                permissions["interpreted_allowed"] = bool(request["report_of_refs"])
            # Unsupported bands can support only explicitly attributed report
            # interpretation, not deductions about unobserved physical features.
    elif spectral_request is not None:
        raise ValueError("Only the beyond profile consumes a spectral request")
    overrides = request.get("permission_overrides", {})
    for key, value in overrides.items():
        if key == "must_include_undetermined":
            if not value:
                reasons.append("Undetermined evidence cannot be suppressed by an override")
        elif value and not permissions[key]:
            reasons.append(f"Permission override cannot widen {key}")
        else:
            permissions[key] = value
    for category in request["requested_categories"]:
        if category != "undetermined" and not permissions[f"{category}_allowed"]:
            reasons.append(f"Requested {category} category is not permitted by this route")
    if reasons:
        for key in permissions:
            if key != "must_include_undetermined":
                permissions[key] = False
    decision = dict(id=request["request_id"] + ":route", gate="inference",
        outcome="abstain" if reasons else "proceed", subject=relation["ref"],
        reason="; ".join(reasons) if reasons else "Declared inputs support this bounded report route; no result or action has been executed.",
        decided_at=datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        authority=dict(mode="observe_only", actor=request["listener_id"], requires_confirmation=True, reversible=True))
    result = dict(contract=AGENT_ROUTE_CONTRACT, request=deepcopy(request), mode_chain=profile["chain"],
        claim_permissions=permissions, decision=decision, spectral_assessment=assessment, execution="not_requested")
    errors = contract_errors("agent-route-result", result, schemas_dir=schemas_dir)
    if errors:
        raise ValueError("; ".join(errors))
    return result


def agent_route_report_errors(report: Any, route: dict, *, measurement_refs: list[str] | None = None,
                              schemas_dir: Path | None = None) -> list[str]:
    """Bind output to a retained host-generated route and validated measurement scope.

    The host must retain the route as produced; an editable route is not authority.
    This does not verify the truth of evidence or grant execution permission.
    """
    errors = contract_errors("agent-route-result", route, schemas_dir=schemas_dir)
    errors += agent_report_errors(report, schemas_dir=schemas_dir)
    if errors:
        return errors
    if measurement_refs is not None and (not isinstance(measurement_refs, list) or
            any(not isinstance(ref, str) or not ref for ref in measurement_refs)):
        raise TypeError("Measurement references must be a list of nonempty strings")
    req = route["request"]
    if route["decision"]["outcome"] != "proceed":
        errors.append("The route did not permit a report")
    for field in ("report_id", "listener_id", "listening_pass_id", "input_refs", "apparatus_ref", "recipients", "report_of_refs"):
        if report[field] != req[field]:
            errors.append(f"{field}: report must match the retained route")
    if report["subject_ref"] != req["relation"]["ref"]:
        errors.append("subject_ref: report must match the routed subject")
    has_undetermined = False
    measurements = set(measurement_refs or [])
    available = set(req["resolved_refs"]) | measurements
    for feature in report["features"]:
        category = feature["category"]
        has_undetermined |= category == "undetermined"
        if category != "undetermined" and not route["claim_permissions"][f"{category}_allowed"]:
            errors.append(f"{category}: feature exceeds route permissions")
        if category not in req["requested_categories"] and category != "undetermined":
            errors.append(f"{category}: feature was not requested")
        evidence = set(feature["claim"]["evidence_refs"])
        if not evidence <= available:
            errors.append("Feature evidence is unresolved in the route/output scope")
        retained_interpretation = req["profile"] == "second_report" or (
            req["profile"] == "beyond" and route["spectral_assessment"] is not None
            and route["spectral_assessment"]["support"] != "supported")
        if retained_interpretation and category in ("interpreted", "inferred") and not evidence.intersection(set(req["report_of_refs"]) | {ref.split("#", 1)[0] for ref in req["report_of_refs"]}):
            errors.append("Inherited interpretation must cite a retained source report")
        if category == "measured" and not evidence.intersection(measurements):
            errors.append("Measured output requires separately validated measurement evidence")
    if route["claim_permissions"]["must_include_undetermined"] and not has_undetermined:
        errors.append("The report must explicitly include an undetermined claim")
    return errors
