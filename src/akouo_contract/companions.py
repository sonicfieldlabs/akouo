"""Opt-in, offline companion plans. No host command, model or storage execution.

Validators and resolved_refs are host trust boundaries. Keep returned plans in
host-owned storage and validate generated reports with agent_route_report_errors.
"""
from __future__ import annotations

import json
import re
from copy import deepcopy
from pathlib import Path
from typing import Callable

from . import root
from .agent_routes import plan_agent_route
from .validation import contract_errors

COMPANION_CONTRACT = "akouo/companions/v0.1"


def load_companions(*, data_root: Path | None = None) -> dict:
    return json.loads(((data_root or root()) / "companions/manifest.json").read_text())


def _checked(validate: Callable, *values) -> None:
    if not callable(validate):
        raise TypeError("A host validator is required")
    errors = validate(*(deepcopy(value) for value in values))
    if not isinstance(errors, list) or any(not isinstance(e, str) for e in errors):
        raise TypeError("Host validator must return a list of error strings")
    if errors:
        raise ValueError("; ".join(errors))


def _schema(name, value, data):
    errors = contract_errors(name, value, schemas_dir=data / "schemas")
    if errors:
        raise ValueError("; ".join(errors))


def _negotiate(request):
    if COMPANION_CONTRACT not in request.get("supported_contracts", []):
        raise ValueError("Unsupported required contract: " + COMPANION_CONTRACT)


def _pointer(record, ref):
    """Resolve the raw JSON Pointer spelling used by existing report_of_refs.

    URI percent encoding is intentionally unsupported; ambiguous spelling fails.
    """
    base, separator, pointer = ref.partition("#")
    if not separator:
        return record
    if not pointer.startswith("/") or "%" in pointer or re.search(r"~(?![01])", pointer):
        raise ValueError("Report reference requires a canonical raw JSON Pointer")
    value = record
    try:
        for token in pointer[1:].split("/"):
            token = token.replace("~1", "/").replace("~0", "~")
            if isinstance(value, list):
                if not re.fullmatch(r"0|[1-9][0-9]*", token):
                    raise ValueError("Noncanonical array index")
                value = value[int(token)]
            elif isinstance(value, dict):
                value = value[token]
            else:
                raise ValueError("Report reference traverses a scalar")
    except (KeyError, IndexError) as exc:
        raise ValueError("Unresolved retained report pointer: " + ref) from exc
    if not isinstance(value, dict):
        raise ValueError("Retained report must resolve to an object")
    return value


def _retained(request, records, validate_record):
    if not isinstance(records, dict):
        raise TypeError("Supply a host-owned record map")
    snapshots = {}
    for ref in request["report_of_refs"]:
        base = ref.split("#", 1)[0]
        if base not in records:
            raise ValueError("Missing retained source record: " + base)
        record = records[base]
        _checked(validate_record, record)
        if not isinstance(record, dict) or record.get("akousma_id", record.get("id")) != base:
            raise ValueError("Retained record identity does not match the report reference")
        _pointer(record, ref)
        snapshots[base] = deepcopy(record)
    # Receiving identities must also be fresh relative to nested source passes.
    def identities(value):
        if isinstance(value, dict):
            for key, child in value.items():
                if key in ("id", "akousma_id", "report_id", "listening_pass_id", "listening_id", "pass_id") and isinstance(child, str):
                    yield child
                yield from identities(child)
        elif isinstance(value, list):
            for child in value:
                yield from identities(child)
    if set(identities(snapshots)).intersection(request[k] for k in ("request_id", "report_id", "listening_pass_id")):
        raise ValueError("Receiving route, report and pass must be fresh relative to source identities")
    return snapshots


