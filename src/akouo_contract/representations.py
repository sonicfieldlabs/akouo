"""Opt-in representation routing. Earworm owns the input and output records."""
from __future__ import annotations

from copy import deepcopy
import json
from pathlib import Path
from typing import Any

from . import root
from .validation import contract_errors

REPRESENTATION_ROUTE_CONTRACT = "akouo/representation-route/v1"
REPRESENTATION_OUTPUT_CONTRACT = "akouo/representation-output/v1"


def load_representation_routes(*, manifest_path: Path | None = None) -> dict:
    path = manifest_path or root() / "representation-routes.manifest.json"
    return json.loads(path.read_text())


def _host_errors(validate, value):
    if not callable(validate):
        raise TypeError("A negotiated host validator is required")
    result = validate(deepcopy(value))
    if not isinstance(result, list) or any(not isinstance(e, str) for e in result):
        raise TypeError("Host validator must return a list of error strings")
    return result


def _input_snapshot(request, record):
    reps = {r["representation_id"]: r for r in record["representations"]}
    accesses = {a["access_id"]: a for a in record["accesses"]}
    bindings = {b["binding_id"]: b for b in record["binding_refs"]}
    result = []
    for key in request["input_access_refs"]:
        access = accesses.get(key)
        if not access or access["status"] != "available":
            continue
        source = reps[access["representation_ref"]]
        received = reps[access["received_representation_ref"]]
        result.append(dict(access_ref=key, source_ref=source["representation_id"],
                           received_ref=received["representation_id"], source_sha256=source["artifact"].get("sha256"),
                           sha256=received["artifact"]["sha256"], byte_count=received["artifact"]["byte_count"],
                           role=access["role"], coverage=deepcopy(access["coverage"]),
                           terms=deepcopy(received["terms"]),
                           binding=deepcopy(bindings.get(access.get("binding_ref")))))
    return result


def plan_representation_route(request: Any, record: Any, capabilities: Any, *,
                              validate_record, measurements=None, validate_measurement=None,
                              manifest_path=None, schemas_dir=None) -> dict:
    """Plan over an admitted declaration. No bytes, model or policy are executed.

    The host must first admit the actual material and any instruction bindings.
    Supplying schema-valid metadata alone is not an execution authorization.
    """
    errors = contract_errors("representation-route-request", request, schemas_dir=schemas_dir)
    errors += contract_errors("representation-capabilities", capabilities, schemas_dir=schemas_dir)
    errors += _host_errors(validate_record, record)
    if errors:
        raise ValueError("; ".join(errors))
    if not isinstance(record, dict) or record.get("contract") != "earworm/representation-record/v1":
        raise ValueError("Unsupported representation-record contract")
    measurements = [] if measurements is None else measurements
    if not isinstance(measurements, list):
        raise TypeError("Measurements must be a list")
    for measurement in measurements:
        errors.extend(_host_errors(validate_measurement, measurement))
        if not isinstance(measurement, dict) or measurement.get("contract") != "earworm/representation-measurement/v1":
            errors.append("Unsupported representation-measurement contract")
    if errors:
        raise ValueError("; ".join(errors))
    indexed_measurements = {m["measurement_id"]: m for m in measurements}
    if len(indexed_measurements) != len(measurements):
        raise ValueError("Duplicate measurement identity")
    required = set(load_representation_routes(manifest_path=manifest_path)["required_contracts"])
    for declared in (request["supported_contracts"], capabilities["supported_contracts"]):
        missing = required - set(declared)
        if missing:
            raise ValueError("Unsupported required contracts: " + ", ".join(sorted(missing)))
    accesses = {a["access_id"]: a for a in record["accesses"]}
    reps = {r["representation_id"]: r for r in record["representations"]}
    reasons = []
    permissions = dict(heard_allowed=False, measured_allowed=False, inferred_allowed=True,
                       interpreted_allowed=True, speculative_allowed=True,
                       must_include_undetermined=request["output_kind"] == "account")
    if request["operation_ref"] != record["operation_ref"]:
        reasons.append("The route must identify the declared operation")
    if request["request_id"] in set(accesses) | set(reps) | {record["record_ref"], record["operation_ref"]}:
        reasons.append("The route requires a distinct request identity")
    if request["primary_access_ref"] not in request["input_access_refs"]:
        reasons.append("The primary access must be a declared input")
    primary = accesses.get(request["primary_access_ref"])
    if not primary or primary["role"] not in {"subject", "score", "work"}:
        reasons.append("Primary input must be subject, score or work; context cannot activate itself")
    conventions = {(c["id"], c["revision"]) for c in capabilities["conventions"]}
    received = []
    for key in request["input_access_refs"]:
        access = accesses.get(key)
        if not access or access["status"] != "available":
            reasons.append("Required access is unavailable: " + key)
            continue
        rep = reps[access["received_representation_ref"]]
        received.append(rep["representation_id"])
        if rep["form"] not in capabilities["input_forms"]:
            reasons.append("Unsupported input representation: " + rep["form"])
        convention = rep["convention"]
        if convention["status"] == "unknown":
            reasons.append("The reading convention is unknown")
        elif convention["status"] == "declared" and (convention["id"], convention["revision"]) not in conventions:
            reasons.append("Unsupported reading convention: " + convention["id"])
    received = list(dict.fromkeys(received))
    if request["output_form"] not in capabilities["output_forms"]:
        reasons.append("Unsupported output representation: " + request["output_form"])
    if request["intent"] == "sound" and request["output_kind"] != "work":
        reasons.append("Sounding must produce a work rather than a prompt or account")
    if request["intent"] in {"listen", "relisten"} and request["output_kind"] != "account":
        reasons.append("Listening must produce an account")
    if (request["intent"] == "relisten") != ("return" in record):
        reasons.append("Re-listening requires its explicit return basis")
    measured_scope = []
    for key in request["measurement_refs"]:
        measurement = indexed_measurements.get(key)
        if not measurement or measurement["representation_ref"] not in received:
            reasons.append("Measurement is unresolved or outside the actual supplied representation: " + key)
        else:
            measured_scope.append({k: measurement[k] for k in ("measurement_id", "representation_ref", "method_ref")})
    permissions["measured_allowed"] = bool(measured_scope)
    for category in request["requested_categories"]:
        if category != "undetermined" and not permissions[category + "_allowed"]:
            reasons.append("Requested claim category is unsupported: " + category)
    if reasons:
        permissions.update({key: False for key in permissions if key != "must_include_undetermined"})
    result = dict(contract=REPRESENTATION_ROUTE_CONTRACT, request=deepcopy(request),
                  capabilities=deepcopy(capabilities), record_ref=record["record_ref"], received_refs=received,
                  input_snapshot=_input_snapshot(request, record),
                  measurement_scope=measured_scope, claim_permissions=permissions,
                  decision=dict(id=request["request_id"] + ":route", outcome="abstain" if reasons else "proceed", reasons=reasons),
                  execution="not_requested")
    errors = contract_errors("representation-route-result", result, schemas_dir=schemas_dir)
    if errors:
        raise ValueError("; ".join(errors))
    return result


