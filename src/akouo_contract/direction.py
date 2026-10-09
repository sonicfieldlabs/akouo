"""Declared orchestration direction over the bounded A5 scheduler."""

from copy import deepcopy
from .orchestration import plan
from .validation import contract_errors


def plan_orchestration(request):
    errors = contract_errors("orchestration-request", request)
    if errors:
        raise ValueError("; ".join(errors))
    ears = {ear["id"]: ear for ear in request["ears"]}
    if len(ears) != len(request["ears"]):
        raise ValueError("Duplicate ear identity")
    if any(p["ear_ref"] not in ears for p in request["passes"]):
        raise ValueError("Unresolved pass ear")
    if set(ears) != {p["ear_ref"] for p in request["passes"]}:
        raise ValueError("Every selected ear requires a pass")
    direction = request["direction"]
    if direction["kind"] != "none" and direction["ref"] not in request["resolved_refs"]:
        raise ValueError("Unresolved direction reference")
    if any(
        ear["participant_ref"] not in request["resolved_refs"] for ear in ears.values()
    ):
        raise ValueError("Unresolved ear participant")
    nodes = [
        {k: p[k] for k in ("id", "depends_on", "permission")} for p in request["passes"]
    ]
    schedule = plan(nodes, dissolution_rule=request["dissolution_rule"])
    return dict(
        contract="akouo/orchestrate/v0.1",
        request=deepcopy(request),
        schedule=schedule,
        direction=deepcopy(direction),
        execution="not_requested",
        influence_edges=[],
        claim_category="undetermined",
        basis="Declared direction and dependencies; no listening effect measured",
    )
