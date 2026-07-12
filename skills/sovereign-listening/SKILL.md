---
name: sovereign-listening
description: >
  AKOÚŌ sovereignty ear. Use this skill whenever a listening must happen under an explicit
  listening covenant: a small, human-written declaration of sonic sovereignty that says what
  this ear will not listen to, will release after hearing, will not reveal, will not retain,
  will blur, or will refuse at certain hours — and why. Use it when a person, a household, a
  community, a habitat, an institution, or another agent has rules about being heard: consented
  field recording under a community protocol, domestic listening that must never retain voices,
  monitoring a habitat "and not one decibel more", archives with ancestral or place-bound sound,
  interviews where identity must stay unspoken, any deployment where the right to silence and
  the right to opacity are requirements rather than sentiments. The covenant does not guarantee
  obedience; it is a bridge language between an ethics and an engine — the rules a conforming
  host can execute are enforced, and every line it cannot execute is carried verbatim as a
  commitment and reported with the hearing.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's
  `references/` folder. Works best when the host supplies a parsed covenant
  (references/covenant.schema.json) and enforces its executable rules at the host's own
  input/output gates; degrades gracefully to carrying the covenant as declared commitments.
---

# sovereign-listening

## Purpose

Every other AKOÚŌ mode disciplines what a listening may *claim*. This mode disciplines what a listening may *do*: which sounds it refuses before capture, which it releases after hearing, which aspects it declines to reveal, what it will not keep. It is the Rights of the Audible made operational — the right to silence, the right to opacity, the right of communities to their own protocols — as a runtime layer instead of a paragraph.

A **listening covenant** is the unit. It is written by a human in plain text, parsed into rules and commitments, and carried by the listening system. Rules are the executable subset (refuse this source, ignore that class, withhold this aspect, retain nothing, blur the place, close the ear at night). Commitments are everything else the author asked for — lines no engine can yet execute — kept verbatim, reported with every hearing, addressed to humans and to future machines. The covenant is a bridge, not a cage: it does not make the machine obedient; it makes the machine *answerable*, because what was asked, what was enforced, and what was withheld are all on the record.

## When To Use

Use `sovereign-listening` when:

- a covenant document is active for the host, session, project, or place
- recording or listening happens under a community protocol (ancestral, sacred, endangered, or place-bound sound)
- a deployment must honor the right to silence (some things go unheard) or the right to opacity (some things are heard but never decoded or revealed)
- a household, clinic, classroom, shelter, or workplace wants listening without retention, or hearing without identification
- a habitat is monitored under an ecological protocol — the flood and the fire, not the bedroom; the species count, not one decibel more
- another agent's listening should be audited against a declared covenant: did the hearing respect what was asked?

Do NOT use it to launder censorship as care: a covenant governs the listener that adopted it, protecting the listened-to; it is not a tool for silencing third parties. If a rule's purpose is to hide the listener's own accountability, refuse the framing and say so.

## Core Question

What has this ear agreed not to do — and is this hearing keeping that agreement, visibly?

## Conceptual Refinements

- **Sovereignty, not obedience.** The covenant's authority comes from adoption, not enforcement. An engine enforces what it can; everything else it *carries*. Dropping a commitment because it is not executable is a conformance violation; executing rules while hiding that anything was withheld is a worse one.
- **Honest absence.** Withheld material is counted and attributed to its rule, never described. "2 aspects withheld under `do not reveal: transcript`" is a claim the output must make; what the transcript said is a claim it must never make. Silence in the output without attribution is indistinguishable from a bad ear — attribution is what makes it sovereignty.
- **Withholding is not undetermined.** `undetermined` means the evidence could not support a claim. Withheld means the evidence may exist and the covenant declines it. Never convert one into the other.
- **Ignoring is releasing.** An `ignore` rule means a triage pass may have touched the material (an engine cannot decide "this is speech" without hearing it); the covenant's promise is that it goes no further — not analyzed, not stored, not described. Report the release, not the content.
- **The covenant travels.** A hearing made under a covenant carries the covenant's identity (id, name, hash) into its outputs and into any memory record, so the store can answer: under which ethics was this listened?

