"""Synthetic lifecycle qualification. No owner adoption, provider or model run."""
from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path

import pytest
from akousma.representations import admit_representation_record, representation_record_errors
from akouo_contract import root, CONTRACT
from akouo_contract.listening_profiles import (
    DEFAULT_CONTEXT_BYTES, GRAMMAR, LISTENING_CONTRACTS, MAX_DOCUMENT_BYTES, SUPPORTED_CONTROLS,
    active_adoptions, adopt_profile, apply_profiles, binding_references, compile_profile,
    create_document, empty_state, instruction_binding_errors, load_listening_presets, revoke_adoption, select_context,
    state_errors, verify_binding,
)
from akouo_contract.validation import contract_errors

T0 = "2026-10-13T00:00:00Z"
T1 = "2026-10-13T00:01:00Z"
T2 = "2026-10-13T00:02:00Z"
T3 = "2026-10-13T00:03:00Z"
WORKSPACE = [dict(kind="workspace", ref="fixture:workspace")]
RUN = WORKSPACE + [dict(kind="run", ref="fixture:run")]
OPERATION = "fixture:operation"
PATH = RUN + [dict(kind="invocation", ref=OPERATION)]
CAPS = dict(contract="akouo/listening-capabilities/v1", host_ref="fixture:host",
            supported_contracts=list(LISTENING_CONTRACTS), supported_controls=list(SUPPORTED_CONTROLS),
            max_context_bytes=DEFAULT_CONTEXT_BYTES)


def authorize(request):
    assert request["authority_ref"] == "fixture:authority"
    assert request["actor_ref"] == "fixture:operator"
    return True


def preset(name="minimal"):
    path = root() / "presets/listening-md" / name
    return (json.loads((path / "document.json").read_text()), (path / "LISTENING.md").read_bytes(),
            json.loads((path / "profile.json").read_text()))


def custom(*, controls=None, text="A written source.\n", policy="full", identity="custom"):
    if controls is not None or policy != "full":
        envelope = dict(grammar=GRAMMAR, controls=controls or [], context=dict(policy=policy, max_bytes=65536))
        text += "\n```listening-controls-v1\n" + json.dumps(envelope) + "\n```\n"
    material = text.encode()
    document = create_document(material, document_id="fixture:doc:" + identity,
                               revision_ref="fixture:revision:" + identity, representation_ref="fixture:representation:" + identity,
                               artifact_ref="fixture:artifact:" + identity, authors=["fixture-author"],
                               authored_at=T0, terms_ref="fixture:terms", purpose="research")
    return document, material, compile_profile(document, material)


def control(*, target="output.form", operator="allow_values", required=True, **kwargs):
    gate = target.split(".")[0]
    value = dict(control_id="fixture:" + target, gate=gate, target=target, operator=operator, required=required)
    value.update(kwargs or dict(values=["text"]))
    return value


def adopt(data=None, state=None, **kwargs):
    data = preset() if data is None else data
    state = empty_state() if state is None else state
    defaults = dict(adoption_ref="fixture:adoption", event_ref="fixture:adopt-event", scope_path=WORKSPACE,
                    party_refs=["fixture:party"], actor_ref="fixture:operator", authority_ref="fixture:authority",
                    recorded_at=T0, effective_at=T0, capabilities=CAPS, verify_authority=authorize,
                    expected_generation=state["generation"])
    defaults.update(kwargs)
    return adopt_profile(state, *data, **defaults)


def delivery(adoption, data, *, received_ref=None, ranges=None, material=None):
    doc, source, profile = data
    selected, _ = select_context(doc, source, profile, received_representation_ref=received_ref or doc["representation_ref"],
                                 max_bytes=65536, ranges=ranges)
    return dict(adoption_ref=adoption["adoption_ref"], received_representation_ref=received_ref or doc["representation_ref"],
                received_bytes=selected if material is None else material, ranges=ranges)


