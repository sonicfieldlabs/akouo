"""Bounded plans and additive records; storage/execution remain with the owner.

Hosts supply canonical validators and resolved output evidence. No scheduler,
provider, model, store mutation or inherited listening pass is created here.
"""

from copy import deepcopy
from datetime import datetime
import hashlib
import json

from .validation import contract_errors, nonfinite

CONTRACT = "akouo/record-workflow/v0.1"


def _instant(value):
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            raise ValueError()
        return dt
    except (AttributeError, TypeError, ValueError) as exc:
        raise ValueError("Timezone-qualified chronology is required") from exc


def _check(errors):
    if errors:
        raise ValueError("; ".join(errors))


def _scope(request, records, validate_record, schemas_dir):
    _check(contract_errors("record-workflow-request", request, schemas_dir=schemas_dir))
    if not isinstance(records, list) or not 1 <= len(records) <= 32:
        raise ValueError("Supply 1-32 selected canonical records")
    for record in records:
        if nonfinite(record):
            raise ValueError("Nonfinite source")
        _check(validate_record(record))
        if len(json.dumps(record, allow_nan=False).encode()) > 2 * 1024 * 1024:
            raise ValueError("Selected source exceeds 2 MiB")
    scope = {record["akousma_id"]: record for record in records}
    if len(scope) != len(records) or set(scope) != set(request["source_refs"]):
        raise ValueError("Selected sources must resolve exactly once")
    if request.get("record_id") in scope:
        raise ValueError("An additive record requires a fresh identity")
    resolved = set(request["resolved_refs"])
    permissions = request["permissions"]
    if len(permissions) != len(scope) or {p["record_ref"] for p in permissions} != set(
        scope
    ):
        raise ValueError("Each source requires its own permission")
    if (
        not {request["actor_ref"], *(p["permission_ref"] for p in permissions)}
        <= resolved
    ):
        raise ValueError("Unresolved actor or permission reference")
    for source in records:
        if _instant(request["created_at"]) < _instant(source["created_at"]):
            raise ValueError("Request precedes retained input")
        if source.get("provenance", {}).get("consent_status") == "restricted":
            raise ValueError(
                "Restricted source requires a separate authorized workflow"
            )
    return scope


def _evidence(request, records):
    return dict(
        contract=CONTRACT,
        request_id=request["request_id"],
        actor_ref=request["actor_ref"],
        permissions=deepcopy(request["permissions"]),
        sources=[
            dict(
                record_ref=r["akousma_id"],
                sha256=hashlib.sha256(
                    json.dumps(
                        r, sort_keys=True, separators=(",", ":"), allow_nan=False
                    ).encode()
                ).hexdigest(),
            )
            for r in records
        ],
        execution="not_requested",
        listening_pass=None,
        basis="Retained source attribution; no inherited hearing or new measurement",
    )


def _record(request, kind, extensions, relations):
    return dict(
        akousma_id=request["record_id"],
        schema_version="1.7.0",
        created_at=request["created_at"],
        subject=request["request_id"],
        record_kind=kind,
        provenance=dict(
            source_type="unknown",
            origin="unknown",
            originating_app="akouo",
            created_at=request["created_at"],
        ),
        lineage=dict(parent_akousma_ids=[], relations=deepcopy(relations)),
        extensions=extensions,
    )


def research_proposal(
    request, records, *, validate_record, validate_references, schemas_dir=None
):
    """Build an E15 proposal for the Akousmata-owned service to review/store."""
    scope = _scope(request, records, validate_record, schemas_dir)
    if request["kind"] != "research":
        raise ValueError("Research request required")
    if not {
        "earworm/akousma/v1.7",
        "earworm/research/v1",
        "earworm/relations/v1",
    } <= set(request["supported_contracts"]):
        raise ValueError("Research contracts not negotiated")
    relations = request["relations"]
    resolved = set(request["resolved_refs"]) | set(scope)
    for relation in relations:
        if (
            relation.get("type") != "similar_by"
            or relation.get("contract") != "earworm/relations/v1"
        ):
            raise ValueError("Research proposes criterion-bearing similar_by only")
        if relation.get("declared_by") != request["actor_ref"] or relation.get(
            "review"
        ) != {"status": "unreviewed"}:
            raise ValueError("Proposal author/review attribution mismatch")
        if relation.get("epistemic_status") not in {
            "inferred",
            "interpreted",
            "undetermined",
        }:
            raise ValueError(
                "Research cannot reassert reported or measured source claims"
            )
        criterion = relation.get("criterion", {})
        inputs = criterion.get("input_refs", [])
        if (
            len(inputs) < 2
            or not set(inputs) <= set(scope)
            or relation.get("target_akousma_id") not in inputs
        ):
            raise ValueError(
                "Comparison requires named retained source and target inputs"
            )
        if (
            criterion.get("method_ref") not in resolved
            or not set(relation.get("evidence_refs", [])) <= resolved
        ):
            raise ValueError("Unresolved comparison method/evidence")
    evidence = _evidence(request, records)
    record = _record(
        request,
        "research_proposal",
        dict(
            akouo_workflow=evidence,
            earworm_research=dict(
                contract="earworm/research/v1",
                proposal_id=request["request_id"],
                author_ref=request["actor_ref"],
                question=request["question"],
                source_refs=list(scope),
                evidence_refs=list(
                    dict.fromkeys(
                        ref
                        for relation in relations
                        for ref in relation.get("evidence_refs", [])
                    )
                ),
                proposed_relation_refs=[r.get("relation_id") for r in relations],
                review=dict(status="unreviewed"),
            ),
        ),
        relations,
    )
    _check(validate_references(record, records))
    return record