def plan_second_report(request: dict, access: dict, *, records: dict,
                       validate_record: Callable, validate_access: Callable,
                       data_root: Path | None = None) -> dict:
    data = data_root or root()
    _schema("agent-route-request", request, data)
    _negotiate(request)
    if request["profile"] != "second_report" or request["relation"]["of"] != "record":
        raise ValueError("Second-report input must be a retained record")
    if not request["report_of_refs"]:
        raise ValueError("Second report requires at least one retained source report")
    snapshots = _retained(request, records, validate_record)
    route = plan_agent_route(deepcopy(request), deepcopy(access), validate_access=validate_access,
        schemas_dir=data / "schemas", manifest_path=data / "agent-routes.manifest.json")
    return dict(contract=COMPANION_CONTRACT, kind="second_report", route=route,
        source_snapshots=snapshots, skill="companions/skills/second-report/SKILL.md",
        execution="not_requested")


def tags_from_matter_context(context: dict, source: dict, access: dict, *,
                            validate_context: Callable, declared_by: str) -> dict:
    """Reuse Earworm's actual context/source/access checks; retain its labels."""
    _checked(validate_context, context, source, access)
    return dict(contract=COMPANION_CONTRACT, vocabulary=context["vocabulary"],
        relation=dict(of="observation", ref=context["subject_ref"]),
        registers=deepcopy(context["registers"]), scales=deepcopy(context["scales"]),
        source_modality=deepcopy(context["source_modality"]),
        access_declaration_ref=context["access_declaration_ref"], declared_by=declared_by,
        basis_refs=[context["source_record_ref"], context["context_id"]])


def route_tags(tags: dict, request: dict, access: dict, *, validate_access: Callable,
               data_root: Path | None = None) -> dict:
    data = data_root or root()
    _schema("agent-route-request", request, data)
    _schema("route-tags", tags, data)
    _negotiate(request)
    _checked(validate_access, access)
    if (tags["relation"] != request["relation"] or tags["access_declaration_ref"] != request["apparatus_ref"]
            or access.get("contract") != "earworm/listening-access/v1"
            or access.get("subject_ref") != tags["relation"]["ref"]
            or access.get("declaration_id") != tags["access_declaration_ref"]):
        raise ValueError("Tags, represented subject and access must belong to the same route")
    evidence = tags["basis_refs"] + tags["source_modality"].get("evidence_refs", [])
    if not set(evidence) <= set(request["resolved_refs"]):
        raise ValueError("Tag basis or source-modality evidence is unresolved")
    if tags["declared_by"] not in {*request["resolved_refs"], request["listener_id"]}:
        raise ValueError("Tag annotator identity is unresolved")
    mappings = load_companions(data_root=data)["tag_modes"]
    modes, unmapped = [], []
    for axis in ("registers", "scales"):
        for label in tags[axis]:
            if label in mappings[axis]:
                modes.extend(mappings[axis][label])
            elif ":" in label:
                unmapped.append(dict(axis=axis, label=label))
            else:
                raise ValueError("Unknown core " + axis + " label: " + label)
    return dict(tags=deepcopy(tags), access_snapshot=deepcopy(access),
        suggested_modes=list(dict.fromkeys(modes)), unmapped=unmapped,
        authority="selection_only")