def apply(state, documents, **kwargs):
    defaults = dict(application_ref="fixture:application", operation_ref=OPERATION, scope_path=PATH,
                    gate="execution", at=T1, actor_ref="fixture:operator", authority_ref="fixture:authority",
                    capabilities=CAPS, verify_authority=authorize, resolve_document=documents.__getitem__,
                    resolve_fact=lambda target: dict(value={"execution.turn_count": 1, "execution.action": "sound",
                                                          "execution.participant_refs": ["illustrative:reader-a"],
                                                          "execution.consent_refs": ["illustrative:execution-agreement"]}.get(target, "text"),
                                                     evidence_refs=["fixture:owner-fact:" + target]),
                    expected_generation=state["generation"])
    defaults.update(kwargs)
    return apply_profiles(state, **defaults)


def test_canonical_catalog_and_old_defaults_remain_distinct():
    catalog = load_listening_presets()
    assert len(catalog["presets"]) == 5
    assert all(p["adoption"] == "not_adopted" for p in catalog["presets"])
    assert CONTRACT == "akouo/v0.10"
    assert empty_state()["adoptions"] == []
    assert len(preset("research")[1]) > 4000
    for entry in catalog["presets"]:
        document, material, profile = preset(entry["id"])
        assert compile_profile(document, material) == profile
        assert material.decode().startswith("# ")
        assert contract_errors("listening-document", document) == []
        assert contract_errors("listening-profile", profile) == []


@pytest.mark.parametrize("name", ["minimal", "research", "phantom-acoustics", "covenant", "swarm"])
def test_five_frozen_profiles_have_explicit_application_and_no_execution(name):
    data = preset(name)
    before = deepcopy(data)
    state, adoption = adopt(data)
    historical = deepcopy(state)
    state, app = apply(state, {data[0]["revision_ref"]: data}, contexts=[delivery(adoption, data)])
    assert app["gate_result"] == "cleared"
    assert app["execution"] == "not_executed" and app["attestation"] == "owner_declared"
    assert app["contexts"][0]["document_sha256"] == data[0]["sha256"]
    assert app["contexts"][0]["coverage"]["kind"] == "full"
    assert data == before and historical["applications"] == []
    assert state_errors(state) == []


def test_authoring_revision_and_fork_cannot_change_bound_bytes():
    data = custom()
    state, adoption = adopt(data)
    old_state = deepcopy(state)
    kwargs = dict(revision_ref="fixture:revision:new", representation_ref="fixture:representation:new", artifact_ref="fixture:artifact:new",
                  authors=["fixture-author", "fixture-agent"], authored_at=T1, terms_ref="fixture:terms",
                  previous=data[0], expected_sha256=data[0]["sha256"])
    revised = create_document(b"Another way to listen.\n", document_id=data[0]["document_id"], **kwargs)
    forked = create_document(b"A forked inquiry.\n", document_id="fixture:doc:fork", fork=True, **kwargs)
    assert revised["lineage"][0]["kind"] == "revision_of"
    assert forked["lineage"][0]["kind"] == "fork_of"
    assert state == old_state and adoption["document_sha256"] == data[0]["sha256"]
    changed = deepcopy(kwargs); changed["expected_sha256"] = "0" * 64
    with pytest.raises(ValueError, match="revision conflict"):
        create_document(b"New material", document_id=data[0]["document_id"], **changed)
    with pytest.raises(ValueError, match="new document identity"):
        create_document(b"Fork", document_id=data[0]["document_id"], fork=True, **kwargs)


@pytest.mark.parametrize("material", [b"", b"A\0B", b"\xff", b"x" * (MAX_DOCUMENT_BYTES + 1)])
def test_invalid_or_over_limit_document_is_rejected_without_truncation(material):
    with pytest.raises((ValueError, TypeError)):
        create_document(material, document_id="a", revision_ref="b", representation_ref="c", artifact_ref="d",
                        authors=["fixture-author"], authored_at=T0, terms_ref="fixture:terms")


