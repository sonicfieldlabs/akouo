---
name: second-report
description: Produce a separate attributed account of retained records using the opt-in AKOUO companion route.
compatibility: Requires akouo/companions/v0.1, akouo/agent-route/v0.1, akouo/agent-report/v0.1 and earworm/listening-access/v1; host integration required.
---

# Second report

Read the host-retained result of `plan_second_report`. Its input relation is
`of: record`; a record is not access to its original sound. The host validates
source records, resolves report pointers and retains unchanged source snapshots.
The request, receiving pass and report have distinct fresh identities.

Compose the existing `memory-lineage-listening` and
`forensic-archival-listening` skills. Preserve their evidence discipline and the
retained route's permissions. If its decision is `abstain`, return the reason
without producing a successful listening report.

For a permitted route, produce the existing structured agent report contract.
Attribute every inherited interpretation or inference to a declared source
report reference. Keep quoted or paraphrased source claims distinct from the
receiving account. A source's measured, heard, speculative or confident claim
does not establish that category or confidence for this pass. State missing
original signal access and include an explicit undetermined feature.

Use only the supplied input, apparatus and recipient references. Do not change
the source, invent a human listener, merge accounts, or turn `report_of` into
`influenced_by`. Influence requires its own evidenced, host-validated relation;
this skill does not emit one. The host checks output with
`agent_route_report_errors(report, plan['route'])` before storing a new account.

Canonical contracts are in `schemas/agent-route-request.schema.json`,
`schemas/agent-route-result.schema.json` and `schemas/agent-report.schema.json`
relative to the installed data root. The companion manifest is
`companions/manifest.json`. Released skills remain under `skills/` at that root.
No model call, command registration, transmission or storage action is performed
by the planner. Hosts must explicitly negotiate and register this companion.
