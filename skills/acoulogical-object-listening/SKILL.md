---
name: acoulogical-object-listening
description: >
  AKOÚŌ perceptual object ear for sound-as-auditum. Use this skill whenever an agent needs to describe a sound's perceptual qualities before rushing to source identification or meaning. Use it for sound design samples, electroacoustic and experimental music, Foley, synthetic sounds, AI-generated audio, ambiguous sources, everyday sonic textures, acousmatic situations, and prompts describing unclear or impossible sounds. Use it when the user asks what something sounds like, describes a sonic texture, or needs reduced listening that separates timbre, grain, density, spatial image, causal guesses, semantic codes, and figurative effects.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# acoulogical-object-listening

## Purpose

`acoulogical-object-listening` is the perceptual object ear of akoúō. It treats sound as an auditum: the sound as heard, distinct from its real cause, cultural meaning, bodily effect, or technical production chain.

This mode slows down premature identification. It asks what the sound is like before deciding what made it, what it represents, or what it means.

## When To Use

Use this skill for:

- sound design samples
- electroacoustic music
- experimental music
- synthetic sounds
- Foley
- everyday sounds
- sonic textures
- nonverbal sonic objects
- AI-generated sound
- ambiguous sources
- music fragments where texture matters more than genre
- prompts describing impossible, unclear, or source-ambiguous sounds

## Core Question

What is the perceptual shape of this sound, and how does that shape change when source, meaning, and material behavior are separated?

## Conceptual Refinements

- Reduced listening is a technique, not a natural or pure ear; it depends on attention, repetition, training, playback, and mediation.
- Acousmatic listening is an epistemic relation: source, cause, and effect may be spaced apart, uncertain, or differently known by different listeners.
- Describe morphology before source: mass, harmonic timbre, grain, dynamic envelope, allure, melodic profile, mass profile, density, contour, and spatial image.
- Separate four intentions: causal listening asks what made the sound; semantic listening asks what it signifies; figurative listening asks what it represents; reduced listening asks what traits appear as sound.
- Include ergo-audition when the listener or user produces the sound themself, such as voice, footsteps, instrument playing, typing, or gesture.

## Input Assumptions

This skill can work with:

- an audio file
- a sound prompt
- a user description
- a transcript with sonic details
- a sound design brief
- a field note
- a model-generated audio caption

If no audio is available, the skill must say it is listening to a description rather than a measured sound. It may describe perceptual possibilities but must not present them as verified audio traits.

## Listening Procedure

1. Identify the object and input type.
2. Describe the sound's perceptual qualities without rushing to source.
3. Attend to timbre, mass, grain, texture, density, attack, decay, movement, rhythm, pitch stability, and spatial image.
4. Separate reduced or perceptual description from causal guesses, semantic codes, and figurative representations.
5. Mark possible causes as inferred rather than heard, and distinguish known source from apparent source.
6. Identify semantic features only when the sound belongs to a code, language, alert, musical convention, or communicative system.
7. Identify figurative or representational effects without confusing them with real causes.
8. Note whether the sound is self-produced or heard at a distance, because ergo-audition changes what can be known.
9. State what remains unavailable: source, intention, recording conditions, listener context, cultural placement, or technical mediation.
10. Recommend a next mode that can correct or expand the perceptual reading.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `acoulogical-object-listening`
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

## Internal Submodes

### Reduced Or Perceptual

Describe the internal sound qualities: timbre, grain, texture, density, contour, rhythm, attack, decay, spatial image, and movement.

### Causal

Ask what may have produced the sound, but mark confidence and uncertainty. Apparent source is not the same as actual source.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

### Semantic

Ask whether the sound participates in a language, code, alert, genre, signal system, or communicative convention.

### Figurative

Ask what the sound represents, stages, evokes, or makes imaginable without treating representation as evidence.

### Ergo-Auditory

Ask whether the sound is produced by the listener or user. Self-produced sound has feedback, habit, masking, and bodily scotomization that differ from passive audition.

## Guardrails

- Avoid the fantasy of the pure ear.
- Reduced listening is a technique, not an escape from culture, training, technology, or mediation.
- Do not treat acousmatic uncertainty as proof of mystery, hidden agency, or source absence.
- Do not identify a source as fact unless the evidence supports it.
- Do not replace perceptual description with mood adjectives only.
- Do not collapse sound into music genre, source object, or symbolic meaning.
- Do not treat AI-generated or prompted sound as verified acoustic reality.

## Recommended Next Modes

- `signal-inspection-listening` when perceptual traits need measurement or technical grounding
- `musical-aesthetic-listening` when rhythm, pitch, harmony, texture, production aesthetics, sound-design utility, or musical form matters
- `embodied-affective-listening` when the sound's force, pressure, fatigue, or pleasure matters
- `transductive-media-listening` when production chain, microphone, codec, sensor, or AI generation matters
- `symbolic-fictional-listening` when the sound opens a declared fictional or symbolic world
- `critical-political-listening` when perceptual categories may hide cultural, social, or institutional framing

## Example

Input: a short metallic scrape with a swelling noisy tail.

- Heard: `[{"statement":"A bright scrape, rough grain, rising density, and noisy decay are present in the supplied sound or description.","confidence":"medium","basis":"Perceptual description before source identification"}]`
- Measured: `[]`
- Inferred: `[{"statement":"Metal contact, a bowed object, a processed sample, or a synthetic gesture are possible causes, but none is confirmed.","confidence":"low","basis":"Causal possibilities from perceptual traits"}]`
- Interpreted: `[{"statement":"Tension emerges from the contrast between sharp attack and unstable decay.","confidence":"medium","basis":"Acoulogical reading of morphology"}]`
- Speculative: `[{"statement":"If requested, the sound could be framed as a fictional signal from a damaged machine.","confidence":"low","basis":"Declared possible-world reading, not evidence"}]`
- Undetermined: `[{"statement":"Actual source, production chain, recording space, self-produced status, and intention remain unknown.","confidence":"high","basis":"Unavailable contextual evidence"}]`
