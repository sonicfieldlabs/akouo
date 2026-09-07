# /second-report (opt-in)

Register this command only after negotiating `akouo/companions/v0.1` and the
required contracts in `agent-routes.manifest.json`. It is separate from the
released command enum.

1. Resolve the retained source records and report pointers within authorized
   host scope. Supply actual record and Earworm access validators.
2. Call `plan_second_report(request, access, records=records,
   validate_record=validate_record, validate_access=validate_access)` with
   `profile: second_report`, `relation.of: record`, and fresh receiving IDs.
3. Retain the returned plan and source snapshots. An abstention stops dispatch.
4. A later host runtime may dispatch `companions/skills/second-report/SKILL.md`.
   Check its output with the existing `agent_route_report_errors` and store a
   separate account only under an independently authorized storage decision.

The Python package plans and checks contracts. It does not execute this command
in the reference app or a model host.
