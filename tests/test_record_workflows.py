"""Real E14/E15/E16 validation and isolated storage; no model/provider fixtures."""

from copy import deepcopy
import json
from pathlib import Path
import pytest

# `akousma` is Earworm's package, not this one. The release gate builds and
# installs the akouo-contract wheel into an isolated environment on purpose, so
# a sibling checkout is not on the path and must not be silently required.
#
# Before 15 September this module simply failed to import, and because the gate
# ran `unittest discover` the failure was one of several that made the whole
# Python step unreadable. Skipping explicitly states the reason and the cost:
# these nine functions cover the akouo-contract/akousma boundary, and while they
# skip, that boundary is only covered by the Central's integration tests.
#
# Install akousma into the test environment to run them.
akousma = pytest.importorskip(
    "akousma",
    reason=(
        "Earworm's akousma package is not installed. The record-workflow tests "
        "cover the akouo-contract/akousma boundary and do not run without it."
    ),
)
AkousmataStore = akousma.AkousmataStore
validation_errors = akousma.validation_errors
from akousma.record_evolution import next_record_reference_errors
from akouo_contract.record_workflows import (
    research_proposal,
    derivation_plan,
    generation_decision,
)

ROOT = Path(__file__).resolve().parents[1]
FIX = Path(__file__).parent / "fixtures/record-workflows"


def fixture(name):
    return json.loads((FIX / (name + ".json")).read_text())


def setup(kind):
    sources = fixture("scope")
    r = dict(
        contract="akouo/record-workflow/v0.1",
        request_id="request:fixture",
        actor_ref="actor:fixture",
        created_at="2026-09-07T12:00:00Z",
        kind=kind,
        source_refs=[s["akousma_id"] for s in sources],
        permissions=[
            dict(
                record_ref=s["akousma_id"],
                status="granted",
                permission_ref="permission:owner",
            )
            for s in sources
        ],
        supported_contracts=[
            "akouo/record-workflow/v0.1",
            "earworm/akousma/v1.7",
            "earworm/research/v1",
            "earworm/relations/v1",
            "earworm/generation-decision/v1",
        ],
        resolved_refs=[
            "actor:fixture",
            "permission:owner",
            "method:fixture",
            "evidence:fixture",
            "policy:fixture",
        ],
    )
    if kind == "research":
        r.update(
            record_id="ak_new_research",
            question="Which retained descriptor supports comparison?",
            relations=[fixture("research")["lineage"]["relations"][1]],
        )
    elif kind == "derivation":
        r.update(
            prompt="Invent a sparse pulse; do not reconstruct the source.",
            parameters={"duration": 2},
            policy_ref="policy:fixture",
            policy_revision="1",
        )
    else:
        d = fixture("decision")["extensions"]["earworm_generation_decision"]
        d.update(decision_id=r["request_id"], input_refs=r["source_refs"])
        r.update(record_id="ak_new_decision", output_ref="output:fixture", decision=d)
    return r, sources


def run(r, sources, **extra):
    common = dict(
        validate_record=validation_errors,
        schemas_dir=(ROOT / "schemas") if (ROOT / "schemas").is_dir() else None,
    )
    if r["kind"] == "research":
        return research_proposal(
            r, sources, validate_references=next_record_reference_errors, **common
        )
    if r["kind"] == "derivation":
        policy = extra.get(
            "policy",
            dict(
                id="policy:fixture",
                revision="1",
                parameters={"duration": dict(minimum=1, maximum=30, unit="seconds")},
            ),
        )
        return derivation_plan(r, sources, parameter_policy=policy, **common)
    output = extra.get(
        "output",
        dict(
            output_ref="output:fixture",
            generation_ref="ak_generation",
            status="retained",
            receipt_ref="receipt:fixture",
            sha256="a" * 64,
            subsequent_listenings=[
                dict(
                    record_ref="ak_subsequent_listening",
                    listening_ref="lst_human_001",
                    output_ref="output:fixture",
                )
            ],
        ),
    )
    return generation_decision(
        r,
        sources,
        output_evidence=output,
        validate_references=next_record_reference_errors,
        **common,
    )


@pytest.mark.parametrize("kind", ["research", "derivation", "decision"])
def test_attributed_output_preserves_sources_and_never_executes(kind, tmp_path):
    r, sources = setup(kind)
    before = deepcopy((r, sources))
    out = run(r, sources)
    assert (r, sources) == before
    evidence = out if kind == "derivation" else out["extensions"]["akouo_workflow"]
    assert (
        evidence["execution"] == "not_requested" and evidence["listening_pass"] is None
    )
    assert len(evidence["sources"]) == len(sources)
    if kind == "derivation":
        assert (
            out["claim_category"] == "speculative"
            and out["parent_refs"] == r["source_refs"]
        )
    else:
        assert next_record_reference_errors(out, sources) == []
        assert not out.get("auditum") and not out.get("listening")
        store = AkousmataStore(tmp_path)
        try:
            for source in sources:
                store.put(source)
            store.put(out)
            assert store.get(out["akousma_id"]) == out
            assert [store.get(source["akousma_id"]) for source in sources] == sources
        finally:
            store.close()