def plan_ear_route(selection: dict, request: dict, access: dict, *, validate_access: Callable,
                   spectral_request: dict | None = None, tags: dict | None = None,
                   records: dict | None = None, validate_record: Callable | None = None,
                   validate_human_account: Callable | None = None,
                   validate_retention: Callable | None = None,
                   data_root: Path | None = None) -> dict:
    """Compose released skills and preserve the existing route permission gate.

    Human validator takes (record, pointer, subject_ref); retention validator
    takes (policy_ref, subject_ref). Both must resolve host-owned evidence/policy.
    A retention selection is a future host requirement, never a storage action.
    """
    data = data_root or root()
    _schema("ear-selection", selection, data)
    _schema("agent-route-request", request, data)
    _negotiate(request)
    manifest = load_companions(data_root=data)
    ear = manifest["ears"][selection["ear"]]
    if request["relation"]["of"] not in ear["relation_of"] or request["profile"] not in ear["profiles"]:
        raise ValueError("Selected ear does not support this route profile or input type")
    if selection["ear"] == "sent_sound":
        if not selection.get("selected_preset"):
            raise ValueError("Sent sound requires an explicitly selected existing preset")
        preset_ids = [selection["selected_preset"]]
    else:
        if "selected_preset" in selection:
            raise ValueError("Only sent sound accepts a selected preset")
        preset_ids = ear["presets"]
    presets = {p["id"]: p for p in json.loads((data / "presets/presets.json").read_text())["presets"]}
    if any(p not in presets for p in preset_ids):
        raise ValueError("Unknown existing preset")
    if "extended-spectrum" in preset_ids and request["profile"] != "beyond":
        raise ValueError("Extended-spectrum selection requires the beyond route gate")
    retention = selection["retention"]
    if retention["mode"] == "policy":
        if retention["policy_ref"] not in request["resolved_refs"]:
            raise ValueError("Retention policy is unresolved")
        _checked(validate_retention, retention["policy_ref"], request["relation"]["ref"])
    human_ref = selection.get("human_account_ref")
    if human_ref is not None:
        if selection["ear"] != "room" or human_ref not in request["report_of_refs"]:
            raise ValueError("Room human account must be a separately retained report input")
        base = human_ref.split("#", 1)[0]
        if records is None or base not in records:
            raise ValueError("Missing retained human account")
        _checked(validate_human_account, records[base], human_ref, request["relation"]["ref"])
    if request["profile"] == "second_report":
        if spectral_request is not None:
            raise ValueError("Only the beyond profile consumes a spectral request")
        second = plan_second_report(request, access, records=records, validate_record=validate_record,
            validate_access=validate_access, data_root=data)
        route, snapshots = second["route"], second["source_snapshots"]
    else:
        snapshots = _retained(request, records, validate_record) if request["report_of_refs"] else {}
        route = plan_agent_route(deepcopy(request), deepcopy(access), validate_access=validate_access,
            spectral_request=deepcopy(spectral_request), schemas_dir=data / "schemas",
            manifest_path=data / "agent-routes.manifest.json")
    tag_plan = route_tags(tags, request, access, validate_access=validate_access, data_root=data) if tags is not None else None
    # Selection adds existing skill modes, never permissions or perception results.
    modes = list(ear["leading_modes"])
    for preset_id in preset_ids:
        modes.extend(item["mode"] for item in presets[preset_id]["mode_chain"])
    modes.extend(route["mode_chain"])
    if tag_plan:
        modes.extend(tag_plan["suggested_modes"])
    route["mode_chain"] = list(dict.fromkeys(modes))
    _schema("agent-route-result", route, data)
    return dict(contract=COMPANION_CONTRACT, kind="ear_route", selection=deepcopy(selection),
        preset_refs=preset_ids, route=route, tag_plan=tag_plan, source_snapshots=snapshots,
        execution="not_requested")


def companion_bundle_errors(*, data_root: Path | None = None) -> list[str]:
    """Check portable asset links and reuse of installed skills/presets."""
    data = data_root or root()
    manifest = load_companions(data_root=data)
    errors = contract_errors("companions-manifest", manifest, schemas_dir=data / "schemas")
    if errors:
        return errors
    presets = {p["id"] for p in json.loads((data / "presets/presets.json").read_text())["presets"]}
    modes = []
    for ear in manifest["ears"].values():
        if not set(ear["presets"]) <= presets:
            errors.append("Unknown released preset")
        modes.extend(ear["leading_modes"])
    for axis in manifest["tag_modes"].values():
        for chain in axis.values():
            modes.extend(chain)
    for mode in modes:
        if not (data / "skills" / mode / "SKILL.md").is_file():
            errors.append("Missing existing skill: " + mode)
    for path in manifest["assets"]:
        if not (data / path).is_file():
            errors.append("Missing companion asset: " + path)
    return errors
