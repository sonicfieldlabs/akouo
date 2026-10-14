"""Coupled installed AKOÚŌ/Earworm conformance; no model or owner runtime."""
from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path

import pytest
from akousma.representations import representation_record_errors, representation_measurement_errors
from akouo_contract.representations import (
    plan_representation_route, representation_output_errors, load_representation_routes,
)

FIXTURES = Path(__file__).parent / "fixtures/representations"


def read(name):
    return json.loads((FIXTURES / (name + ".json")).read_text())


def plan(name="listen", *, request=None, record=None, capabilities=None, measurements=None):
    return plan_representation_route(request or read("requests")[name], record or read(name),
                                     capabilities or read("capabilities"), validate_record=representation_record_errors,
                                     measurements=measurements, validate_measurement=representation_measurement_errors)


def report(route, record):
    output = record["outputs"][0]
    return {"contract": "akouo/representation-output/v1", "route_ref": route["decision"]["id"],
            "operation_ref": record["operation_ref"], "output_ref": output["output_id"],
            "claims": [{"claim_id": "fixture:claim:unknown", "category": "undetermined",
                        "representation_ref": route["received_refs"][0], "statement": "No acoustic event is established by this fixture.",
                        "evidence_refs": [route["received_refs"][0]]}]}


@pytest.mark.parametrize("name", ["listen", "sound", "return", "partial", "read-file"])
def test_primary_text_and_work_routes_without_audio(name):
    value = read(name)
    before = deepcopy(value)
    route = plan(name, record=value)
    assert route["decision"]["outcome"] == "proceed"
    assert route["execution"] == "not_requested"
    assert not route["claim_permissions"]["heard_allowed"]
    assert not route["claim_permissions"]["measured_allowed"]
    assert value == before
    assert len(read("partial")["representations"][0]["artifact"]["inline_text"]) > 4000


def test_packaged_manifest_negotiates_new_contracts_and_preserves_old_global_contract():
    assert load_representation_routes()["contract"] == "akouo/representation-route/v1"
    from akouo_contract import CONTRACT
    assert CONTRACT == "akouo/v0.10"
    request = read("requests")["listen"]
    request["supported_contracts"] = ["akouo/agent-route/v0.1"]
    with pytest.raises(ValueError, match="Unsupported required contracts"):
        plan(request=request)


@pytest.mark.parametrize("which", ["input", "output", "convention", "unknown-convention", "context-as-subject", "heard", "unmeasured", "prompt-as-work", "return-basis"])
def test_unsupported_or_confused_routes_abstain(which):
    request = read("requests")["listen"]
    source = read("listen")
    capabilities = read("capabilities")
    if which == "input":
        capabilities["input_forms"] = ["audio"]
    elif which == "output":
        capabilities["output_forms"] = ["audio"]
    elif which == "convention":
        source["representations"][0]["convention"] = {"status": "declared", "id": "fixture:notation", "revision": "1"}
    elif which == "unknown-convention":
        source["representations"][0]["convention"] = {"status": "unknown", "reason": "No convention supplied."}
    elif which == "context-as-subject":
        source["accesses"][0]["role"] = "context"
    elif which in {"heard", "unmeasured"}:
        request["requested_categories"] = ["heard" if which == "heard" else "measured"]
    elif which == "prompt-as-work":
        request.update(intent="sound", output_kind="prompt")
    elif which == "return-basis":
        request["intent"] = "relisten"
    route = plan(request=request, record=source, capabilities=capabilities)
    assert route["decision"]["outcome"] == "abstain"
    assert not route["claim_permissions"]["interpreted_allowed"]


def test_convention_is_negotiated_by_revision():
    source = read("listen")
    source["representations"][0]["form"] = "morse"
    source["representations"][0]["convention"] = {"status": "declared", "id": "fixture:morse", "revision": "1"}
    capabilities = read("capabilities")
    capabilities["input_forms"].append("morse")
    capabilities["conventions"] = [{"id": "fixture:morse", "revision": "1"}]
    assert plan(record=source, capabilities=capabilities)["decision"]["outcome"] == "proceed"
    capabilities["conventions"][0]["revision"] = "2"
    assert plan(record=source, capabilities=capabilities)["decision"]["outcome"] == "abstain"


