"""Bounded orchestration over existing ensemble and listening-pass contracts."""

from copy import deepcopy
from .validation import contract_errors


def plan(nodes, *, dissolution_rule, max_passes=16):
    if (
        type(max_passes) is not int
        or not isinstance(nodes, list)
        or not 1 <= len(nodes) <= max_passes
        or max_passes > 16
    ):
        raise ValueError("Orchestration requires 1–16 bounded passes")
    if not isinstance(dissolution_rule, str) or not dissolution_rule.strip():
        raise ValueError("Termination rule required")
    index = {}
    for n in nodes:
        if (
            set(n) != {"id", "depends_on", "permission"}
            or not isinstance(n["id"], str)
            or not n["id"]
            or n["id"] in index
        ):
            raise ValueError("Invalid or duplicate pass node")
        if (
            not isinstance(n["depends_on"], list)
            or any(not isinstance(d, str) for d in n["depends_on"])
            or len(set(n["depends_on"])) != len(n["depends_on"])
        ):
            raise ValueError("Invalid dependencies")
        if n["permission"] not in ("granted", "denied", "unknown"):
            raise ValueError("Invalid pass permission")
        index[n["id"]] = n
    if any(d not in index or d == n["id"] for n in nodes for d in n["depends_on"]):
        raise ValueError("Unresolved or self dependency")
    order = []
    while len(order) < len(nodes):
        ready = [
            n["id"]
            for n in nodes
            if n["id"] not in order and set(n["depends_on"]) <= set(order)
        ]
        if not ready:
            raise ValueError("Cyclic pass dependency")
        order.extend(ready)
    return dict(
        contract="akouo/orchestration-plan/v0.1",
        nodes=deepcopy(nodes),
        order=order,
        dissolution_rule=dissolution_rule,
        execution="not_requested",
    )


def execute(schedule, run, *, cancelled=lambda: False):
    checked = plan(schedule["nodes"], dissolution_rule=schedule["dissolution_rule"])
    results = {}
    receipts = []
    for identifier in checked["order"]:
        node = next(n for n in checked["nodes"] if n["id"] == identifier)
        if cancelled():
            receipts.append(dict(pass_id=identifier, status="cancelled"))
            break
        if node["permission"] != "granted" or any(
            d not in results for d in node["depends_on"]
        ):
            receipts.append(dict(pass_id=identifier, status="refused"))
            continue
        try:
            result = run(
                identifier, deepcopy({d: results[d] for d in node["depends_on"]})
            )
        except Exception:
            receipts.append(dict(pass_id=identifier, status="failed"))
            break
        if cancelled():
            receipts.append(dict(pass_id=identifier, status="cancelled"))
            break
        results[identifier] = deepcopy(result)
        receipts.append(
            dict(
                pass_id=identifier,
                status="complete",
                dependency_refs=list(node["depends_on"]),
            )
        )
    visited = {r["pass_id"] for r in receipts}
    receipts.extend(
        dict(pass_id=i, status="not_run") for i in checked["order"] if i not in visited
    )
    return dict(
        contract="akouo/orchestration-result/v0.1",
        results=results,
        receipts=receipts,
        terminated=True,
        dissolution_rule=checked["dissolution_rule"],
        influence_edges=[],
    )


def adapt_records(records, *, validate_record, adapt_passes, ensemble_id):
    if not 2 <= len(records) <= 16:
        raise ValueError("Aggregate 2–16 records")
    if len({r["akousma_id"] for r in records}) != len(records):
        raise ValueError("Duplicate source records")
    passes = []
    participants = {}
    bindings = []
    seen = set()
    for record in records:
        errors = validate_record(record)
        if errors:
            raise ValueError("; ".join(errors))
        if record.get("auditum", {}).get("ensemble", {}).get("influence_edges"):
            raise ValueError("Independent aggregation refuses influenced ensembles")
        for listening in record.get("auditum", {}).get("listenings", []):
            if len(passes) >= 16:
                raise ValueError("Aggregate at most 16 retained passes")
            if listening.get("influenced_by"):
                raise ValueError("Independent aggregation refuses influenced inputs")
            pid = listening.get("listening_pass_ref") or listening["listening_id"]
            if pid in seen:
                raise ValueError("A retained pass cannot be counted twice")
            seen.add(pid)
            actor = dict(id=listening["listener_id"], type=listening["listener_type"])
            if actor["id"] in participants and participants[actor["id"]] != actor:
                raise ValueError("Conflicting participant identity")
            participants[actor["id"]] = actor
            p = dict(
                id=pid,
                listener_id=actor["id"],
                route=listening.get("route") or ["memory-lineage-listening"],
                started_at=listening["created_at"],
                moment=dict(relation="archive", scales=["archive"]),
                source_refs=[record["akousma_id"]],
                claim_refs=[],
                decision_refs=[],
                influenced_by=[],
            )
            errors = contract_errors("listening-pass", p)
            if errors:
                raise ValueError("; ".join(errors))
            passes.append(p)
            bindings.append(
                dict(
                    pass_id=pid,
                    listening_id="aggregate:" + pid,
                    report_namespace="retained:" + record["akousma_id"],
                    contract="akouo/retained-listening/v0.1",
                )
            )
    ensemble = dict(
        id=ensemble_id,
        kind="plural_listening",
        participant_ids=list(participants),
        listening_pass_ids=[p["id"] for p in passes],
        influence_edges=[],
        permissions_preserved=True,
        disagreements_preserved=True,
        dissolution_rule="Stop after these retained inputs; no new listening or inferred influence",
    )
    errors = contract_errors("ensemble", ensemble)
    if errors:
        raise ValueError("; ".join(errors))
    adapted = adapt_passes(
        passes=passes,
        participants=list(participants.values()),
        bindings=bindings,
        ensemble=ensemble,
    )
    return dict(
        contract="akouo/retained-ensemble/v0.1",
        adapted=adapted,
        source_snapshots={r["akousma_id"]: deepcopy(r) for r in records},
        disagreements=[
            dict(source_record_ref=r["akousma_id"], disagreement=deepcopy(d))
            for r in records
            for d in r.get("auditum", {}).get("disagreements", [])
        ],
    )