def test_source_layout_and_prose_fences_are_preserved_byte_exactly():
    text = "# Score\r\n\r\n  α   ·  β\r\n```text\r\n```listening-controls-v1\r\nfiction\r\n```\r\n"
    data = custom(text=text)
    assert data[2]["controls"] == []
    span = data[2]["commitment_spans"][0]
    assert span["range"] == dict(start=0, end=len(data[1]))
    assert span["sha256"] == sha256(data[1]).hexdigest()


@pytest.mark.parametrize("text", [
    '```listening-controls-v1\n{"grammar":"akouo/listening-controls/v1","grammar":"x","controls":[]}\n```',
    '```listening-controls-v1\n{"grammar":"akouo/listening-controls/v1","controls":[],"extra":1}\n```',
    '```listening-controls-v2\n{}\n```', '```listening-controls-v1\n{}',
    '```listening-controls-v1\n{}\n```\n```listening-controls-v1\n{}\n```',
    '```listening-controls-v1\n{"grammar":"akouo/listening-controls/v1","controls":[],"context":{"policy":"full","max_bytes":NaN}}\n```',
])
def test_malformed_or_ambiguous_control_envelope_stops(text):
    with pytest.raises(ValueError):
        custom(text=text)


@pytest.mark.parametrize("operator,target", [("unknown", "output.form"), ("allow_values", "output.unknown")])
def test_unknown_required_control_cannot_be_downgraded(operator, target):
    data = custom(controls=[control(operator=operator, target=target)])
    with pytest.raises(ValueError, match="Required control"):
        adopt(data)


def test_unsupported_optional_control_is_preserved_and_explicit():
    data = custom(controls=[control(operator="unknown", required=False)])
    state, adoption = adopt(data)
    state, app = apply(state, {data[0]["revision_ref"]: data}, gate="output")
    assert app["gate_result"] == "cleared"
    assert app["control_results"][0]["status"] == "unsupported"
    assert data[2]["controls"][0]["operator"] == "unknown"


@pytest.mark.parametrize("change", ["contracts", "controls", "truthy-authority", "no-authority", "stale-generation", "retroactive", "before-authorship", "invalid-expiry"])
def test_adoption_fails_closed_at_authority_and_version_boundaries(change):
    kwargs = {}
    if change in {"contracts", "controls"}:
        caps = deepcopy(CAPS); caps["supported_contracts" if change == "contracts" else "supported_controls"] = []
        kwargs["capabilities"] = caps
    elif change == "truthy-authority": kwargs["verify_authority"] = lambda _: 1
    elif change == "no-authority": kwargs["verify_authority"] = None
    elif change == "stale-generation": kwargs["expected_generation"] = 4
    elif change == "retroactive": kwargs.update(recorded_at=T1, effective_at=T0)
    elif change == "before-authorship": kwargs.update(recorded_at="2000-01-01T00:00:00Z", effective_at="2000-01-01T00:00:00Z")
    elif change == "invalid-expiry": kwargs["expires_at"] = T0
    with pytest.raises(ValueError):
        adopt(preset("research"), **kwargs)


def test_full_context_limits_are_separate_from_complete_document_identity():
    data = custom(text="α" * 2500)
    assert len(data[1]) == 5000
    with pytest.raises(ValueError, match="no text was truncated"):
        select_context(*data, received_representation_ref=data[0]["representation_ref"], max_bytes=4000)
    selected, receipt = select_context(*data, received_representation_ref=data[0]["representation_ref"], max_bytes=6000)
    assert selected == data[1] and receipt["received_sha256"] == data[0]["sha256"]
    assert receipt["coverage"]["kind"] == "full"


