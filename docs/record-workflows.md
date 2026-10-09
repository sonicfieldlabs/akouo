# Retained-record research, derivation and subsequent-listening decisions

Unreleased local A11/A12/A13 contracts. `record_workflows.py` consumes
`record-workflow-request.schema.json`. These adapters are deliberately separate
from the perception report builder and do not create a listening pass, run a model,
start a job or write to a store. The host supplies Earworm's canonical validators
(`akousma.validation_errors`, `next_record_reference_errors`) and resolved evidence.
Never replace those validators with an accepting stub in an application.

All routes accept at most 32 explicitly selected records, exact source references,
an attributed actor, per-source granted permission references and a timestamp after
the retained inputs. Missing, duplicate, restricted or unsupported inputs fail.
Permission references are host declarations, not independent rights verification.
Each result retains source SHA-256 fingerprints without copying source claims into
a new listening. Owners must recheck current content, permission and cancellation
before committing a result; building a record is not a transaction or a receipt.

## A11: research through memory-lineage-listening

`research_proposal(request, records, validate_record=..., validate_references=...)`
returns a canonical E15 `research_proposal` for the existing Akousmata-owned research
service to store and review. It accepts only E14 `similar_by` relations with named
source/target inputs, criterion, method/revision, normalization, score policy and
resolved evidence references. Earworm validates the complete relation and record.
A declared known score remains attributable to its supplied method/evidence; this
adapter does not compute a score or verify a method's scientific validity.

The proposal author must match the relation author. Review starts `unreviewed`;
reported/measured source claims cannot be promoted into the proposal. Categories
remain inferred, interpreted or undetermined. A numerical comparison is not evidence
of an independently repeated listening. Review and ancestry deduplication belong to
K9 in the existing research service; no second scheduler or all-pairs scan is added.

## A12: bounded derivation

`derivation_plan(request, records, parameter_policy=..., validate_record=...)`
returns named parents, a proposed prompt and numerical parameters, all explicitly
`speculative`, with `execution: not_requested`. The trusted host supplies a policy
identity/revision and the exact allowed parameter names, bounds and units. The caller
cannot widen these through the request. Nonfinite numbers and out-of-range or extra
parameters fail. A later GERM adapter executes only after its normal admission and
provider checks; this plan is neither a generated asset nor a provider receipt.

This contract supports one or several sources and arbitrary host-declared numerical
parameter policies. Mapping descriptors into those proposals remains the explicit
G6/G4 implementation. It proposes a new sound; it cannot reconstruct arbitrary audio
from retained reports.

## A13: decide after a later listening

`generation_decision(request, records, output_evidence=..., validate_record=...,
validate_references=...)` returns a canonical E16 `generation_decision`. The host must
resolve the generated asset and receipt before supplying `output_evidence`: retained
status, generation/output references, asset SHA-256, receipt reference and the exact
(record, listening, output) bindings. Do not pass arbitrary client evidence directly
into this trusted argument. The adapter does not read audio bytes or authenticate a
provider receipt itself.

Earworm resolves the generated record and actual listening identity and checks
chronology. An output plan, missing pass, mismatched asset binding, or a decision
before its input fails. Keep/discard cannot schedule another job; revise/variation
follow the declared next-job and stop/defer rules. The next job remains planned and
execution remains not requested. Reasons and policy revisions remain explicit.
A model interprets its supplied evidence; it cannot inherit another listener's
embodied hearing. A decision trace does not prove improved output quality.

## Validation and remaining integrations

Synthetic E14/E15/E16 fixtures exercise real canonical validation and isolated store
round trips. Positive cases preserve original accounts; negative cases cover scope,
permissions, chronology, scores, parameter bounds, output binding and next-job rules.
No live model or generated sound was used for these contract tests.

K9/O18 will connect research storage/reconciliation to the existing owner service.
G6/G4/G1/G3/G5/G8 will connect plans and decisions to GERM's existing queue,
providers, lifecycle and receipts. Those integrations are tracked separately in D4.