def representation_output_errors(value: Any, route: Any, record: Any, *, validate_record,
                                 schemas_dir=None) -> list[str]:
    """Bind a produced output to the host-retained route and actual inputs.

    The host retains the route immutably; this library does not turn an editable
    declaration into authority or verify the truth of a free-text statement.
    """
    errors = contract_errors("representation-output", value, schemas_dir=schemas_dir)
    errors += contract_errors("representation-route-result", route, schemas_dir=schemas_dir)
    errors += _host_errors(validate_record, record)
    if errors:
        return errors
    if not isinstance(record, dict) or record.get("contract") != "earworm/representation-record/v1":
        return ["Unsupported representation-record contract"]
    request = route["request"]
    if route["decision"]["outcome"] != "proceed":
        errors.append("The retained route did not admit an output")
    if value["route_ref"] != route["decision"]["id"] or value["operation_ref"] != request["operation_ref"]:
        errors.append("Output must identify the retained route and operation")
    if record["record_ref"] != route["record_ref"] or record["operation_ref"] != request["operation_ref"]:
        errors.append("Output record must belong to the routed operation")
    output = next((o for o in record["outputs"] if o["output_id"] == value["output_ref"]), None)
    if output is None:
        return errors + ["Output identity is unresolved"]
    if output["kind"] != request["output_kind"] or output["completion"] != "complete":
        errors.append("Output kind and completion must match the requested result")
    reps = {r["representation_id"]: r for r in record["representations"]}
    if reps[output["representation_ref"]]["form"] != request["output_form"]:
        errors.append("Output representation differs from the requested form")
    if output["input_access_refs"] != request["input_access_refs"]:
        errors.append("Output must retain the route's input access scope")
    accesses = {a["access_id"]: a for a in record["accesses"]}
    actual = list(dict.fromkeys(accesses[k]["received_representation_ref"] for k in request["input_access_refs"]
                               if k in accesses and accesses[k]["status"] == "available"))
    if actual != route["received_refs"]:
        errors.append("Actual supplied representations differ from the retained route")
    if _input_snapshot(request, record) != route["input_snapshot"]:
        errors.append("Input bytes, source identity, role or coverage changed after routing")
    ids = [claim["claim_id"] for claim in value["claims"]]
    if len(set(ids)) != len(ids):
        errors.append("Duplicate claim identity")
    measurements = {m["measurement_id"]: m for m in route["measurement_scope"]}
    for claim in value["claims"]:
        category = claim["category"]
        if claim["representation_ref"] not in route["received_refs"]:
            errors.append("Claim subject is outside the actual supplied representation")
        if category != "undetermined" and (not route["claim_permissions"][category + "_allowed"] or category not in request["requested_categories"]):
            errors.append("Claim exceeds the retained route's permissions")
        if not set(claim["evidence_refs"]) <= set(route["received_refs"]) | set(measurements):
            errors.append("Claim evidence is outside the retained route scope")
        if category == "measured":
            measurement = measurements.get(claim.get("measurement_ref"))
            if not measurement or measurement["representation_ref"] != claim["representation_ref"] or measurement["measurement_id"] not in claim["evidence_refs"]:
                errors.append("Measured claim requires separately validated evidence for this representation")
        elif "measurement_ref" in claim:
            errors.append("Measurement reference belongs to a measured claim")
    if output["kind"] == "account" and not any(c["category"] == "undetermined" for c in value["claims"]):
        errors.append("A listening account must keep an explicit undetermined claim")
    return errors