def derivation_plan(
    request, records, *, parameter_policy, validate_record, schemas_dir=None
):
    """Keep host-owned parameter bounds separate from caller proposals."""
    scope = _scope(request, records, validate_record, schemas_dir)
    if request["kind"] != "derivation":
        raise ValueError("Derivation request required")
    if CONTRACT not in request["supported_contracts"]:
        raise ValueError("Derivation contract not negotiated")
    if (parameter_policy.get("id"), parameter_policy.get("revision")) != (
        request["policy_ref"],
        request["policy_revision"],
    ):
        raise ValueError("Parameter policy identity/revision mismatch")
    if request["policy_ref"] not in request["resolved_refs"]:
        raise ValueError("Unresolved parameter policy")
    bounds = parameter_policy.get("parameters", {})
    if not bounds or set(request["parameters"]) != set(bounds):
        raise ValueError("Exactly the permitted parameter set is required")
    for key, value in request["parameters"].items():
        bound = bounds[key]
        if (
            not isinstance(bound, dict)
            or set(bound) != {"minimum", "maximum", "unit"}
            or any(type(bound[k]) not in (int, float) for k in ("minimum", "maximum"))
            or nonfinite(bound)
            or not isinstance(bound["unit"], str)
            or not bound["unit"].strip()
            or not bound["minimum"] <= value <= bound["maximum"]
        ):
            raise ValueError("Invalid policy or out-of-range parameter: " + key)
    return dict(
        **_evidence(request, records),
        kind="derivation",
        parent_refs=list(scope),
        prompt=request["prompt"],
        parameters=deepcopy(request["parameters"]),
        parameter_policy=deepcopy(parameter_policy),
        claim_category="speculative",
        limitation="A proposed new sound; not reconstruction of retained source audio",
    )


def generation_decision(
    request,
    records,
    *,
    output_evidence,
    validate_record,
    validate_references,
    schemas_dir=None,
):
    """Require a generated output and a later pass bound to that exact output.

    Output evidence must come from the host's resolved asset/receipt registry. A
    caller-supplied string or a generation plan is insufficient. This function does
    not read bytes or verify a provider; the host remains responsible for doing so.
    """
    scope = _scope(request, records, validate_record, schemas_dir)
    if request["kind"] != "decision":
        raise ValueError("Decision request required")
    if not {
        "earworm/akousma/v1.7",
        "earworm/generation-decision/v1",
        "earworm/relations/v1",
    } <= set(request["supported_contracts"]):
        raise ValueError("Decision contracts not negotiated")
    d = request["decision"]
    if (
        d.get("actor_ref") != request["actor_ref"]
        or d.get("decision_id") != request["request_id"]
        or d.get("execution") != "not_requested"
    ):
        raise ValueError("Decision attribution/execution mismatch")
    if set(d.get("input_refs", [])) != set(scope):
        raise ValueError("Decision inputs must match the selected retained scope")
    if d.get("policy_ref") not in request["resolved_refs"]:
        raise ValueError("Unresolved decision policy")
    output = output_evidence
    if (
        not isinstance(output, dict)
        or output.get("output_ref") != request["output_ref"]
        or output.get("generation_ref") != d.get("generation_ref")
        or output.get("status") != "retained"
        or not output.get("receipt_ref")
        or not isinstance(output.get("sha256"), str)
        or len(output["sha256"]) != 64
        or any(c not in "0123456789abcdef" for c in output["sha256"])
    ):
        raise ValueError(
            "A resolved retained output and generation receipt are required"
        )
    bound = {
        (p.get("record_ref"), p.get("listening_ref"), p.get("output_ref"))
        for p in output.get("subsequent_listenings", [])
        if isinstance(p, dict)
    }
    refs = d.get("subsequent_listenings", [])
    if any(p.get("record_ref") == d.get("generation_ref") for p in refs):
        raise ValueError("Subsequent listening requires a separate retained account")
    if not refs or any(
        (p.get("record_ref"), p.get("listening_ref"), request["output_ref"])
        not in bound
        for p in refs
    ):
        raise ValueError("Subsequent listening must be bound to the generated output")
    record = _record(
        request,
        "generation_decision",
        dict(
            akouo_workflow={
                **_evidence(request, records),
                "output_evidence": deepcopy(output),
            },
            earworm_generation_decision=deepcopy(d),
        ),
        [
            dict(
                contract="earworm/relations/v1",
                relation_id=request["request_id"] + ":on",
                type="decision_on",
                target_akousma_id=d["generation_ref"],
                declared_by=request["actor_ref"],
                evidence_refs=[output["receipt_ref"], request["output_ref"]],
                epistemic_status="interpreted",
                review=dict(status="unreviewed"),
            )
        ],
    )
    _check(validate_references(record, records))
    return record