def test_explicit_selection_preserves_complete_digest_and_names_omissions():
    data = custom(text="αβ\n" + "x" * 5000, policy="explicit_selection")
    selected, receipt = select_context(*data, received_representation_ref="fixture:excerpt", max_bytes=100,
                                       ranges=[dict(start=0, end=4), dict(start=5, end=20)])
    assert selected == "αβ".encode() + b"x" * 15
    assert receipt["document_sha256"] == data[0]["sha256"]
    assert receipt["received_sha256"] != data[0]["sha256"]
    assert receipt["coverage"]["omitted_ranges"][0] == dict(start=4, end=5)
    assert receipt["commitments_received"] == [] and receipt["commitments_omitted"]


@pytest.mark.parametrize("ranges", [[], [dict(start=0, end=1)], [dict(start=3, end=8), dict(start=2, end=4)],
                                   [dict(start=-1, end=2)], [dict(start=0, end=99999)], [dict(start=True, end=4)]])
def test_invalid_or_unicode_cut_selection_is_rejected(ranges):
    data = custom(text="αβ\nsource", policy="explicit_selection")
    with pytest.raises(ValueError):
        select_context(*data, received_representation_ref="fixture:excerpt", max_bytes=65536, ranges=ranges)


def test_partial_context_cannot_claim_complete_source_identity_or_implicit_permission():
    for policy in ("full", "explicit_selection"):
        data = custom(policy=policy)
        with pytest.raises(ValueError):
            select_context(*data, received_representation_ref=data[0]["representation_ref"], max_bytes=65536,
                           ranges=[dict(start=0, end=4)])


def test_undeclared_context_is_blocked_and_wrong_supplied_bytes_are_rejected():
    data = preset(); state, adoption = adopt(data)
    docs = {data[0]["revision_ref"]: data}
    _, app = apply(state, docs)
    assert app["gate_result"] == "blocked" and app["context_status"] == "not_supplied"
    with pytest.raises(ValueError, match="Actual supplied bytes"):
        apply(state, docs, contexts=[delivery(adoption, data, material=b"Different source")])


@pytest.mark.parametrize("target,operator,parameters,value,expected", [
    ("input.form", "allow_values", dict(values=["text"]), "text", "cleared"),
    ("input.form", "allow_values", dict(values=["text"]), "audio", "blocked"),
    ("disclosure.destination", "deny_values", dict(values=["public"]), ["local", "public"], "blocked"),
    ("execution.turn_count", "max_value", dict(limit=2), 3, "blocked"),
    ("execution.turn_count", "max_value", dict(limit=2), True, "blocked"),
    ("execution.turn_count", "max_value", dict(limit=2), 1.5, "blocked"),
    ("execution.turn_count", "max_value", dict(limit=2), float("nan"), "blocked"),
    ("retention.consent_refs", "require_refs", dict(refs=["fixture:grant"]), ["fixture:grant"], "cleared"),
    ("retention.consent_refs", "require_refs", dict(refs=["fixture:grant"]), ["fixture:other-grant"], "blocked"),
])
def test_controls_use_actual_owner_facts_with_separate_gates(target, operator, parameters, value, expected):
    data = custom(controls=[control(target=target, operator=operator, **parameters)])
    state, adoption = adopt(data)
    _, app = apply(state, {data[0]["revision_ref"]: data}, gate=target.split(".")[0],
                   contexts=[delivery(adoption, data)], resolve_fact=lambda _: dict(value=value, evidence_refs=["fixture:fact"]))
    assert app["gate_result"] == expected
    assert "value" not in app["control_results"][0]


def test_owner_fact_absence_or_empty_evidence_is_not_enforcement():
    data = custom(controls=[control()]); state, _ = adopt(data)
    for resolver in (None, lambda _: None, lambda _: dict(value="text", evidence_refs=[])):
        _, app = apply(state, {data[0]["revision_ref"]: data}, gate="output", resolve_fact=resolver)
        assert app["gate_result"] == "blocked" and app["control_results"][0]["status"] == "not_checked"


