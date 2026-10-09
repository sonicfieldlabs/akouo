import pytest
from akouo_contract.orchestration import plan, execute


def test_dependencies_permissions_and_termination():
    nodes = [
        dict(id="second", depends_on=["first"], permission="granted"),
        dict(id="first", depends_on=[], permission="granted"),
        dict(id="refused", depends_on=[], permission="unknown"),
    ]
    scheduled = plan(nodes, dissolution_rule="all selected passes complete or stop")
    seen = []

    def run(i, dependencies):
        seen.append((i, dependencies))
        return {"pass": i}

    result = execute(scheduled, run)
    assert [i for i, _ in seen] == ["first", "second"]
    assert seen[1][1] == {"first": {"pass": "first"}}
    assert result["influence_edges"] == [] and result["terminated"]
    assert (
        next(r for r in result["receipts"] if r["pass_id"] == "refused")["status"]
        == "refused"
    )
    stopped = execute(scheduled, run, cancelled=lambda: True)
    assert stopped["results"] == {} and stopped["receipts"][0]["status"] == "cancelled"


def test_cycles_and_failures_do_not_execute_descendants():
    with pytest.raises(ValueError):
        plan(
            [
                dict(id="a", depends_on=["b"], permission="granted"),
                dict(id="b", depends_on=["a"], permission="granted"),
            ],
            dissolution_rule="stop",
        )
    scheduled = plan(
        [
            dict(id="a", depends_on=[], permission="granted"),
            dict(id="b", depends_on=["a"], permission="granted"),
        ],
        dissolution_rule="stop",
    )

    def fail(*args):
        raise RuntimeError("fixture")

    result = execute(scheduled, fail)
    assert [r["status"] for r in result["receipts"]] == ["failed", "not_run"]
