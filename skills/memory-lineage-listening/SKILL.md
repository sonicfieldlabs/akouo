---
name: memory-lineage-listening
description: >
  AKOÚŌ memory and lineage ear. Use this skill whenever an agent should listen WITH stored sound-memories: comparing a current sound against previously recorded listening records, situating a sound in its lineage (what it derives from, varies, answers, or repeats), tracking recurrence and change over time, registering a new listening into a sound-memory store, or answering questions like "have we heard this before?", "what is this sound's history in our archive?", "how has this place/instrument/voice changed across recordings?", or "which earlier sounds does this one descend from?". Use it for akousma/akousmata-style record stores, personal or institutional sound archives, versioned sound-design iterations, longitudinal field-recording series, and any workflow where memory of past listenings should inform — but never replace — present listening.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
  Works best when the host supplies stored records (for example earworm-style akousma records); degrades gracefully to declaring memory unavailable.
---

# memory-lineage-listening

## Purpose

`memory-lineage-listening` is the memory ear of akoúō. It listens to the present sound through what the store already holds: earlier listening records, their claims, their provenance, and their lineage links.

A stored sound-memory is not a frozen copy of a past event. Replaying or re-reading a record reactualizes it under new conditions, so every comparison is a new listening, not a lookup. This mode keeps that distinction audible: it reports what the store suggests while marking memory as its own evidence stream, never as direct proof about the present sound.

This is also the mode that writes memory well. When a workflow registers a listening into a store, this ear decides what the record should carry: which claims, which apparatus declaration, which lineage note, and which uncertainties must travel with the sound into every later context.

## When To Use

Use this skill for:

- comparing a current sound against stored listening records
- recurrence questions: have we heard this, or something kin to it, before?
- lineage questions: what does this sound derive from, vary, answer, or repeat?
- change-over-time questions across a series of recordings of the same place, instrument, voice, or system
- registering a new listening into a sound-memory store with lineage notes
- reviewing what an archive holds about a sound, and what it conspicuously lacks
- auditing a store: duplication, gaps, absent provenance, dead or unattributable records

## Core Question

What do our stored listenings suggest about this sound, what is this sound's lineage, and what must the present listening refuse to inherit from memory?

## Conceptual Refinements

- Memory is an evidence stream of its own. Claims that come from stored records take `source: "memory"` and never migrate into `heard` or `measured` for the present sound.
- A store reflects its curation, not the world. Absence from the store is not novelty in the world; presence in the store is not importance. Say which store was consulted and how far the query reached.
- Records reactualize. A stored record was produced by a specific apparatus under a specific contract; comparing it to the present sound compares two listenings, not two sounds. Prefer comparing claims-with-provenance over comparing summaries.
- Lineage is a relation between records, not a causal proof. "Derived from", "variant of", "response to", and "recurrence of" are curatorial links; keep them in `interpreted` unless the store carries verified provenance for the derivation.
- Dead records count. A record with missing provenance, a broken media reference, or an unreachable source is still lineage information; report it as an archive-of-absence rather than discarding it.
- Memory can be extractive. Recording someone's sound into a store is an act with consent and access stakes; registering a listening should carry the capture conditions and rights notes the store requires, and flag their absence.

## Input Assumptions

This skill works best with:

- a present sonic object (audio file, prompt, transcript, field note, or prior mode outputs) AND
- stored records supplied by the host: record identifiers, summaries, claims, provenance, lineage links, timestamps

If no store is available, the skill must say so and stop short of memory claims. It may still describe what a memory pass would require. It must never invent stored records, record identifiers, or lineage.

> **Modality Constraint for Agents:** If the host has not supplied stored records or store query results, you MUST leave memory-based claims empty or mark them `undetermined`. Do not hallucinate an archive.

## Listening Procedure