def test_child_and_owner_restrictions_cannot_be_expanded_by_a_profile():
    parent = custom(controls=[control(values=["text"])], identity="parent")
    child = custom(controls=[control(values=["text", "audio"])], identity="child")
    state, pa = adopt(parent)
    docs = {data[0]["revision_ref"]: data for data in (parent, child)}
    state, ca = adopt(child, state, adoption_ref="fixture:child", event_ref="fixture:child-event", scope_path=RUN,
                      parent_adoption_ref=pa["adoption_ref"], resolve_document=docs.__getitem__)
    _, app = apply(state, docs, gate="output", resolve_fact=lambda _: dict(value="audio", evidence_refs=["fixture:fact"]))
    assert app["gate_result"] == "blocked" and len(app["control_results"]) == 2
    _, app = apply(state, docs, gate="output", owner_controls=[control(operator="deny_values", values=["text"])])
    assert app["gate_result"] == "blocked"


@pytest.mark.parametrize("path", [[], [dict(kind="run", ref="a"), dict(kind="workspace", ref="b")],
                                  [dict(kind="run", ref="a"), dict(kind="run", ref="b")], [dict(kind="other", ref="x")]])
def test_scope_order_cannot_be_invented_or_repeated(path):
    with pytest.raises(ValueError): adopt(scope_path=path)


def test_replacement_is_atomic_with_a_declared_boundary_and_party_authority():
    old = preset(); new = preset("phantom-acoustics")
    state, adoption = adopt(old)
    historical = deepcopy(state)
    requests = []
    def authority(request): requests.append(request); return True
    state, replacement = adopt(new, state, adoption_ref="fixture:replacement", event_ref="fixture:replacement-event",
                               replace_ref=adoption["adoption_ref"], recorded_at=T1, effective_at=T2,
                               party_refs=["fixture:new-party"], verify_authority=authority)
    assert requests[0]["action"] == "replace" and requests[0]["party_refs"] == ["fixture:party", "fixture:new-party"]
    assert active_adoptions(state, PATH, T1)[0]["adoption_ref"] == adoption["adoption_ref"]
    assert active_adoptions(state, PATH, T2)[0]["adoption_ref"] == replacement["adoption_ref"]
    assert historical["events"] == state["events"][:1]
    assert state_errors(state) == []


def test_revocation_and_expiry_leave_receipts_and_stop_next_gate():
    data = preset(); state, adoption = adopt(data)
    docs = {data[0]["revision_ref"]: data}
    state, app = apply(state, docs, contexts=[delivery(adoption, data)])
    previous = deepcopy(app)
    state, _ = revoke_adoption(state, adoption["adoption_ref"], event_ref="fixture:revoke", actor_ref="fixture:operator",
                              authority_ref="fixture:authority", recorded_at=T2, effective_at=T2, verify_authority=authorize,
                              expected_generation=state["generation"])
    assert state["applications"][0] == previous
    assert active_adoptions(state, PATH, T2) == []
    with pytest.raises(ValueError, match="No active adoption"):
        apply(state, docs, at=T3, application_ref="fixture:after-revocation")
    assert not verify_binding(dict(application_ref=app["application_ref"]), state, scope_path=PATH, operation_ref=OPERATION,
                              at=T3, resolve_document=docs.__getitem__)
    expired, _ = adopt(data, expires_at=T1)
    assert active_adoptions(expired, PATH, T1) == []


