"""Opt-in LISTENING.md authoring and scoped lifecycle. No owner I/O or model execution.

The host authenticates authority, clocks, scope paths, source resolution and gate
facts, and atomically persists each returned state. An application records supplied
context and a checked gate; it does not certify a model's adherence to prose.
"""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
from typing import Any

from . import root
from .validation import contract_errors

MAX_DOCUMENT_BYTES = 1_048_576
DEFAULT_CONTEXT_BYTES = 65_536
GRAMMAR = "akouo/listening-controls/v1"
SCOPE_ORDER = ("workspace", "workflow", "swarm", "run", "invocation")
LISTENING_CONTRACTS = tuple("akouo/" + name + "/v1" for name in (
    "listening-document", "listening-profile", "listening-capabilities",
    "listening-adoption", "listening-lifecycle-event", "listening-application", "listening-state",
))
_TARGETS = {
    "input.form": ("input", "values"),
    "input.source_ref": ("input", "values"),
    "input.role": ("input", "values"),
    "execution.provider_ref": ("execution", "values"),
    "execution.action": ("execution", "values"),
    "execution.consent_refs": ("execution", "refs"),
    "execution.turn_count": ("execution", "number"),
    "execution.participant_refs": ("execution", "values"),
    "output.kind": ("output", "values"),
    "output.form": ("output", "values"),
    "retention.target": ("retention", "values"),
    "retention.consent_refs": ("retention", "refs"),
    "disclosure.destination": ("disclosure", "values"),
    "disclosure.consent_refs": ("disclosure", "refs"),
}
SUPPORTED_CONTROLS = tuple(sorted(
    f"{gate}:{target}:{operator}"
    for target, (gate, kind) in _TARGETS.items()
    for operator in ({"values": ("allow_values", "deny_values"),
                      "number": ("max_value",), "refs": ("require_refs",)}[kind])
))
_ENUM_VALUES = {
    "input.form": {"text", "audio", "notation", "midi", "data", "morse", "glyphs", "code", "other"},
    "input.role": {"subject", "account", "context", "instruction", "score", "work"},
    "execution.action": {"listen", "sound", "relisten"},
    "output.kind": {"account", "work", "prompt", "event_log"},
    "output.form": {"text", "audio", "notation", "midi", "data", "morse", "glyphs", "code", "other"},
}


def _canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8")


def _check(name, value, schemas_dir=None):
    errors = contract_errors(name, value, schemas_dir=schemas_dir)
    if errors:
        raise ValueError("; ".join(errors))


def _time(value: str) -> datetime:
    if not isinstance(value, str):
        raise ValueError("A UTC timestamp is required")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        raise ValueError("A UTC timestamp is required") from None
    if parsed.tzinfo is None or parsed.utcoffset() != timezone.utc.utcoffset(parsed):
        raise ValueError("A UTC timestamp is required")
    return parsed


def _bytes(value: bytes) -> bytes:
    if not isinstance(value, bytes):
        raise TypeError("Exact UTF-8 bytes are required")
    if not value or len(value) > MAX_DOCUMENT_BYTES or b"\0" in value:
        raise ValueError("Document must be nonempty, NUL-free and within the explicit byte limit")
    try:
        value.decode("utf-8")
    except UnicodeDecodeError:
        raise ValueError("Document must be valid UTF-8") from None
    return value


def _scope(path):
    if not isinstance(path, list) or not path:
        raise ValueError("A scope path is required")
    ranks = []
    for part in path:
        if not isinstance(part, dict) or set(part) != {"kind", "ref"} or part["kind"] not in SCOPE_ORDER or not isinstance(part["ref"], str) or not part["ref"]:
            raise ValueError("Invalid scope path")
        ranks.append(SCOPE_ORDER.index(part["kind"]))
    if ranks != sorted(set(ranks)):
        raise ValueError("Scopes must follow workspace/workflow/swarm/run/invocation order")


def _prefix(parent, child):
    return len(parent) <= len(child) and parent == child[:len(parent)]


def create_document(material: bytes, *, document_id: str, revision_ref: str, representation_ref: str,
                    artifact_ref: str, authors: list[str], authored_at: str, terms_ref: str,
                    purpose="orientation", previous=None, expected_sha256=None, fork=False,
                    schemas_dir=None) -> dict:
    """Freeze metadata for exact bytes. Revising or forking adopts nothing."""
    material = _bytes(material)
    _time(authored_at)
    lineage = []
    if previous is not None:
        _check("listening-document", previous, schemas_dir)
        if expected_sha256 != previous["sha256"]:
            raise ValueError("Document revision conflict")
        if revision_ref == previous["revision_ref"] or representation_ref == previous["representation_ref"]:
            raise ValueError("A revision needs new revision and representation identities")
        if fork == (document_id == previous["document_id"]):
            raise ValueError("A fork needs a new document identity; a revision preserves it")
        if _time(authored_at) < _time(previous["authored_at"]):
            raise ValueError("A revision cannot precede its parent")
        lineage = [dict(kind="fork_of" if fork else "revision_of", revision_ref=previous["revision_ref"], sha256=previous["sha256"])]
    elif expected_sha256 is not None or fork:
        raise ValueError("A revision or fork requires its parent document")
    document = dict(contract=LISTENING_CONTRACTS[0], document_id=document_id, revision_ref=revision_ref,
                    representation_ref=representation_ref, artifact_ref=artifact_ref,
                    sha256=sha256(material).hexdigest(), byte_count=len(material), encoding="utf-8",
                    authors=deepcopy(authors), authored_at=authored_at, purpose=purpose,
                    lineage=lineage, terms_ref=terms_ref)
    _check("listening-document", document, schemas_dir)
    return document