@pytest.mark.parametrize("kind", ["research", "derivation", "decision"])
@pytest.mark.parametrize(
    "mutation",
    [
        lambda r, s: r["permissions"][0].update(status="unknown"),
        lambda r, s: r["permissions"].pop(),
        lambda r, s: r.update(resolved_refs=[]),
        lambda r, s: r.update(supported_contracts=[]),
        lambda r, s: s.append(deepcopy(s[0])),
        lambda r, s: s.pop(),
        lambda r, s: r.update(created_at="2020-01-01T00:00:00Z"),
        lambda r, s: r.update(created_at="2026-09-07"),
        lambda r, s: s[0]["provenance"].update(consent_status="restricted"),
    ],
)
def test_scope_permission_negotiation_and_chronology_refused(kind, mutation):
    r, s = setup(kind)
    mutation(r, s)
    with pytest.raises(ValueError):
        run(r, s)


@pytest.mark.parametrize(
    "mutation",
    [
        lambda r: r["relations"][0].update(epistemic_status="measured"),
        lambda r: r["relations"][0].update(
            review={"status": "accepted", "actor_ref": "other", "reason": "yes"}
        ),
        lambda r: r["relations"][0].update(declared_by="other"),
        lambda r: r["relations"][0]["criterion"].update(method_ref="missing"),
        lambda r: r["relations"][0]["criterion"].update(input_refs=["ak_generation"]),
        lambda r: r["relations"][0]["criterion"].update(
            score={"status": "known", "value": float("nan"), "policy": "distance"}
        ),
        lambda r: r["relations"].append(deepcopy(r["relations"][0])),
        lambda r: r.update(record_id=r["source_refs"][0]),
    ],
)
def test_research_does_not_promote_or_silently_accept_source_claims(mutation):
    r, s = setup("research")
    mutation(r)
    with pytest.raises(ValueError):
        run(r, s)


@pytest.mark.parametrize("value", [0, 31, True, float("inf")])
def test_derivation_bounds_and_json_numbers(value):
    r, s = setup("derivation")
    r["parameters"]["duration"] = value
    with pytest.raises(ValueError):
        run(r, s)


def test_derivation_cannot_widen_host_policy_or_add_parameters():
    r, s = setup("derivation")
    r["parameters"]["secret"] = 1
    with pytest.raises(ValueError):
        run(r, s)
    r, s = setup("derivation")
    r["policy_revision"] = "caller-override"
    with pytest.raises(ValueError):
        run(r, s)


@pytest.mark.parametrize(
    "mutation",
    [
        lambda r, s: r["decision"].update(actor_ref="other"),
        lambda r, s: r["decision"].update(execution="completed"),
        lambda r, s: r["decision"].update(subsequent_listenings=[]),
        lambda r, s: r["decision"]["subsequent_listenings"][0].update(
            listening_ref="invented"
        ),
        lambda r, s: r["decision"].update(outcome="keep"),
        lambda r, s: s[2]["auditum"]["listenings"][0].update(
            created_at="2020-01-01T00:00:00Z"
        ),
    ],
)
def test_decision_requires_independent_subsequent_pass_and_valid_next_action(mutation):
    r, s = setup("decision")
    mutation(r, s)
    with pytest.raises(ValueError):
        run(r, s)


def test_decision_refuses_plan_or_unbound_output():
    r, s = setup("decision")
    for output in [
        {},
        dict(
            output_ref="output:fixture",
            generation_ref="ak_generation",
            status="planned",
        ),
        dict(
            output_ref="output:fixture",
            generation_ref="ak_generation",
            status="retained",
            receipt_ref="receipt",
            sha256="a" * 64,
            subsequent_listenings=[],
        ),
    ]:
        with pytest.raises(ValueError):
            run(r, s, output=output)


@pytest.mark.parametrize(
    "kind,key,value",
    [
        ("research", "criterion", None),
        ("research", "evidence_refs", 17),
        ("decision", "subsequent_listenings", [None]),
        ("decision", "input_refs", None),
    ],
)
def test_malformed_nested_payloads_fail_as_contract_errors(kind, key, value):
    r, s = setup(kind)
    target = r["relations"][0] if kind == "research" else r["decision"]
    target[key] = value
    with pytest.raises(ValueError):
        run(r, s)


def test_generation_cannot_stand_in_for_its_subsequent_account():
    r, s = setup("decision")
    r["decision"]["subsequent_listenings"][0]["record_ref"] = "ak_generation"
    with pytest.raises(ValueError, match="separate retained account"):
        run(r, s)