def test_parent_replacement_requires_explicit_child_rebinding():
    parent = preset(); child = preset("research"); new = preset("phantom-acoustics")
    docs = {d[0]["revision_ref"]: d for d in (parent, child, new)}
    state, pa = adopt(parent)
    state, ca = adopt(child, state, adoption_ref="fixture:child", event_ref="fixture:child-event", scope_path=RUN,
                      parent_adoption_ref=pa["adoption_ref"], resolve_document=docs.__getitem__)
    state, newpa = adopt(new, state, adoption_ref="fixture:new-parent", event_ref="fixture:new-parent-event",
                         replace_ref=pa["adoption_ref"], recorded_at=T1, effective_at=T1)
    with pytest.raises(ValueError, match="rebinding"):
        active_adoptions(state, PATH, T1)
    state, newca = adopt(child, state, adoption_ref="fixture:new-child", event_ref="fixture:new-child-event", scope_path=RUN,
                         replace_ref=ca["adoption_ref"], parent_adoption_ref=newpa["adoption_ref"], recorded_at=T1,
                         effective_at=T1, resolve_document=docs.__getitem__)
    assert [a["adoption_ref"] for a in active_adoptions(state, PATH, T1)] == [newpa["adoption_ref"], newca["adoption_ref"]]


def test_same_scope_conflicts_and_foreign_parent_are_rejected_without_mutation():
    state, adoption = adopt(); before = deepcopy(state)
    for kwargs in (dict(), dict(parent_adoption_ref="fixture:foreign-parent")):
        with pytest.raises(ValueError):
            adopt(preset("research"), state, adoption_ref="fixture:other", event_ref="fixture:other-event", **kwargs)
    assert state == before


def test_invocation_and_combined_context_budget_are_checked():
    parent = preset(); child = preset("research")
    docs = {d[0]["revision_ref"]: d for d in (parent, child)}
    state, pa = adopt(parent)
    state, ca = adopt(child, state, adoption_ref="fixture:child", event_ref="fixture:child-event", scope_path=RUN,
                      parent_adoption_ref=pa["adoption_ref"], resolve_document=docs.__getitem__)
    caps = deepcopy(CAPS); caps["max_context_bytes"] = len(child[1]) + 1
    with pytest.raises(ValueError, match="Combined contexts"):
        apply(state, docs, capabilities=caps, contexts=[delivery(pa, parent), delivery(ca, child)])
    with pytest.raises(ValueError, match="Invocation"):
        apply(state, docs, operation_ref="fixture:foreign-operation")


def test_changed_frozen_source_or_profile_cannot_be_applied():
    data = preset(); state, adoption = adopt(data)
    changed = deepcopy(data); changed[2]["context"]["policy"] = "explicit_selection"
    for corrupted in (changed, (data[0], data[1] + b" changed", data[2])):
        with pytest.raises(ValueError): apply(state, {data[0]["revision_ref"]: corrupted}, contexts=[delivery(adoption, data)])


@pytest.mark.parametrize("change", ["generation", "duplicate", "no-activation", "unsupported-version", "retroactive", "false-cleared", "unknown-context", "false-received"])
def test_imported_state_semantics_reject_inconsistent_history(change):
    data = preset(); state, adoption = adopt(data)
    state, app = apply(state, {data[0]["revision_ref"]: data})
    if change == "generation": state["generation"] = 0
    elif change == "duplicate": state["events"][0]["event_ref"] = adoption["adoption_ref"]
    elif change == "no-activation": state["events"] = []; state["generation"] -= 1
    elif change == "unsupported-version": state["adoptions"][0]["required_contracts"] = ["foreign"]
    elif change == "retroactive": state["events"][0]["recorded_at"] = T2
    elif change == "false-cleared": state["applications"][0].update(gate_result="cleared", reasons=[])
    elif change == "unknown-context": state["applications"][0]["contexts"] = [dict(adoption_ref="foreign")]
    elif change == "false-received": state["applications"][0]["context_status"] = "supplied"
    assert state_errors(state)