def _control_key(control):
    return f"{control['gate']}:{control['target']}:{control['operator']}"


def _known_control(control):
    return _control_key(control) in SUPPORTED_CONTROLS


def _control_shape(control):
    if not _known_control(control):
        return
    parameter = {"allow_values": "values", "deny_values": "values", "max_value": "limit", "require_refs": "refs"}[control["operator"]]
    if set(control) != {"control_id", "gate", "target", "operator", "required", parameter}:
        raise ValueError("Supported control requires its exact parameter shape")
    if parameter == "values" and control["target"] in _ENUM_VALUES:
        if not set(control["values"]) <= _ENUM_VALUES[control["target"]]:
            raise ValueError("Unsupported value for the control target")
    if parameter == "limit" and control["target"] == "execution.turn_count" and type(control["limit"]) is not int:
        raise ValueError("A turn limit must be a nonnegative integer")


def _strict_object(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            raise ValueError("Duplicate key in the control envelope")
        value[key] = item
    return value


def _envelope(material):
    """Find a top-level Markdown fence; fences inside another fence are material."""
    lines = material.splitlines(keepends=True)
    offsets = [0]
    for line in lines:
        offsets.append(offsets[-1] + len(line))
    active = None
    envelopes = []
    for index, line in enumerate(lines):
        text = line.decode("utf-8").rstrip("\r\n")
        match = re.fullmatch(r" {0,3}(`{3,}|~{3,})(.*)", text)
        if active is None:
            if match:
                fence, info = match.groups()
                if fence[0] == "`" and "`" in info:
                    continue
                active = (index, fence[0], len(fence), info.strip())
        elif match and match[1][0] == active[1] and len(match[1]) >= active[2] and not match[2].strip():
            start, _, _, info = active
            if info.startswith("listening-controls"):
                if info != "listening-controls-v1":
                    raise ValueError("Unsupported listening control grammar")
                body = b"".join(lines[start + 1:index]).decode("utf-8")
                value = json.loads(body, object_pairs_hook=_strict_object,
                                   parse_constant=lambda _: (_ for _ in ()).throw(ValueError("Nonfinite control value")))
                envelopes.append((offsets[start], offsets[index + 1], value))
            active = None
    if active and active[3].startswith("listening-controls"):
        raise ValueError("Unclosed listening control envelope")
    if len(envelopes) > 1:
        raise ValueError("Only one control envelope may be adopted")
    return envelopes[0] if envelopes else None


def compile_profile(document: dict, material: bytes, *, schemas_dir=None) -> dict:
    """Preserve all prose; parse only the explicitly labelled opt-in envelope."""
    _check("listening-document", document, schemas_dir)
    material = _bytes(material)
    if sha256(material).hexdigest() != document["sha256"] or len(material) != document["byte_count"]:
        raise ValueError("Complete document bytes do not match the frozen revision")
    _time(document["authored_at"])
    ancestors = [item["revision_ref"] for item in document["lineage"]]
    if document["revision_ref"] in ancestors or len(ancestors) != len(set(ancestors)):
        raise ValueError("Document lineage requires distinct prior revision references")
    envelope = _envelope(material)
    controls = []
    context = dict(policy="full", max_bytes=DEFAULT_CONTEXT_BYTES)
    intervals = [(0, len(material))]
    if envelope:
        start, end, value = envelope
        if not isinstance(value, dict) or set(value) - {"grammar", "controls", "context"} or value.get("grammar") != GRAMMAR or not isinstance(value.get("controls"), list):
            raise ValueError("Invalid explicit control envelope")
        controls = deepcopy(value["controls"])
        context = deepcopy(value.get("context", context))
        intervals = [(a, b) for a, b in ((0, start), (end, len(material))) if a < b]
    spans = [dict(commitment_ref=f"{document['revision_ref']}:commitment:{i}", range=dict(start=a, end=b),
                  sha256=sha256(material[a:b]).hexdigest()) for i, (a, b) in enumerate(intervals)]
    body = dict(contract=LISTENING_CONTRACTS[1], revision_ref=document["revision_ref"],
                document_sha256=document["sha256"], document_record_sha256=sha256(_canonical(document)).hexdigest(),
                parser=GRAMMAR, controls=controls,
                commitment_spans=spans, context=context)
    digest = sha256(_canonical(body)).hexdigest()
    profile = dict(body, profile_ref="sha256:" + digest, sha256=digest)
    _check("listening-profile", profile, schemas_dir)
    ids = [control["control_id"] for control in controls]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate control identity")
    for control in controls:
        _control_shape(control)
    return profile


def load_listening_presets(*, directory=None, schemas_dir=None) -> dict:
    """Read packaged examples, verifying full document and profile identities."""
    directory = root() if directory is None else Path(directory)
    manifest = json.loads((directory / "listening-profiles.manifest.json").read_text(encoding="utf-8"))
    if (manifest.get("contract") != "akouo/listening-profiles/v1" or
            manifest.get("required_contracts") != list(LISTENING_CONTRACTS) or
            manifest.get("grammar") != GRAMMAR or manifest.get("scope_order") != list(SCOPE_ORDER) or
            manifest.get("max_document_bytes") != MAX_DOCUMENT_BYTES or
            manifest.get("default_context_bytes") != DEFAULT_CONTEXT_BYTES):
        raise ValueError("Unsupported preset catalog")
    ids = set()
    for item in manifest["presets"]:
        if item["id"] in ids:
            raise ValueError("Duplicate preset identity")
        ids.add(item["id"])
        path = Path(item["directory"])
        if path.is_absolute() or ".." in path.parts:
            raise ValueError("Preset must be inside the packaged data root")
        folder = directory / path
        document = json.loads((folder / "document.json").read_text(encoding="utf-8"))
        profile = json.loads((folder / "profile.json").read_text(encoding="utf-8"))
        if (compile_profile(document, (folder / "LISTENING.md").read_bytes(), schemas_dir=schemas_dir) != profile or
                item["document_sha256"] != document["sha256"] or item["revision_ref"] != document["revision_ref"] or
                item["profile_ref"] != profile["profile_ref"] or item["profile_sha256"] != profile["sha256"]):
            raise ValueError("Preset catalog revision mismatch")
    if ids != {"minimal", "research", "phantom-acoustics", "covenant", "swarm"}:
        raise ValueError("The canonical catalog must contain all five directions")
    return manifest


def empty_state() -> dict:
    return dict(contract=LISTENING_CONTRACTS[-1], generation=0, adoptions=[], events=[], applications=[])


def _end(state, adoption):
    ends = [_time(adoption["expires_at"])] if "expires_at" in adoption else []
    ends.extend(_time(event["effective_at"]) for event in state["events"]
                if event["adoption_ref"] == adoption["adoption_ref"] and event["action"] in {"replace", "revoke"})
    return min(ends) if ends else datetime.max.replace(tzinfo=timezone.utc)


def _active(state, adoption, at):
    activated = any((e["action"] == "adopt" and e["adoption_ref"] == adoption["adoption_ref"]) or
                    (e["action"] == "replace" and e["replacement_ref"] == adoption["adoption_ref"]) for e in state["events"])
    return activated and _time(adoption["effective_at"]) <= _time(at) < _end(state, adoption)


def state_errors(state: Any, *, schemas_dir=None) -> list[str]:
    """Check imported lifecycle shape, references and immutable interval semantics."""
    errors = contract_errors("listening-state", state, schemas_dir=schemas_dir)
    if errors:
        return errors
    try:
        adoptions = {a["adoption_ref"]: a for a in state["adoptions"]}
        ids = [a["adoption_ref"] for a in state["adoptions"]] + [e["event_ref"] for e in state["events"]] + [a["application_ref"] for a in state["applications"]]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate lifecycle identity")
        if state["generation"] != len(state["events"]) + len(state["applications"]):
            raise ValueError("State generation does not match its immutable entries")
        entries = [(e["generation"], _time(e["recorded_at"])) for e in state["events"]]
        entries += [(a["generation"], _time(a["at"])) for a in state["applications"]]
        ordered = sorted(entries)
        if [g for g, _ in ordered] != list(range(1, state["generation"] + 1)):
            raise ValueError("Lifecycle entries require an exact append generation sequence")
        if any(ordered[i][1] > ordered[i + 1][1] for i in range(len(ordered) - 1)):
            raise ValueError("Lifecycle clock cannot go backwards across generations")
        for values in (state["events"], state["applications"]):
            if [v["generation"] for v in values] != sorted(v["generation"] for v in values):
                raise ValueError("Lifecycle arrays must preserve append order")
        activations = {}
        closings = set()
        recorded = None
        for event in state["events"]:
            if _time(event["effective_at"]) < _time(event["recorded_at"]):
                raise ValueError("A lifecycle event cannot apply retroactively")
            if recorded is not None and _time(event["recorded_at"]) < recorded:
                raise ValueError("Lifecycle event record times must be monotonic")
            recorded = _time(event["recorded_at"])
            old = adoptions.get(event["adoption_ref"])
            if old is None:
                raise ValueError("Missing event adoption")
            if event["action"] == "adopt":
                if "replacement_ref" in event:
                    raise ValueError("An adopt event cannot carry a replacement")
                new = old
            else:
                if old["adoption_ref"] not in activations:
                    raise ValueError("A closing event must follow activation")
                if old["adoption_ref"] in closings:
                    raise ValueError("An adoption can close only once")
                closings.add(old["adoption_ref"])
                if _time(event["effective_at"]) < _time(old["effective_at"]) or ("expires_at" in old and _time(event["effective_at"]) >= _time(old["expires_at"])):
                    raise ValueError("A closing event must fall within its adoption")
                if event["action"] == "revoke":
                    if "replacement_ref" in event:
                        raise ValueError("Revocation cannot carry a replacement")
                    continue
                new = adoptions.get(event.get("replacement_ref"))
                if new is None or new["scope_path"] != old["scope_path"]:
                    raise ValueError("Replacement must keep the exact scope")
            if new["adoption_ref"] in activations:
                raise ValueError("Duplicate activation event")
            if new["effective_at"] != event["effective_at"] or new["adopted_by"] != event["actor_ref"] or new["authority_ref"] != event["authority_ref"]:
                raise ValueError("Activation must match its adoption")
            activations[new["adoption_ref"]] = event
        if set(activations) != set(adoptions):
            raise ValueError("Each adoption requires an activation event")
        for a in state["adoptions"]:
            _scope(a["scope_path"])
            _time(a["effective_at"])
            if set(a["required_contracts"]) != set(LISTENING_CONTRACTS):
                raise ValueError("Adoption must negotiate the exact lifecycle contracts")
            if "expires_at" in a and _time(a["expires_at"]) <= _time(a["effective_at"]):
                raise ValueError("Expiry must follow adoption")
            parent = adoptions.get(a.get("parent_adoption_ref"))
            if "parent_adoption_ref" in a and (parent is None or not _prefix(parent["scope_path"], a["scope_path"]) or parent["scope_path"] == a["scope_path"]):
                raise ValueError("Parent must have a strictly broader matching scope")
            peers = [b for b in state["adoptions"] if b["adoption_ref"] != a["adoption_ref"] and b["scope_path"] == a["scope_path"]]
            if any(max(_time(a["effective_at"]), _time(b["effective_at"])) < min(_end(state, a), _end(state, b)) for b in peers):
                raise ValueError("Overlapping adoptions at the same scope")
        for app in state["applications"]:
            _scope(app["scope_path"])
            _time(app["at"])
            if not set(app["adoption_refs"]) <= set(adoptions):
                raise ValueError("Application refers to missing adoption")
            if len(app["profile_refs"]) != len(app["adoption_refs"]):
                raise ValueError("Application must preserve each scoped profile")
            historical = dict(state, events=[e for e in state["events"] if e["generation"] < app["generation"]])
            chain = _active_chain(historical, app["scope_path"], app["at"])
            if app["adoption_refs"] != [a["adoption_ref"] for a in chain] or app["profile_refs"] != [a["profile_ref"] for a in chain]:
                raise ValueError("Application does not match its historical adoption chain")
            if app["scope_path"][-1]["kind"] == "invocation" and app["scope_path"][-1]["ref"] != app["operation_ref"]:
                raise ValueError("Application invocation must identify its operation")
            supplied = [c["adoption_ref"] for c in app["contexts"]]
            if len(supplied) != len(set(supplied)) or not set(supplied) <= set(app["adoption_refs"]):
                raise ValueError("Application has duplicate or foreign contexts")
            if (app["context_status"] == "supplied") != bool(app["contexts"]):
                raise ValueError("Application context status differs from supplied material")
            controls = app["control_results"]
            if any(c["status"] == "checked" and not c["evidence_refs"] for c in controls):
                raise ValueError("Checked controls require owner evidence")
            blocked = any(c["status"] in {"denied", "not_checked"} or (c["status"] == "unsupported" and c["required"]) for c in controls)
            blocked |= app["gate"] == "execution" and set(supplied) != set(app["adoption_refs"])
            if (app["gate_result"] == "blocked") != blocked or bool(app["reasons"]) != blocked:
                raise ValueError("Application gate result disagrees with its unresolved controls/context")
    except (KeyError, ValueError, TypeError) as exc:
        errors.append(str(exc))
    return errors


def _state(state, schemas_dir=None):
    errors = state_errors(state, schemas_dir=schemas_dir)
    if errors:
        raise ValueError("; ".join(errors))


def _active_chain(state, scope_path, at):
    active = sorted((a for a in state["adoptions"] if _prefix(a["scope_path"], scope_path) and _active(state, a, at)), key=lambda a: len(a["scope_path"]))
    parent = None
    for adoption in active:
        if adoption.get("parent_adoption_ref") != parent:
            raise ValueError("Active parent binding changed; explicit rebinding is required")
        parent = adoption["adoption_ref"]
    return active


def active_adoptions(state: dict, scope_path: list, at: str, *, schemas_dir=None) -> list[dict]:
    """Resolve broader to narrower scope; stale parent bindings are conflicts."""
    _state(state, schemas_dir)
    _scope(scope_path)
    _time(at)
    return deepcopy(_active_chain(state, scope_path, at))


def _capabilities(value, schemas_dir=None):
    _check("listening-capabilities", value, schemas_dir)
    if not set(LISTENING_CONTRACTS) <= set(value["supported_contracts"]):
        raise ValueError("Host does not support the required lifecycle contracts")


def _authorize(callback, *, action, actor_ref, authority_ref, scope_path, party_refs):
    if not callable(callback):
        raise ValueError("Owner authority verification is required")
    request = dict(action=action, actor_ref=actor_ref, authority_ref=authority_ref,
                   scope_path=deepcopy(scope_path), party_refs=deepcopy(party_refs))
    if callback(request) is not True:
        raise ValueError("Owner authority did not authorize this action")


def _mutation(state, expected_generation, at, schemas_dir=None):
    _state(state, schemas_dir)
    if type(expected_generation) is not int or state["generation"] != expected_generation:
        raise ValueError("Lifecycle generation conflict")
    times = [_time(e["recorded_at"]) for e in state["events"]] + [_time(a["at"]) for a in state["applications"]]
    if times and _time(at) < max(times):
        raise ValueError("New lifecycle entries cannot be backdated")
    _time(at)


def _fresh(state, *identities):
    existing = {a["adoption_ref"] for a in state["adoptions"]} | {e["event_ref"] for e in state["events"]} | {a["application_ref"] for a in state["applications"]}
    if len(identities) != len(set(identities)) or existing.intersection(identities):
        raise ValueError("Lifecycle entries need fresh identities")


def _resolved(adoption, resolver, schemas_dir=None):
    if not callable(resolver):
        raise ValueError("Immutable document resolution is required")
    document, material, profile = deepcopy(resolver(adoption["revision_ref"]))
    expected = compile_profile(document, material, schemas_dir=schemas_dir)
    if (document["revision_ref"] != adoption["revision_ref"] or document["sha256"] != adoption["document_sha256"] or
            expected != profile or profile["profile_ref"] != adoption["profile_ref"] or profile["sha256"] != adoption["profile_sha256"]):
        raise ValueError("Frozen document/profile identity mismatch")
    if _time(document["authored_at"]) > _time(adoption["effective_at"]):
        raise ValueError("Adoption cannot precede the authored document")
    return document, material, profile


def _supported(profile, capabilities):
    for control in profile["controls"]:
        if control["required"] and (not _known_control(control) or _control_key(control) not in capabilities["supported_controls"]):
            raise ValueError("Required control is unsupported")


def adopt_profile(state: dict, document: dict, material: bytes, profile: dict, *, adoption_ref: str,
                  event_ref: str, scope_path: list, party_refs: list[str], actor_ref: str,
                  authority_ref: str, recorded_at: str, effective_at: str, capabilities: dict,
                  verify_authority, expected_generation: int, resolve_document=None,
                  expires_at=None, parent_adoption_ref=None, replace_ref=None, schemas_dir=None) -> tuple[dict, dict]:
    """Adopt or atomically replace an exact revision. Authority is owner supplied."""
    _mutation(state, expected_generation, recorded_at, schemas_dir)
    _scope(scope_path)
    _fresh(state, adoption_ref, event_ref)
    _capabilities(capabilities, schemas_dir)
    if _time(effective_at) < _time(recorded_at):
        raise ValueError("Adoption cannot be retroactive")
    if compile_profile(document, material, schemas_dir=schemas_dir) != profile:
        raise ValueError("Profile is not the exact parsed document")
    if _time(document["authored_at"]) > _time(recorded_at):
        raise ValueError("Adoption cannot precede the authored document")
    _supported(profile, capabilities)
    ancestors = active_adoptions(state, scope_path[:-1], effective_at, schemas_dir=schemas_dir) if len(scope_path) > 1 else []
    expected_parent = ancestors[-1]["adoption_ref"] if ancestors else None
    if parent_adoption_ref != expected_parent:
        raise ValueError("Adoption must name its active parent")
    for ancestor in ancestors:
        _supported(_resolved(ancestor, resolve_document, schemas_dir)[2], capabilities)
    old = next((a for a in state["adoptions"] if a["adoption_ref"] == replace_ref), None)
    if replace_ref is not None:
        if old is None or old["scope_path"] != scope_path or not _active(state, old, effective_at):
            raise ValueError("Replacement requires an active adoption at the same scope")
        if any(e["adoption_ref"] == replace_ref and e["action"] in {"replace", "revoke"} for e in state["events"]):
            raise ValueError("A closing boundary is already scheduled")
    adoption = dict(contract=LISTENING_CONTRACTS[3], adoption_ref=adoption_ref, revision_ref=document["revision_ref"],
                    document_sha256=document["sha256"], profile_ref=profile["profile_ref"], profile_sha256=profile["sha256"],
                    scope_path=deepcopy(scope_path), party_refs=deepcopy(party_refs), adopted_by=actor_ref,
                    authority_ref=authority_ref, effective_at=effective_at, required_contracts=list(LISTENING_CONTRACTS))
    if expires_at is not None:
        adoption["expires_at"] = expires_at
    if parent_adoption_ref is not None:
        adoption["parent_adoption_ref"] = parent_adoption_ref
    _check("listening-adoption", adoption, schemas_dir)
    # Replacement requires authority over both sets of parties, including any
    # participant removed by the new agreement.
    parties = list(dict.fromkeys([*(old["party_refs"] if old else []), *party_refs]))
    _authorize(verify_authority, action="replace" if old else "adopt", actor_ref=actor_ref,
               authority_ref=authority_ref, scope_path=scope_path, party_refs=parties)
    event = dict(contract=LISTENING_CONTRACTS[4], event_ref=event_ref, action="replace" if old else "adopt",
                 adoption_ref=replace_ref if old else adoption_ref, actor_ref=actor_ref,
                 authority_ref=authority_ref, recorded_at=recorded_at, effective_at=effective_at, generation=state["generation"] + 1)
    if old:
        event["replacement_ref"] = adoption_ref
    updated = deepcopy(state)
    updated["adoptions"].append(adoption)
    updated["events"].append(event)
    updated["generation"] += 1
    _state(updated, schemas_dir)
    return updated, deepcopy(adoption)


def revoke_adoption(state: dict, adoption_ref: str, *, event_ref: str, actor_ref: str,
                    authority_ref: str, recorded_at: str, effective_at: str,
                    verify_authority, expected_generation: int, schemas_dir=None) -> tuple[dict, dict]:
    _mutation(state, expected_generation, recorded_at, schemas_dir)
    _fresh(state, event_ref)
    adoption = next((a for a in state["adoptions"] if a["adoption_ref"] == adoption_ref), None)
    if adoption is None or not _active(state, adoption, effective_at):
        raise ValueError("Revocation requires an active adoption at its boundary")
    if _time(effective_at) < _time(recorded_at):
        raise ValueError("Revocation cannot be retroactive")
    if any(e["adoption_ref"] == adoption_ref and e["action"] in {"replace", "revoke"} for e in state["events"]):
        raise ValueError("A closing boundary is already scheduled")
    _authorize(verify_authority, action="revoke", actor_ref=actor_ref, authority_ref=authority_ref,
               scope_path=adoption["scope_path"], party_refs=adoption["party_refs"])
    event = dict(contract=LISTENING_CONTRACTS[4], event_ref=event_ref, action="revoke", adoption_ref=adoption_ref,
                 actor_ref=actor_ref, authority_ref=authority_ref, recorded_at=recorded_at, effective_at=effective_at,
                 generation=state["generation"] + 1)
    updated = deepcopy(state)
    updated["events"].append(event)
    updated["generation"] += 1
    _state(updated, schemas_dir)
    return updated, deepcopy(event)


def _ranges(ranges, size):
    if not isinstance(ranges, list) or not ranges:
        raise ValueError("Explicit nonempty byte ranges are required")
    last = 0
    omitted = []
    for interval in ranges:
        if not isinstance(interval, dict) or set(interval) != {"start", "end"}:
            raise ValueError("Invalid byte range")
        a, b = interval["start"], interval["end"]
        if type(a) is not int or type(b) is not int or not (last <= a < b <= size):
            raise ValueError("Byte ranges must be ordered, disjoint and within the document")
        if last < a:
            omitted.append(dict(start=last, end=a))
        last = b
    if last < size:
        omitted.append(dict(start=last, end=size))
    return omitted


def select_context(document: dict, material: bytes, profile: dict, *, received_representation_ref: str,
                   max_bytes: int, ranges=None, schemas_dir=None) -> tuple[bytes, dict]:
    """Select exact bytes or fail. No normalization, truncation or hidden omission."""
    if compile_profile(document, material, schemas_dir=schemas_dir) != profile:
        raise ValueError("Context profile differs from the frozen source")
    if type(max_bytes) is not int or max_bytes < 1:
        raise ValueError("An explicit positive context byte budget is required")
    ranges = [dict(start=0, end=len(material))] if ranges is None else deepcopy(ranges)
    omissions = _ranges(ranges, len(material))
    if omissions and profile["context"]["policy"] != "explicit_selection":
        raise ValueError("This profile requires complete context")
    if omissions and received_representation_ref == document["representation_ref"]:
        raise ValueError("Selected context requires a distinct representation identity")
    if not isinstance(received_representation_ref, str) or not received_representation_ref:
        raise ValueError("A received representation identity is required")
    parts = [material[r["start"]:r["end"]] for r in ranges]
    try:
        for part in parts:
            part.decode("utf-8")
    except UnicodeDecodeError:
        raise ValueError("A selected byte range cuts a UTF-8 codepoint") from None
    received = b"".join(parts)
    if len(received) > min(max_bytes, profile["context"]["max_bytes"]):
        raise ValueError("Context exceeds the explicit byte budget; no text was truncated")
    included, excluded = [], []
    for span in profile["commitment_spans"]:
        a, b = span["range"]["start"], span["range"]["end"]
        covered = sum(max(0, min(b, r["end"]) - max(a, r["start"])) for r in ranges)
        (included if covered == b - a else excluded).append(span["commitment_ref"])
    receipt = dict(revision_ref=document["revision_ref"], document_representation_ref=document["representation_ref"],
                   document_sha256=document["sha256"], received_representation_ref=received_representation_ref,
                   received_sha256=sha256(received).hexdigest(), received_byte_count=len(received),
                   coverage=dict(kind="partial" if omissions else "full", unit="byte", ranges=ranges, omitted_ranges=omissions),
                   commitments_received=included, commitments_omitted=excluded)
    return received, receipt


def _evaluate(control, resolve_fact):
    if not callable(resolve_fact):
        return "not_checked", [], "missing_owner_fact"
    fact = deepcopy(resolve_fact(control["target"]))
    if not isinstance(fact, dict) or set(fact) != {"value", "evidence_refs"} or not isinstance(fact["evidence_refs"], list) or not fact["evidence_refs"] or any(not isinstance(v, str) or not v for v in fact["evidence_refs"]):
        return "not_checked", [], "missing_owner_fact"
    value = fact["value"]
    operator = control["operator"]
    if operator == "max_value":
        if type(value) not in (int, float) or value < 0 or value != value or value in (float("inf"), float("-inf")):
            return "not_checked", [], "invalid_numeric_fact"
        if control["target"] == "execution.turn_count" and type(value) is not int:
            return "not_checked", [], "invalid_turn_count"
        allowed = value <= control["limit"]
    else:
        values = value if isinstance(value, list) else [value]
        if not values or any(not isinstance(v, str) or not v for v in values):
            return "not_checked", [], "invalid_value_fact"
        if operator == "allow_values":
            allowed = set(values) <= set(control["values"])
        elif operator == "deny_values":
            allowed = not set(values).intersection(control["values"])
        else:
            allowed = set(control["refs"]) <= set(values)
    return ("checked" if allowed else "denied"), list(dict.fromkeys(fact["evidence_refs"])), "within_control" if allowed else "control_denied"


def apply_profiles(state: dict, *, application_ref: str, operation_ref: str, scope_path: list,
                   gate: str, at: str, actor_ref: str, authority_ref: str, capabilities: dict,
                   verify_authority, resolve_document, resolve_fact, expected_generation: int,
                   contexts=None, owner_controls=None, schemas_dir=None) -> tuple[dict, dict]:
    """Check one gate against supplied bytes and owner facts; execute nothing.

    Execution contexts are actual already-supplied bytes, not a planned prompt.
    The host must honor a blocked result before dispatch and check later gates.
    """
    _mutation(state, expected_generation, at, schemas_dir)
    _fresh(state, application_ref)
    _capabilities(capabilities, schemas_dir)
    _scope(scope_path)
    if gate not in {"input", "execution", "output", "retention", "disclosure"}:
        raise ValueError("Unknown application gate")
    if scope_path[-1]["kind"] == "invocation" and scope_path[-1]["ref"] != operation_ref:
        raise ValueError("Invocation scope must identify this operation")
    adoptions = active_adoptions(state, scope_path, at, schemas_dir=schemas_dir)
    if not adoptions:
        raise ValueError("No active adoption; source or context cannot activate a document")
    parties = list(dict.fromkeys(p for a in adoptions for p in a["party_refs"]))
    _authorize(verify_authority, action="apply", actor_ref=actor_ref, authority_ref=authority_ref,
               scope_path=scope_path, party_refs=parties)
    resolved = {a["adoption_ref"]: _resolved(a, resolve_document, schemas_dir) for a in adoptions}
    controls = [(a["adoption_ref"], c) for a in adoptions for c in resolved[a["adoption_ref"]][2]["controls"]]
    if owner_controls:
        # Reuse the strict profile control definition without creating an adoption.
        sample = deepcopy(next(iter(resolved.values()))[2])
        sample["controls"] = deepcopy(owner_controls)
        _check("listening-profile", sample, schemas_dir)
        if len({c["control_id"] for c in owner_controls}) != len(owner_controls):
            raise ValueError("Duplicate owner control identity")
        for c in owner_controls:
            _control_shape(c)
            if c["required"] is not True:
                raise ValueError("Owner controls must be required")
        controls += [("owner:" + capabilities["host_ref"], c) for c in deepcopy(owner_controls)]
    results, reasons = [], []
    for source, control in controls:
        available = _known_control(control) and _control_key(control) in capabilities["supported_controls"]
        if control["gate"] != gate and (available or not control["required"]):
            continue
        status, evidence, reason = _evaluate(control, resolve_fact) if available else ("unsupported", [], "unsupported_control")
        results.append(dict(source_ref=source, control_id=control["control_id"], gate=control["gate"],
                            target=control["target"], operator=control["operator"], required=control["required"],
                            status=status, evidence_refs=evidence, reason=reason))
        if status in {"denied", "not_checked"} or (status == "unsupported" and control["required"]):
            reasons.append("control_unresolved:" + source + ":" + control["control_id"])
    supplied = []
    inputs = [] if contexts is None else deepcopy(contexts)
    if not isinstance(inputs, list):
        raise ValueError("Context deliveries must be a list")
    seen = set()
    for delivery in inputs:
        if not isinstance(delivery, dict) or set(delivery) != {"adoption_ref", "received_representation_ref", "received_bytes", "ranges"}:
            raise ValueError("Actual context bytes and declared ranges are required")
        key = delivery["adoption_ref"]
        if key in seen or key not in resolved:
            raise ValueError("Duplicate or foreign context delivery")
        seen.add(key)
        document, material, profile = resolved[key]
        selected, metadata = select_context(document, material, profile,
                                            received_representation_ref=delivery["received_representation_ref"],
                                            max_bytes=capabilities["max_context_bytes"], ranges=delivery["ranges"], schemas_dir=schemas_dir)
        if not isinstance(delivery["received_bytes"], bytes) or selected != delivery["received_bytes"]:
            raise ValueError("Actual supplied bytes differ from declared context")
        supplied.append(dict(adoption_ref=key, **metadata))
    by_representation = {}
    for context in supplied:
        identity = context["received_representation_ref"]
        signature = (context["received_sha256"], context["received_byte_count"])
        if identity in by_representation and by_representation[identity] != signature:
            raise ValueError("A received identity cannot alias different supplied bytes")
        by_representation[identity] = signature
    if sum(c["received_byte_count"] for c in supplied) > capabilities["max_context_bytes"]:
        raise ValueError("Combined contexts exceed the host byte budget")
    if gate == "execution" and seen != set(resolved):
        reasons.append("not_all_adopted_contexts_supplied")
    receipt = dict(contract=LISTENING_CONTRACTS[5], application_ref=application_ref, operation_ref=operation_ref,
                   host_ref=capabilities["host_ref"], scope_path=deepcopy(scope_path), gate=gate, at=at,
                   actor_ref=actor_ref, authority_ref=authority_ref, adoption_refs=[a["adoption_ref"] for a in adoptions],
                   profile_refs=[a["profile_ref"] for a in adoptions], contexts=supplied, control_results=results,
                   gate_result="blocked" if reasons else "cleared", context_status="supplied" if supplied else "not_supplied",
                   attestation="owner_declared", reasons=reasons, execution="not_executed", generation=state["generation"] + 1)
    _check("listening-application", receipt, schemas_dir)
    updated = deepcopy(state)
    updated["applications"].append(receipt)
    updated["generation"] += 1
    _state(updated, schemas_dir)
    return updated, deepcopy(receipt)


def binding_references(state: dict, application_ref: str, *, scope_path: list, operation_ref: str,
                       at: str, resolve_document, schemas_dir=None) -> list[dict]:
    """Content-free Earworm references for a still-current, cleared execution gate."""
    adoptions = active_adoptions(state, scope_path, at, schemas_dir=schemas_dir)
    app = next((a for a in state["applications"] if a["application_ref"] == application_ref), None)
    if (app is None or app["gate"] != "execution" or app["gate_result"] != "cleared" or
            app["operation_ref"] != operation_ref or app["scope_path"] != scope_path or _time(app["at"]) > _time(at) or
            app["adoption_refs"] != [a["adoption_ref"] for a in adoptions]):
        raise ValueError("No current cleared execution application for this operation")
    if {c["adoption_ref"] for c in app["contexts"]} != set(app["adoption_refs"]):
        raise ValueError("Execution application did not supply every scoped context")
    refs = []
    for adoption in adoptions:
        document, material, profile = _resolved(adoption, resolve_document, schemas_dir)
        for control in profile["controls"]:
            if control["required"] and not _known_control(control):
                raise ValueError("Binding profile contains an unsupported required control")
            if control["gate"] == "execution" and control["required"]:
                result = next((r for r in app["control_results"] if r["source_ref"] == adoption["adoption_ref"] and
                               r["control_id"] == control["control_id"]), None)
                if (result is None or result["status"] != "checked" or not result["evidence_refs"] or
                        any(result[k] != control[k] for k in ("gate", "target", "operator", "required"))):
                    raise ValueError("Required execution control is missing from its application")
        context = next(c for c in app["contexts"] if c["adoption_ref"] == adoption["adoption_ref"])
        if context["document_sha256"] != document["sha256"] or context["document_representation_ref"] != document["representation_ref"]:
            raise ValueError("Application document identity mismatch")
        _, expected = select_context(document, material, profile,
                                     received_representation_ref=context["received_representation_ref"],
                                     max_bytes=MAX_DOCUMENT_BYTES, ranges=context["coverage"]["ranges"], schemas_dir=schemas_dir)
        if context != dict(adoption_ref=adoption["adoption_ref"], **expected):
            raise ValueError("Application context coverage or received identity mismatch")
        refs.append(dict(binding_id=f"{application_ref}:binding:{adoption['adoption_ref']}",
                         document_representation_ref=document["representation_ref"], document_sha256=document["sha256"],
                         adoption_ref=adoption["adoption_ref"], application_ref=application_ref,
                         scope=deepcopy(adoption["scope_path"][-1]), effective_at=adoption["effective_at"]))
    return refs


def verify_binding(binding: dict, state: dict, *, scope_path: list, operation_ref: str, at: str,
                   resolve_document, schemas_dir=None) -> bool:
    """Reference check for owner adapters; source reads never enter this path."""
    try:
        refs = binding_references(state, binding["application_ref"], scope_path=scope_path,
                                  operation_ref=operation_ref, at=at, resolve_document=resolve_document, schemas_dir=schemas_dir)
        return binding in refs
    except (KeyError, ValueError, TypeError):
        return False


def instruction_binding_errors(binding: dict, access: dict, received_representation: dict, state: dict, *,
                               scope_path: list, operation_ref: str, at: str, resolve_document,
                               schemas_dir=None) -> list[str]:
    """Earworm callback checks its actual access and received artifact as well.

    The host closes over the admitted record's received representation. Earworm
    separately verifies its bytes; this check binds those bytes to the application.
    """
    if not verify_binding(binding, state, scope_path=scope_path, operation_ref=operation_ref,
                          at=at, resolve_document=resolve_document, schemas_dir=schemas_dir):
        return ["Instruction adoption/application is not current for this operation"]
    try:
        app = next(a for a in state["applications"] if a["application_ref"] == binding["application_ref"])
        context = next(c for c in app["contexts"] if c["adoption_ref"] == binding["adoption_ref"])
        if (access["role"] != "instruction" or access["status"] != "available" or access["operation_ref"] != operation_ref or
                access["binding_ref"] != binding["binding_id"] or access["representation_ref"] != context["document_representation_ref"] or
                access["received_representation_ref"] != context["received_representation_ref"]):
            return ["Instruction access does not match the applied context"]
        artifact = received_representation["artifact"]
        if (received_representation["representation_id"] != context["received_representation_ref"] or
                artifact["state"] != "retained" or artifact["sha256"] != context["received_sha256"] or
                artifact["byte_count"] != context["received_byte_count"]):
            return ["Instruction received artifact differs from the application"]
        coverage = access["coverage"]
        expected = context["coverage"]
        if coverage["kind"] != expected["kind"] or coverage["unit"] != "byte":
            return ["Instruction context coverage differs from the application"]
        if expected["kind"] == "partial":
            if coverage["ranges"] != expected["ranges"] or not coverage["omissions"]:
                return ["Selected instruction context ranges/omissions differ from the application"]
        elif coverage["omissions"] or coverage["ranges"] not in ([], expected["ranges"]):
            return ["Full instruction context cannot declare omissions"]
    except (KeyError, TypeError, StopIteration):
        return ["Instruction application/access metadata is incomplete"]
    return []
