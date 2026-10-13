# LISTENING.md authoring and operation

Opt-in source: `akouo-contract` 0.12.1. The global `akouo/v0.10`
contract, legacy schemas, listening modes and existing presets retain their
identities. This lifecycle is a new interface. Installing its examples does
not adopt a document or change a host's listening identity.

## Four identities

A document revision identifies exact UTF-8 bytes, authorship, terms, and
authoring lineage. A profile identifies the control parser and its complete
result, with preserved prose ranges and the complete document metadata digest.
That digest pins authorship and terms beside the exact source bytes.
An adoption fixes that document and
profile to an authorized scope. An application identifies an operation, gate,
actual supplied context, and control checks. Editing or forking a file creates
a new proposal and leaves all adoption and application records untouched.

| Schema | Contract |
| --- | --- |
| `listening-document` | `akouo/listening-document/v1` |
| `listening-profile` | `akouo/listening-profile/v1` |
| `listening-capabilities` | `akouo/listening-capabilities/v1` |
| `listening-adoption` | `akouo/listening-adoption/v1` |
| `listening-lifecycle-event` | `akouo/listening-lifecycle-event/v1` |
| `listening-application` | `akouo/listening-application/v1` |
| `listening-state` | `akouo/listening-state/v1` |

The canonical [five files](../presets/listening-md/README.md) have frozen
sidecars and catalog hashes. Public examples should reproduce the selected
revision, not reconstruct it from a summary or from a host's context excerpt.
The covenant example's parties and consent references are illustrative. A
real agreement needs actual participants and authority; the file supplies
neither acceptance nor a determination of legal standing.

## The control envelope

One top-level Markdown fence labelled `listening-controls-v1` may contain a
JSON envelope with `grammar: akouo/listening-controls/v1`, `controls`, and an
optional `context` policy. Duplicate keys, malformed envelopes, repeated
envelopes and unsupported grammar versions fail explicitly. A similarly
labelled fence inside another fenced work remains source material. It cannot
activate itself.

Controls name an ID, gate, target, operator and whether support is required.
The supported operators are `allow_values`, `deny_values`, `max_value`, and
`require_refs`. The first two restrict values; a maximum restricts a numeric
count; reference requirements need independently verified owner facts. The
supported target and operator combinations are in `SUPPORTED_CONTROLS`.
Required combinations must be supported by both this grammar and the host.
An unsupported optional control stays in the profile and its relevant gate
reports `unsupported`. It never becomes a checked control by being included
in model context.

Every byte outside the control envelope is retained through commitment spans.
The exact source remains necessary to recover that prose. The parser makes
no claim to enforce the meaning of a paragraph. It also does not reinterpret
the existing Covenant grammar, whose permissive parser and versioned schema
remain unchanged.

## Complete material and received context

`create_document` accepts nonempty, NUL-free UTF-8 bytes up to one MiB.
Oversized or invalid material fails; no prefix is accepted in its place.
`compile_profile` checks the complete document hash and length before parsing.
Revision and fork operations require the parent's expected digest and new
revision and representation identities. Owners must resolve and persist those
immutable revisions separately from an editable draft.

The default context policy requires the full document within 65,536 bytes.
Hosts declare their own context byte budget, which can be narrower. Full
delivery either fits or fails. `explicit_selection` permits declared, ordered
byte ranges that preserve UTF-8 codepoints. A partial selection has a separate
representation identity and SHA-256. Its receipt records the complete document
digest, exact ranges and omissions. Commitments wholly received and commitments
not wholly received have separate references. Preserving a commitment at the
owner does not imply that its entire text reached a provider.

The total supplied context must also fit the host budget. This byte contract
does not estimate a provider's token budget. A provider adapter must enforce
that additional limit before delivery and record the same actual selection.
The current Oída v0.1 orientation snapshot remains a separate bounded API;
its 4,000-character prefix cannot represent complete-file adoption here.

## Scope, authority, and maintenance

