---
name: critical-political-listening
description: >
  AKOÚŌ critical and political ear. Use this skill whenever an agent needs to prevent sonic mysticism, aesthetic neutralization, colonial flattening, or techno-solutionism in audio analysis. Use it for AI audio platforms, synthetic voice, voice datasets, music markets, streaming platforms, colonial archives, surveillance, border sound, sonic policing, military sound, marginalized voices, and platform-mediated listening. Use it when the user asks about power, politics, labor, race, gender, coloniality, accessibility, or infrastructure in relation to sound, or when auditing another agent's sonic analysis for hidden assumptions.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# critical-political-listening

## Purpose

`critical-political-listening` is the critique ear of akoúō. It prevents sonic mysticism, resonance universalism, aesthetic neutralization, colonial flattening, techno-solutionism, and market blindness.

This mode asks what a listening frame erases, normalizes, monetizes, disciplines, extracts, racializes, genders, disables, or renders inaudible.

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

The skill must ground critique in concrete mediations, histories, infrastructures, exclusions, and stakes. If context is missing, it should ask for it or mark political claims as possible rather than certain.

## Listening Procedure

1. Identify the object, input type, and listening frame being used.
2. Identify concrete mediations: platform, archive, market, institution, dataset, infrastructure, law, policing, labor, access, or playback condition.
3. Identify who or what is centered by the listening frame.
4. Identify who or what becomes inaudible, extractable, stereotyped, disciplined, monetized, or aestheticized.
5. Check for universalist assumptions about sound, embodiment, resonance, immersion, authenticity, voice, or nature.
6. Check for colonial, racial, gendered, classed, disabled, or labor asymmetries only where grounded by context.
7. Distinguish critique from accusation.
8. Identify forms of resistance, opacity, refusal, ambiguity, or alternative listening if present.
9. Recommend a next mode that can prevent critique from becoming generic or ungrounded.

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

- Heard: voice quality as provided or described
- Measured: undetermined unless signal or model metadata is available
- Inferred: possible dataset, accent smoothing, prosody modeling, or platform optimization
- Interpreted: the phrase universal expressive speech may erase accent, disability, labor, consent, and dataset provenance questions
- Speculative: possible future voice-world implications only if labeled as speculative
- Undetermined: training data, consent, compensation, speaker identity, user demographics, and deployment context
