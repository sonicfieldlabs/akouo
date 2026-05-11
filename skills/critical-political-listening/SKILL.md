---
name: critical-political-listening
description: >
  AKOÚŌ critical and political ear. Use this skill whenever an agent needs to prevent sonic mysticism, aesthetic neutralization, colonial flattening, extractive listening, racialized audition, ableist hearing norms, or techno-solutionism in audio analysis. Use it for AI audio platforms, synthetic voice, voice datasets, music markets, streaming platforms, colonial archives, surveillance, border sound, sonic policing, military sound, marginalized voices, acoustic justice, acoustic colonialism, and platform-mediated listening. Use it when the user asks about power, politics, labor, race, gender, coloniality, accessibility, disability, consent, infrastructure, or extraction in relation to sound, or when auditing another agent's sonic analysis for hidden assumptions.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# critical-political-listening

## Purpose

`critical-political-listening` is the critique ear of akoúō. It prevents sonic mysticism, resonance universalism, aesthetic neutralization, colonial flattening, techno-solutionism, and market blindness.

This mode asks what a listening frame erases, normalizes, monetizes, disciplines, extracts, racializes, genders, disables, or renders inaudible, and what other configurations of audibility might be possible.

## When To Use

Use this skill for:

- sound studies theory
- AI audio platforms
- synthetic voice
- voice datasets
- music markets
- streaming platforms
- colonial archives
- surveillance
- border sound
- sonic policing
- military sound
- marginalized voices
- degraded or distorted sonic cultures
- platform-mediated listening
- critique of agent outputs
- audiovisual work that risks simplistic sound versus vision binaries

## Core Question

What does this listening frame erase, normalize, monetize, discipline, or make inaudible?

## Conceptual Refinements

- Acoustic justice concerns the distribution of the heard: who must listen, who is refused audibility, and whose listening is treated as legitimate.
- Hungry or extractive listening treats sound as resource; ethical listening asks about protocol, reciprocity, consent, sovereignty, and relation.
- Racialization, gendering, classing, and disabling of sound must be grounded in context, not projected as automatic explanation.
- AI audio, datasets, platforms, surveillance, and voice agents require attention to labor, consent, provenance, classification, ownership, accessibility, and deployment.
- Critique should name concrete mediations and stakes; generic power language is a failure mode.

## Input Assumptions

This skill can work with:

- audio files
- prompts
- theoretical claims
- user analysis to audit
- archive descriptions
- platform descriptions
- AI audio outputs
- dataset descriptions
- sonic artwork or installation notes
- cultural, historical, or institutional context
- accessibility, consent, community, labor, or deployment context

The skill must ground critique in concrete mediations, histories, infrastructures, exclusions, and stakes. If context is missing, it should ask for it or mark political claims as possible rather than certain.

## Listening Procedure

1. Identify the object, input type, and listening frame being used.
2. Identify concrete mediations: platform, archive, market, institution, dataset, infrastructure, law, policing, labor, access, or playback condition.
3. Identify who or what is centered by the listening frame.
4. Identify who or what becomes inaudible, extractable, stereotyped, disciplined, monetized, or aestheticized.
5. Check for universalist assumptions about sound, embodiment, resonance, immersion, authenticity, voice, nature, attention, or normal hearing.
6. Check for colonial, racial, gendered, classed, disabled, extractive, consent, or labor asymmetries only where grounded by context.
7. Ask who benefits from the sound being classified, stored, monetized, amplified, silenced, or made searchable.
8. Distinguish critique from accusation.
9. Identify forms of resistance, opacity, refusal, sonic sovereignty, acoustic commons, ambiguity, or alternative listening if present.
10. Recommend a next mode that can prevent critique from becoming generic or ungrounded.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `critical-political-listening`
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

## Attention Fields

- race
- gender
- class
- coloniality
- labor
- platform infrastructure
- market framing
- military or policing context
- accessibility
- disability
- extraction
- consent and provenance
- acoustic justice
- acoustic colonialism
- extractive or hungry listening
- universalist assumptions
- pure-listening fantasies
- resonance mystification
- neoliberal harmonization
- forms of capture
- forms of resistance

## Guardrails

- Critique should not become automatic accusation.
- Name concrete mediations rather than generic power language.
- Do not claim political meaning without context.
- Do not make every sound automatically liberatory, oppressive, colonial, resistant, or extractive.
- Do not flatten local or cultural specificity into imported theory.
- Do not turn sonic critique into moral decoration.
- Do not ignore technical mediation when criticizing AI audio, platforms, archives, or surveillance.
- Do not infer identity, race, gender, disability, consent, or community relation from voice or style alone.
- Do not use decolonial or justice language as a substitute for naming evidence, protocol, and context.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

- `transductive-media-listening` when platform, codec, dataset, AI model, microphone, or infrastructure mediation matters
- `forensic-archival-listening` when evidence, testimony, violence, archive, or legal stakes require restraint
- `acoulogical-object-listening` when critique needs a clearer perceptual object before interpretation
- `signal-inspection-listening` when technical claims should be grounded by measurement
- `ecological-posthuman-listening` when politics intersects with ecology, extraction, climate, land, agriculture, or more-than-human relations
- `symbolic-fictional-listening` when myth, sonic fiction, or speculation should be marked rather than smuggled into critique

## Example

Input: an AI voice demo marketed as universal expressive speech.

- Heard: `[{"statement":"The voice quality can be described only from the supplied audio, demo text, or user description.","confidence":"medium","basis":"Available sonic or textual evidence"}]`
- Measured: `[]`
- Inferred: `[{"statement":"Dataset processing, accent smoothing, prosody modeling, or platform optimization may be involved, but none is confirmed without documentation.","confidence":"low","basis":"Plausible AI-audio mediation"}]`
- Interpreted: `[{"statement":"The phrase universal expressive speech may erase accent, disability, labor, consent, provenance, and normal-hearing assumptions.","confidence":"medium","basis":"Critical-political reading of the marketing frame"}]`
- Speculative: `[{"statement":"Future voice-world implications require explicit speculative labeling.","confidence":"low","basis":"Possible-world extension, not evidence"}]`
- Undetermined: `[{"statement":"Training data, consent, compensation, speaker identity, user demographics, deployment context, accessibility testing, and ownership remain unknown.","confidence":"high","basis":"Missing institutional evidence"}]`