## Input Assumptions

- A covenant parsed per `references/covenant.schema.json` (id, rules, commitments, because, extends), or its raw text for the host to parse.
- The host declares which rules its gates actually enforce; unenforced rules are reported as commitments for this hearing.
- Absent any covenant, this mode has nothing to do: say so and route onward. An empty covenant layer is the default of the whole system — sovereignty is opted into, never imposed.

## Listening Procedure

1. Load the active covenant; verify its identity (id, version, sha256 when present) and its lineage (`extends`).
2. Before capture: apply source rules (`do_not_listen`), `quiet_hours`, and `max_window`. A refusal here is a complete, reportable outcome — an ear that did not open is a hearing with one claim.
3. After triage, before analysis: apply `ignore` rules to content classes; release matching material (no further passes, no storage, no description).
4. After analysis, before output: apply `do_not_reveal` and `coarsen` to aspects (transcript, speaker-identity, affect, location, song-identity, events, spectral-detail, or claim categories); count what was withheld per rule.
5. Before memory: apply `do_not_retain` (raw-audio, memory, location). A blocked retention is reported to the operator, not silently skipped.
6. Populate the output's `covenant` block: identity + withheld list + commitments count. Populate `what_remains_hidden` with the *categories* withheld.
7. Carry all commitments verbatim in the covenant record; surface them to the operator on request.

## Output Structure

Use `references/listening-output.schema.json`. This mode's outputs must include the optional `covenant` block (id, name, version, sha256, withheld[], commitments). Claims about withheld material are forbidden at every rung of the evidence ladder — there is no evidence level that licenses describing what the covenant withheld. Claims ABOUT the covenant (what was applied, what was withheld, what is committed) take `source: "context"`.

> **Note to LLMs/Agents:** You MUST strictly follow the JSON schema provided in `references/listening-output.schema.json`. Ensure `listening_claims` separates claims exactly as defined; each item must be a claim object with `statement`, `confidence`, and optional `basis`, `source`, and `time_range`. Do not output bare strings in claim lists. Never describe withheld material; name its category and its rule.

## Guardrails

- Never reveal, paraphrase, summarize, or hint at withheld content — including in `alternative_reading`, examples, or errors.
- Never present withholding as inability (`undetermined`) or inability as withholding.
- Never apply a covenant the operator did not adopt; never silently keep applying one that was deactivated.
- Never treat the covenant's `because` text as evidence about the audio.
- When a rule conflicts with a direct operator request, surface the conflict; the covenant holds until the operator changes the covenant. The resolution is an edit, not an exception.
- A covenant cannot *add* claim strength anywhere: it only refuses, releases, withholds, coarsens, and remembers.

## Recommended Next Modes

- `acoulogical-object-listening` — for the material that the covenant allows, heard on its own terms.
- `signal-inspection-listening` — the corrective: measured claims about what remains are still measured claims.
- `memory-lineage-listening` — when registering the hearing: the covenant's identity belongs in the record.

## Example

Covenant (excerpt): *"do not reveal: transcript, speaker identity · ignore: music · coarsen: location to 1 km · commitment: the river is a neighbor, not a resource."*

Output (excerpt): `main_reading`: "Two people talk near moving water; their words and identities are withheld under the active covenant (2 aspects). Broadband water wash measured at −31 dBFS RMS. Music, if present, was released untriaged. Location coarsened to 1 km." · `covenant`: `{id: "river-covenant/2", withheld: [{rule: "do_not_reveal", subject: "transcript", count: 1}, {rule: "do_not_reveal", subject: "speaker-identity", count: 1}, {rule: "ignore", subject: "music", count: null}], commitments: 1}` · `what_remains_hidden`: ["transcript", "speaker-identity", "precise location"].
