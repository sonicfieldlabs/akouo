# Opt-in companion routes

`akouo/companions/v0.1` adds portable second-report packaging, explicit
scale/register selection and per-ear plans. In the v0.10 source, the beyond-band
ear selects the promoted `beyond-band` preset and begins with
`agent-native-listening`. Import from
`akouo_contract.companions`; installed assets live below the package data root.

`plan_second_report` validates actual retained records through a required host
callback, resolves raw JSON Pointers, preserves snapshots and checks receiving
identity freshness. It reuses the existing route and output validators. The
bundled skill composes memory-lineage and forensic listening. It does not
introduce an influence relation or treat source claims as new measurements.

`route_tags` accepts explicit annotations under `route-tags.schema.json`.
Core MASA 0.2.0 registers and scales map to existing skills; namespaced labels
remain visible as unmapped. Unrecognized unnamespaced labels fail. A label such
as `cosmic`, `microtemporal` or `cosmological-speculative` establishes neither
audibility, physical resolution nor permission to speculate. Selection does not
change claim permissions. The host resolves the annotation's basis references;
the mapping does not verify the truth of an annotation.

Source modality is separately qualified as acoustic, non-acoustic, mixed or an
explicit absence. The relation declares whether this pass addresses a sampled
representation, retained record or observation. The complete access declaration
is retained independently: physical capture, sampled representation, effective
model input and human access keep their original qualifications. An acoustic
representation of a non-acoustic source is possible; the tag vocabulary does
not collapse those axes or infer one from another.

For existing observation accounts, `tags_from_matter_context` reuses Earworm's
`matter_context_errors(context, source, access)`. Supply the actual validator
and an explicit annotator. Resolve both the source-record and context IDs in the
route scope. Temporal resolution remains in the original validated context;
the tag mapping grants no additional temporal capability.

| Ear | Existing configuration | Accepted input / constraint |
| --- | --- | --- |
| radio | music preset, existing agent corrections | representation / agent |
| room | material-event first, field preset | representation / agent; optional separately attributed human account |
| beyond_band | beyond-band preset | representation / beyond; existing spectral gate required |
| sky | existing observation agent route | observation / agent; no simulated acoustic access |
| sent_sound | explicitly selected existing preset | explicit agent, second_report or beyond route; explicit retention selection |

Call `plan_ear_route(selection, request, access, validate_access=...)`.
`selection` contains its contract, ear and `retention: {mode: none}` or
`{mode: policy, policy_ref: ...}`. Sent sound also requires `selected_preset`.
The latter selects a stored preset by ID; its memory settings grant no read or
write authorization. Retention policy selection requires a host callback
`validate_retention(policy_ref, subject_ref)` resolving policy in this subject's
scope. The planner never applies retention, reads a store or writes a record.

Optional `tags` supply the explicit annotation. Beyond routes also require the
existing `spectral_request`; the selected preset cannot bypass that gate.
Unsupported categories produce the existing route abstention. Unsupported ear
input types, missing negotiated contracts or invalid metadata raise ValueError.
Missing callbacks or callbacks not returning a list of error strings raise
TypeError. All callbacks receive copies and must validate host-owned evidence.

A room's optional `human_account_ref` must also be a declared `report_of_refs`
input. Supply retained `records`, `validate_record(record)` and
`validate_human_account(record, ref, subject_ref)` to verify its human authorship,
separate pass identity, and relationship to this room's subject using the host's
listening context. Without an account, omit that field; no human report is
fabricated. All declared report inputs require validated source snapshots.
The receiving agent report still cannot claim to have heard the room.

Returned plans contain the original route request and gate result, composed
existing mode chain, selection, source snapshots and optional tag plan. Validate
generated reports with `agent_route_report_errors(report, plan['route'])`.
Retain plans in host-owned storage: an edited permission object is not authority.
`execution: not_requested` is literal. Runtime command registration, model
dispatch, DSP, retention enforcement and end-user flows remain host work.

The optional `scripts/validate-earworm-scenarios.py` integration runner accepts
Earworm's portable `fixtures/scenarios/matrix.json`. With the local Python
packages installed, it checks five routed accounts and a generation-lineage
record using actual Earworm and AKOÚŌ validators, plus 12 unsupported-category,
borrowed-pass and attribution cases. It performs no model or processing call.