1. Identify the present sonic object and what evidence exists for it (defer to prior mode outputs when present).
2. Identify the store: which store, which query, how many records were consulted, and what the query could not reach.
3. Read the consulted records' claims with their provenance and apparatus declarations, not just their titles or summaries.
4. Compare: name concrete points of kinship and difference between the present listening and stored listenings, each with confidence and basis.
5. Situate lineage: which records the present sound plausibly derives from, varies, answers, or repeats — as interpreted claims unless provenance verifies the link.
6. Track change: when records form a series, describe what changed across time and what stayed stable, marking the apparatus differences that could explain apparent change.
7. Name absences: what the store lacks about this sound (missing eras, missing perspectives, missing consent notes, dead records).
8. When registering: state what the new record should carry — claims, apparatus, lineage note, uncertainties — and populate the `memory` block (`akousma_id` when the host assigns one, `akousmata_refs` for consulted records, `lineage_note`).
9. Recommend the next mode based on what memory cannot settle.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `memory-lineage-listening`
- `listening_claims.heard`
- `listening_claims.measured`
- `listening_claims.inferred`
- `listening_claims.interpreted`
- `listening_claims.speculative`
- `listening_claims.undetermined`
- `what_appears`
- `what_remains_hidden`
- `mediations.technical`
- `mediations.cultural`
- `mediations.spatial`
- `mediations.bodily`
- `mediations.archival`
- `mediations.computational`
- `risks.hallucination`
- `risks.over_identification`
- `risks.cultural_flattening`
- `risks.forensic_overreach`
- `risks.source_confusion`
- `risks.aesthetic_overstatement`
- `main_reading`
- `alternative_reading`
- `recommended_next_mode`

Since v0.6 the shared schema also carries optional fields this mode should use whenever the host supports them: `memory` (`akousma_id`, `akousmata_refs`, `lineage_note`), `apparatus`, `listener`, `akouo_version`, and per-claim `source` and `time_range`. Give every memory-derived claim `source: "memory"`.

> **Note to LLMs/Agents:** You MUST strictly follow the JSON schema provided in `references/listening-output.schema.json`. Ensure that the `listening_claims` object separates claims exactly as defined above. Each item inside `listening_claims.*` must be a claim object with `statement`, `confidence`, and optional `basis`, `source`, and `time_range`, as defined in `references/claim-taxonomy.schema.json`; do not output bare strings in claim lists.

## Guardrails

- Never invent stored records, identifiers, counts, or lineage links.
- Never present a memory-derived claim as `heard` or `measured` for the present sound; memory claims carry `source: "memory"` and usually live in `inferred` or `interpreted`.
- Never treat similarity between records as identity of source, place, or author.
- Never treat absence from the store as evidence about the world.
- Never let a store's past labels overwrite present listening; disagreement between memory and the present pass is a finding, not an error.
- Name the store and query scope; a comparison against three records must not read like a comparison against an archive.
- Respect consent and rights notes on stored records; flag records that lack them instead of freely quoting their content.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

- `acoulogical-object-listening` when the present sound needs fresh perceptual description independent of memory
- `signal-inspection-listening` when apparent change across records could be apparatus change and needs measurement
- `forensic-archival-listening` when lineage claims acquire evidentiary or custody stakes
- `transductive-media-listening` when record formats, codecs, or store migrations shape what memory can say
- `critical-political-listening` when curation, consent, access, or extraction stakes surface in the store
- `ecological-posthuman-listening` when a longitudinal series concerns habitat or environmental change

## Example

Input: a new harbor field recording plus three stored records tagged with the same harbor across two years.

- Heard: `[{"statement":"The present recording contains low continuous machinery tone with intermittent gull-like calls, as described by the prior perceptual pass.","confidence":"medium","basis":"Present listening output","source":"audio"}]`
- Measured: `[]`
- Inferred: `[{"statement":"The stored records and the present listening plausibly form a series of the same harbor position, based on matching store tags and recurring machinery-tone descriptions.","confidence":"low","basis":"Store tags and claim overlap across three consulted records","source":"memory"}]`
- Interpreted: `[{"statement":"Across the series, bird-activity claims thin while machinery claims persist, which reads as a lineage of increasing mechanical dominance at this site.","confidence":"low","basis":"Comparison of stored claims over two years; apparatus varied between records","source":"memory"}]`
- Speculative: `[]`
- Undetermined: `[{"statement":"Whether the apparent change reflects the site, the season, recorder position, or apparatus differences remains undetermined; two records lack capture notes and one media reference is dead.","confidence":"high","basis":"Missing provenance in consulted records"}]`
