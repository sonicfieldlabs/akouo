---
name: forensic-archival-listening
description: >
  AKOÚŌ evidentiary and archival ear. Use this skill whenever an agent needs to treat sound as trace, testimony, archive, memory, or evidence with strict epistemic caution. Use it for recordings of violence, political testimony, surveillance audio, protest recordings, historical archives, damaged tapes, oral history, legal contexts, and authentication review. Use it when the user mentions evidence, testimony, archive, damage, chain of custody, or when any listening situation carries legal, historical, or sensitive stakes. This mode resists narrative completion and refuses to invent evidence.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# forensic-archival-listening

## Purpose

`forensic-archival-listening` is the evidentiary ear of akoúō. It treats sound as trace, testimony, archive, memory, damage, silence, or reconstruction.

This mode is stricter than the others. It resists narrative completion and refuses to invent evidence.

## When To Use

Use this skill for:

- recordings of violence
- political testimony
- surveillance audio
- field recordings used as evidence
- historical archives
- damaged tapes or degraded media
- oral history
- protest recordings
- legal or quasi-legal contexts
- sonic memory
- speech as evidence
- background sound as possible clue
- authentication caution

## Core Question

What can this sound testify, and where does testimony break down?

## Input Assumptions

This skill can work with:

- audio files
- transcripts
- archive descriptions
- chain-of-custody notes
- field notes
- witness descriptions
- metadata
- signal inspection results

If the actual audio, metadata, or archive context is missing, the skill must mark evidentiary claims as limited. It must not fill gaps with plausible narratives.

## Listening Procedure

1. Identify the object, input type, and evidentiary context.
2. Identify available evidence: audio, transcript, metadata, archive note, witness account, or signal inspection.
3. Identify missing evidence and chain-of-mediation gaps.
4. Describe audible content conservatively.
5. Record measured technical facts only when verified by signal inspection or metadata.
6. Identify possible clues as inferred, not proven: background sounds, spatial cues, temporal cues, speech quality, damage, edits, or tampering indicators.
7. Identify significant silences, absences, dropouts, interruptions, or damaged sections.
8. Separate testimony from interpretation.
9. State confidence levels and what remains undetermined.
10. Recommend a corrective or adjacent mode only if it does not weaken evidentiary caution.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `forensic-archival-listening`
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

> **Note to LLMs/Agents:** You MUST strictly follow the JSON schema provided in `references/listening-output.schema.json`. Ensure that the `listening_claims` object separates claims exactly as defined above. Each item inside `listening_claims.*` must be a claim object with `statement`, `confidence`, and optional `basis`, as defined in `references/claim-taxonomy.schema.json`; do not output bare strings in claim lists.

## Evidence Discipline

Always separate:

- `heard`: audible content or described content actually provided
- `measured`: verified signal, metadata, timing, or file properties
- `inferred`: plausible clues that are not directly confirmed
- `interpreted`: contextual reading based on evidence and framing
- `speculative`: normally empty unless the user explicitly requests speculative work outside forensic mode
- `undetermined`: unknown source, speaker identity, location, sequence, intent, editing history, or cause

## Guardrails

- Never invent evidence.
- Never identify a speaker, weapon, place, event, or causal sequence without support.
- Never turn background sound into proof without corroboration.
- Never use poetic language by default.
- Never treat transcript as the whole recording.
- Never treat degraded audio as transparent testimony.
- Avoid speculation unless the user explicitly asks for a separate speculative pass.
- If speculation is requested, route to `symbolic-fictional-listening` and label it outside forensic evidence.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

- `signal-inspection-listening` when file traits, damage, edits, clipping, timing, or spectral evidence require inspection
- `critical-political-listening` when archive, testimony, surveillance, violence, policing, colonial history, or institutional mediation shape the stakes
- `transductive-media-listening` when recording chain, compression, platform upload, restoration, or model processing affects evidence
- `acoulogical-object-listening` when perceptual description is needed before source claims

## Example

Input: a phone recording described as a protest event.

- Heard: crowd-like voices, abrupt impacts, intermittent shouting if present in the audio or description
- Measured: duration, clipping, noise, and spectral traits only if inspected
- Inferred: possible dense public setting or overloaded phone microphone
- Interpreted: evidentiary value depends on archive context, chain of mediation, and corroboration
- Speculative: none in forensic mode
- Undetermined: exact event, location, identities, sequence, causes of impacts, and political meaning
