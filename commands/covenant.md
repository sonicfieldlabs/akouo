# /covenant

## Purpose

`/covenant` is the sovereignty command of akoúō. It loads, verifies, and applies a listening covenant — a human-written declaration of what this ear will not listen to, will release after hearing, will not reveal, will not retain, will blur, or will refuse at certain hours — and runs the listening under it, reporting what was enforced, what was withheld, and what remains as commitment.

Use it when the listening answers to someone: a person's right to silence, a household's retention rules, a community's protocol for ancestral or place-bound sound, a habitat's "and not one decibel more."

## When To Use

Use `/covenant` for:

- listening under an active covenant and reporting its effects honestly
- adopting, inspecting, or verifying a covenant before any capture happens
- auditing a prior hearing (own or another agent's) against a declared covenant
- explaining a covenant back to its author: which lines the engine enforces, which it carries as commitments
- registering a hearing whose memory record must say under which ethics it was listened

The default of every chain is NO covenant: sovereignty is opted into by the operator, never imposed by the tool. `/covenant` with no covenant available reports exactly that and stops.

## Skills Called

- `akouo-router`
- `sovereign-listening` (primary)
- `acoulogical-object-listening` (secondary)
- `signal-inspection-listening` (corrective)

## Execution Order

1. Run `akouo-router`; the covenant's existence, identity, and enforcement surface are part of the evidence inventory.
2. Run `sovereign-listening`: verify the covenant (id, version, sha256, lineage), apply pre-capture rules, and declare which rules the host's gates enforce.
3. Run `acoulogical-object-listening` on what the covenant admits — the allowed material deserves a full perceptual description on its own terms.
4. Run `signal-inspection-listening` as corrective: measured claims about the remaining material stay measured.
5. Synthesize; populate the output's `covenant` block (identity + withheld list + commitments count) and `what_remains_hidden` with withheld categories. When the host will store the hearing, the memory record carries the covenant's identity (spec v1.3 `covenant` block in akousma stores).

## Expected Output

Use `schemas/command-output.schema.json`.

The command output must include:

- the routing plan naming `sovereign-listening` as primary and the covenant's id in `object_listened_to` context
- per-mode outputs with the `covenant` block present on every listening output produced under it
- a claim summary in which no claim, at any evidence level, describes withheld material — withheld categories are named, attributed to their rules, and counted
- the covenant's non-executable commitments carried verbatim in the sovereign-listening output (or referenced by count with the covenant's identity when the host keeps commitment text local)

## Guardrails

- Withholding is attributed, never silent; absence without attribution is indistinguishable from a bad ear.
- Withheld is not `undetermined`; `undetermined` is not withheld. Keep the vocabulary apart.
- A covenant governs the listener that adopted it. Refuse framings that use it to silence third parties or to hide the operator's own accountability.
- Conflicts between covenant and request are surfaced, not resolved by exception: the covenant holds until its author changes it.