def test_invalid_or_missing_host_validator_cannot_be_bypassed():
    args = (read("requests")["listen"], read("listen"), read("capabilities"))
    for callback in (None, lambda value: True):
        with pytest.raises(TypeError, match="validator"):
            plan_representation_route(*args, validate_record=callback)
    with pytest.raises(ValueError, match="Refused by host"):
        plan_representation_route(*args, validate_record=lambda value: ["Refused by host"])
    assert plan("refused")["decision"]["outcome"] == "abstain"


def test_foreign_contract_identity_cannot_be_accepted_by_wrong_callback():
    value = read("listen")
    value["contract"] = "foreign/opaque/v1"
    with pytest.raises(ValueError, match="Unsupported representation-record"):
        plan_representation_route(read("requests")["listen"], value, read("capabilities"), validate_record=lambda v: [])


@pytest.mark.parametrize("name,completed", [("listen", "account"), ("sound", "work")])
def test_completed_outputs_bind_to_retained_route(name, completed):
    route = plan(name)
    record = read(completed)
    value = report(route, record)
    assert not representation_output_errors(value, route, record, validate_record=representation_record_errors)
    if completed == "work":
        value["claims"] = []
        assert not representation_output_errors(value, route, record, validate_record=representation_record_errors)
    value["route_ref"] = "other:route"
    assert representation_output_errors(value, route, record, validate_record=representation_record_errors)


def test_same_id_cannot_hide_changed_input_bytes_after_routing():
    route = plan()
    record = read("account")
    original = record["representations"][0]
    text = original["artifact"]["inline_text"] + "changed\n"
    raw = text.encode("utf-8")
    original["artifact"].update(inline_text=text, sha256=sha256(raw).hexdigest(), byte_count=len(raw))
    assert not representation_record_errors(record)
    assert any("changed after routing" in e for e in representation_output_errors(report(route, record), route, record, validate_record=representation_record_errors))


def test_measurement_is_scoped_to_actual_text_and_its_separate_method():
    request = read("requests")["listen"]
    measurement = read("measurement")
    request["measurement_refs"] = [measurement["measurement_id"]]
    request["requested_categories"].append("measured")
    route = plan(request=request, measurements=[measurement])
    assert route["decision"]["outcome"] == "proceed"
    assert route["claim_permissions"]["measured_allowed"]
    record = read("account")
    value = report(route, record)
    value["claims"].append({"claim_id": "fixture:claim:bytes", "category": "measured", "representation_ref": measurement["representation_ref"],
                            "statement": "The admitted fixture's UTF-8 byte count was supplied by a deterministic method.",
                            "evidence_refs": [measurement["measurement_id"]], "measurement_ref": measurement["measurement_id"]})
    assert not representation_output_errors(value, route, record, validate_record=representation_record_errors)
    value["claims"][1]["representation_ref"] = "unavailable:waveform"
    assert representation_output_errors(value, route, record, validate_record=representation_record_errors)
    measurement["representation_ref"] = "unavailable:waveform"
    assert plan(request=request, measurements=[measurement])["decision"]["outcome"] == "abstain"


def test_output_kind_source_scope_and_no_response_have_distinct_meanings():
    route = plan("sound")
    record = read("work")
    record["outputs"][0]["kind"] = "prompt"
    assert not representation_record_errors(record)
    assert representation_output_errors(report(route, record), route, record, validate_record=representation_record_errors)
    source = read("work")
    source["accesses"][0]["role"] = "context"
    assert any("changed after routing" in e for e in representation_output_errors(report(route, source), route, source, validate_record=representation_record_errors))


def test_negative_measured_claim_and_missing_uncertainty_are_rejected():
    route = plan()
    record = read("account")
    value = report(route, record)
    value["claims"][0]["category"] = "measured"
    assert representation_output_errors(value, route, record, validate_record=representation_record_errors)
    value["claims"] = []
    assert representation_output_errors(value, route, record, validate_record=representation_record_errors)
