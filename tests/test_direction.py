from copy import deepcopy
import pytest
from akouo_contract.direction import plan_orchestration


def request():
    return dict(
        contract="akouo/orchestrate/v0.1",
        request_id="fixture:plan",
        ears=[
            dict(id="ear", participant_ref="participant", modes=["signal-inspection-listening"])
        ],
        passes=[
            dict(id="first", ear_ref="ear", depends_on=[], permission="granted"),
            dict(
                id="second", ear_ref="ear", depends_on=["first"], permission="unknown"
            ),
        ],
        direction={"kind": "none"},
        resolved_refs=["participant", "director"],
        dissolution_rule="Selected passes complete or stop",
    )


@pytest.mark.parametrize("kind", ["none", "parameter", "ensemble", "agent", "person"])
def test_declared_direction_is_not_influence(kind):
    value = request()
    value["direction"] = (
        {"kind": kind} if kind == "none" else {"kind": kind, "ref": "director"}
    )
    original = deepcopy(value)
    result = plan_orchestration(value)
    assert value == original
    assert result["schedule"]["order"] == ["first", "second"]
    assert result["schedule"]["nodes"][1]["permission"] == "unknown"
    assert result["execution"] == "not_requested" and result["influence_edges"] == []
    assert result["claim_category"] == "undetermined"


@pytest.mark.parametrize(
    "mutation",
    [
        lambda r: r["direction"].update(ref="invented"),
        lambda r: r["passes"][0].update(ear_ref="missing"),
        lambda r: r["passes"][0].update(depends_on=["second"]),
        lambda r: r["ears"][0].update(modes=["invented"]),
        lambda r: r.update(resolved_refs=[]),
    ],
)
def test_unsupported_direction_and_pass_inputs_refused(mutation):
    value = request()
    mutation(value)
    with pytest.raises(ValueError):
        plan_orchestration(value)