Scope paths have increasing specificity: workspace, workflow, swarm, run,
invocation. A path may skip levels but cannot reorder or repeat them. Hosts
authenticate scope references, including the relation between a run and its
workspace. An invocation reference must match its operation. A child adoption
names the active parent at the next broader adopted scope.

Controls accumulate across that chain and the owner's current restrictions.
Every relevant restriction must hold. Disjoint allowlists therefore block a
gate, and a child's wider allowlist grants no wider permission. Commitments
remain attributable to each scope. They are carried in broader-to-narrower
order; the library does not claim to settle a conflict between their meanings.
Participants can record a new proposal or explicitly replace the agreement.

At one scope, overlapping adoptions are conflicts. `adopt_profile` with a
`replace_ref` closes the old adoption and starts the replacement atomically
at its declared effective time. Replacement authority covers the old and new
parties, including a party removed by the proposal. `revoke_adoption` stops
subsequent gates at its boundary; expiry has the same effect without rewriting
history. A replaced or revoked parent leaves its children blocked until an
explicit rebinding. Already recorded applications remain unchanged.

Timestamps must be explicit UTC. A new event cannot take effect before it was
recorded, and append operations cannot be backdated behind existing entries.
Lifecycle mutations require an exact expected generation. Every appended entry
has its own generation, which orders gates and changes sharing a clock tick.
Historical applications resolve against their earlier event prefix. Each function
returns a detached state, so a failed validation leaves the original intact.
The owner supplies authority verification for adoption, replacement, revocation
and application. A truthy declaration is insufficient: verification must
return `True`. These callbacks and the clock belong to the authenticated host.

## Applications and Earworm

`apply_profiles` checks one of the input, execution, output, retention or
disclosure gates. Its fact resolver returns a typed value with independently
verified evidence references. Missing facts or unsupported required controls
block that gate. Host capability changes are checked again at each gate.
Optional unsupported controls remain visible. Receipts retain control identity
and result without copying private values or source prose.

An execution application requires actual supplied bytes for every adopted
profile in its scope chain. Declared ranges must reproduce those bytes exactly.
The receipt says `attestation: owner_declared` and `execution: not_executed`.
It attributes context delivery and gate facts to the host and certifies no
model behavior or private experience. The owner must obey a blocked decision
and enforce all subsequent applicable gates. This library invokes no model,
transmits no context, and accesses no owner store.

`binding_references` produces Earworm references only for a current, cleared
execution application at the same operation and scope. `verify_binding` checks
the reference against that application and the exact frozen source.
`instruction_binding_errors` also checks the actual access and received
representation hash, length and coverage. It supplies the list-of-errors
interface required by Earworm's admission callback:

```python
from akouo_contract.listening_profiles import instruction_binding_errors

def validate_binding(binding, access):
    received = representations[access["received_representation_ref"]]
    return instruction_binding_errors(
        binding, access, received, lifecycle_state,
        scope_path=authenticated_scope_path,
        operation_ref=operation_ref,
        at=owner_gate_time,
        resolve_document=immutable_document_resolver,
    )
```

Earworm independently verifies the admitted representation's bytes. A source
or context access never activates this instruction path. Another operation,
different received material, stale parent binding or revoked adoption cannot
reuse its receipt. A check at input, output or retention supplies no instruction
binding. Complete document identity stays distinct from received context.

## Consumer responsibilities

Owners atomically persist returned state after comparing its expected
generation. They authenticate authority, parties, scope paths and clocks;
resolve exact document revisions; qualify their fact adapters; and enforce
gate decisions. A commitment's presence remains distinct from obedience.
Digests and references are content-free but linkable. Disclosure of these
receipts still follows the applicable terms.

Oída runtime adoption and provider context loading, Akousmata custody, and
Khipu editor/History/Station integration remain pending consumer work. The
current candidates change no active workspace, vendor pin, service or
published record. The synthetic tests qualify contracts and software behavior,
not a model run or an actual agreement between external parties.