def test_content_free_application_yields_a_scoped_earworm_instruction_binding():
    data = preset(); state, adoption = adopt(data)
    docs = {data[0]["revision_ref"]: data}
    state, app = apply(state, docs, contexts=[delivery(adoption, data)])
    refs = binding_references(state, app["application_ref"], scope_path=PATH, operation_ref=OPERATION, at=T1, resolve_document=docs.__getitem__)
    record = json.loads((Path(__file__).parent / "fixtures/listening-profiles/earworm-instruction.json").read_text())
    document, material, _ = data
    rep = record["representations"][0]
    rep.update(representation_id=document["representation_ref"], subject_ref=document["document_id"])
    rep["artifact"].update(ref=document["artifact_ref"], sha256=document["sha256"], byte_count=len(material), inline_text=material.decode())
    record["operation_ref"] = OPERATION
    access = record["accesses"][0]
    access.update(operation_ref=OPERATION, representation_ref=rep["representation_id"], received_representation_ref=rep["representation_id"], binding_ref=refs[0]["binding_id"])
    record["binding_refs"] = refs
    assert representation_record_errors(record) == []
    callback = lambda b: verify_binding(b, state, scope_path=PATH, operation_ref=OPERATION, at=T1, resolve_document=docs.__getitem__)
    validator = lambda b, a: instruction_binding_errors(b, a, rep, state, scope_path=PATH, operation_ref=OPERATION,
                                                        at=T1, resolve_document=docs.__getitem__)
    admitted = admit_representation_record(record, supported_contracts=["earworm/representation/v1", "earworm/representation-access/v1",
                                          "earworm/representation-output/v1", "earworm/representation-record/v1", "earworm/akousma/v1.9"], validate_binding=validator)
    assert admitted == record and callback(refs[0])
    assert document["artifact_ref"] not in json.dumps(app)
    assert material.decode() not in json.dumps(app)
    modified = deepcopy(refs[0]); modified["document_sha256"] = "0" * 64
    assert not callback(modified)
    changed = deepcopy(rep); changed["artifact"]["sha256"] = "0" * 64
    assert instruction_binding_errors(refs[0], access, changed, state, scope_path=PATH, operation_ref=OPERATION,
                                      at=T1, resolve_document=docs.__getitem__)


def test_source_only_and_non_execution_receipts_cannot_activate_instructions():
    with pytest.raises(ValueError, match="No active adoption"):
        apply(empty_state(), {})
    data = preset(); state, adoption = adopt(data)
    docs = {data[0]["revision_ref"]: data}
    state, app = apply(state, docs, gate="input")
    with pytest.raises(ValueError, match="No current cleared execution"):
        binding_references(state, app["application_ref"], scope_path=PATH, operation_ref=OPERATION, at=T1, resolve_document=docs.__getitem__)


def test_clock_tie_changes_apply_to_next_gate_without_rewriting_previous_receipt():
    data = preset(); state, adoption = adopt(data)
    docs = {data[0]["revision_ref"]: data}
    state, app = apply(state, docs, contexts=[delivery(adoption, data)])
    historical = deepcopy(app)
    state, event = revoke_adoption(state, adoption["adoption_ref"], event_ref="fixture:same-clock-revoke",
                                   actor_ref="fixture:operator", authority_ref="fixture:authority", recorded_at=T1, effective_at=T1,
                                   verify_authority=authorize, expected_generation=state["generation"])
    assert app["generation"] < event["generation"]
    assert state["applications"][0] == historical and state_errors(state) == []
    assert active_adoptions(state, PATH, T1) == []


def test_binding_cannot_claim_a_required_control_was_checked_if_its_result_is_missing():
    data = preset("research"); state, adoption = adopt(data)
    docs = {data[0]["revision_ref"]: data}
    state, app = apply(state, docs, contexts=[delivery(adoption, data)])
    state["applications"][0]["control_results"] = []
    with pytest.raises(ValueError, match="Required execution control"):
        binding_references(state, app["application_ref"], scope_path=PATH, operation_ref=OPERATION, at=T1, resolve_document=docs.__getitem__)


