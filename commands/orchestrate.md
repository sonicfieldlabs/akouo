# /orchestrate

Declare selected ears, attributable passes, dependencies and a direction before
execution. Direction can be a parameter, ensemble, agent, person, or `none` for no
active director. A direction reference is not authority to widen a pass permission.

Use `schemas/orchestration-request.schema.json` and
`akouo_contract.direction.plan_orchestration`. Each ear binds one participant to
existing listening modes; each pass binds an ear to dependencies and a granted,
denied or unknown permission. References must resolve. The planner reuses A5's
bounded scheduler and rejects duplicate ears/passes, missing references and cycles.

The returned `akouo/orchestrate/v0.1` object retains the request, direction and
schedule with `execution: not_requested`, an undetermined claim category and empty
influence edges. A host can execute the schedule through A5 with bounded callbacks
and separate receipts. This command does not execute models or decide that a
participant redirected another. Evidence of an actual change belongs to a retained
influence trace, not to direction labels or scheduling order.

The router selects planning only. Report bodies, original categories, basis,
permissions and pass identity remain distinct. Do not merge independent reports
into a single inferred consensus, treat a person as a model, or invent a director
when direction is `none`.
