# Retained ensembles and bounded orchestration

Unreleased local Python integration in `akouo_contract.orchestration`.

`plan(nodes, dissolution_rule=...)` validates a directed dependency graph of
1–16 nodes. Each node declares `id`, `depends_on` and `permission` (`granted`,
`denied` or `unknown`). Missing dependencies, duplicate IDs, self-dependencies
and cycles fail before execution. The returned plan has `execution: not_requested`.

`execute(schedule, callback, cancelled=...)` calls nodes in dependency order,
passing copies of actual completed predecessor results. Denied or unknown
permissions refuse the node; an unavailable predecessor refuses its dependents.
A callback failure or cancellation stops further execution. Cancellation checked
after a callback discards its late result. Receipts distinguish complete, refused,
failed, cancelled and not-run nodes. Termination means the bounded schedule has
stopped, not that every node succeeded. Callbacks must supply their own timeouts;
this synchronous adapter cannot interrupt a hung callback.

Dependencies declare information availability. They do not establish a listening
effect, so execution returns no influence edges. The [`/orchestrate`](../commands/orchestrate.md) contract adds declared direction
through `akouo_contract.direction.plan_orchestration`. Oida can separately resolve
retained decision-change traces before projecting canonical influence edges.

`adapt_records(records, validate_record=..., adapt_passes=..., ensemble_id=...)`
uses the existing ensemble schema and the host's canonical listening-pass adapter.
It accepts 2–16 distinct supported records, at most 16 retained passes, and at least
two distinct attributable participants. Repeated passes, conflicting participant
identities and already-influenced inputs are refused. Two passes by the same actor
do not become two invented participants.

The adapter retains exact source snapshots, participant and pass identities, and
source-scoped disagreements. Original claims, decisions, access, permissions,
model identities and renderings stay in those snapshots. The adapter's pass
`claim_refs` and `decision_refs` are empty because it creates no new claims or
decisions. Disagreements are not automatically moved into a new record's local
scope or resolved. The host must preserve these snapshots, supply permission
checks, bind contexts and validate the final canonical record before storage.

These helpers do not launch models, infer permission from a dependency, or write
records themselves. `oida` supplies the local owner API and persistence boundary.

## Scheduled ensembles and ear swarms

Direction, execution and redirection answer different questions:

| Retained evidence | Supported description | Influence edges |
| --- | --- | --- |
| Declared ears, direction and dependency graph | Scheduled work; execution not requested | Empty |
| Completed independent passes with preserved identities | Plural listening ensemble | Empty |
| Attributed input report and chronological decision change | Recorded redirection within an ensemble | References to the affected passes and the supported effect |

A person's direction is not a grant of wider authority. Parameter and ensemble
references do not identify an active human director. `none` means no active director
was declared, not that the listening lacked apparatus, dependencies or conditions.
Permissions remain per pass; unavailable predecessor results cannot authorize a
successor. Failed, refused, cancelled and not-run passes remain distinct receipts.

A bounded schedule terminates when its selected work completes or stops under the
recorded rule. It does not keep spawning corrective passes until agreement appears.
The resulting reports retain their own categories, basis, uncertainty and identity.
An `ear_swarm` projection requires evidenced redirection and preservation fields;
scheduling two ears, counting model calls or assigning a director cannot establish it.
Oida's supported decision-change trace is participant attribution backed by retained
inputs and decisions. It is not an independent causal measurement.