def test_required_capability_loss_blocks_a_gate_before_later_work():
    data = preset("research"); state, adoption = adopt(data)
    caps = deepcopy(CAPS); caps["supported_controls"] = [k for k in SUPPORTED_CONTROLS if not k.startswith("output:")]
    _, app = apply(state, {data[0]["revision_ref"]: data}, gate="input", capabilities=caps)
    assert app["gate_result"] == "blocked"
    assert app["control_results"][0]["gate"] == "output"


@pytest.mark.parametrize("field,value", [("authors", ["fixture:other-author"]), ("terms_ref", "fixture:wider-terms"),
                                         ("artifact_ref", "fixture:other-artifact")])
def test_source_metadata_cannot_change_beneath_an_adoption(field, value):
    data = preset(); state, adoption = adopt(data)
    altered = deepcopy(data); altered[0][field] = value
    with pytest.raises(ValueError, match="identity mismatch"):
        apply(state, {data[0]["revision_ref"]: altered}, contexts=[delivery(adoption, data)])


def test_conflicting_inherited_allowlists_block_instead_of_choosing_an_exception():
    parent = custom(controls=[control(values=["text"])], identity="text")
    child = custom(controls=[control(values=["audio"])], identity="audio")
    docs = {data[0]["revision_ref"]: data for data in (parent, child)}
    state, pa = adopt(parent)
    state, _ = adopt(child, state, adoption_ref="fixture:child", event_ref="fixture:child-event", scope_path=RUN,
                     parent_adoption_ref=pa["adoption_ref"], resolve_document=docs.__getitem__)
    for value in ("text", "audio"):
        _, app = apply(state, docs, gate="output", resolve_fact=lambda _: dict(value=value, evidence_refs=["fixture:fact"]))
        assert app["gate_result"] == "blocked"


def test_partial_instruction_binding_checks_received_bytes_and_original_coverage():
    data = custom(text="# Source\n" + "α" * 2500, policy="explicit_selection")
    state, adoption = adopt(data)
    doc, material, profile = data
    ranges = [dict(start=0, end=9), dict(start=9, end=29)]
    ctx = delivery(adoption, data, received_ref="fixture:excerpt", ranges=ranges)
    docs = {doc["revision_ref"]: data}
    state, app = apply(state, docs, contexts=[ctx])
    binding = binding_references(state, app["application_ref"], scope_path=PATH, operation_ref=OPERATION,
                                 at=T1, resolve_document=docs.__getitem__)[0]
    access = dict(role="instruction", status="available", operation_ref=OPERATION, binding_ref=binding["binding_id"],
                  representation_ref=doc["representation_ref"], received_representation_ref="fixture:excerpt",
                  coverage=dict(kind="partial", unit="byte", ranges=ranges, omissions=["The remainder of the full revision was not supplied."]))
    rep = dict(representation_id="fixture:excerpt", artifact=dict(state="retained", sha256=sha256(ctx["received_bytes"]).hexdigest(), byte_count=len(ctx["received_bytes"])))
    check = lambda a, r: instruction_binding_errors(binding, a, r, state, scope_path=PATH, operation_ref=OPERATION,
                                                    at=T1, resolve_document=docs.__getitem__)
    assert check(access, rep) == []
    for field, value in (("received_representation_ref", doc["representation_ref"]), ("operation_ref", "fixture:other-operation"),
                         ("role", "subject"), ("coverage", dict(kind="full", unit="byte", ranges=[], omissions=[]))):
        changed = deepcopy(access); changed[field] = value
        assert check(changed, rep)
    state["applications"][0]["contexts"][0]["coverage"]["ranges"] = [dict(start=0, end=9)]
    assert check(access, rep)


def test_append_sequence_cannot_be_renumbered_without_the_corresponding_history():
    data = preset(); state, adoption = adopt(data)
    state, app = apply(state, {data[0]["revision_ref"]: data}, contexts=[delivery(adoption, data)])
    state["applications"][0]["generation"] = state["events"][0]["generation"]
    assert state_errors(state)
