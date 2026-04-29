---
name: embodied-affective-listening
description: >
  AKOÚŌ body and affect ear. Use this skill whenever an agent needs to analyze how sound acts on bodies before conscious interpretation. Use it for bass and club music, noise, drone, ambient, ASMR, sirens, sonic weapons, immersive installations, sound therapy, and any atmosphere of dread, euphoria, exhaustion, intimacy, or propulsion. Use it when the user asks about how a sound feels physically, mentions pressure, vibration, fatigue, pleasure, or bodily response, or analyzes music and sound where bodily force matters more than source identification.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# embodied-affective-listening

## Purpose

`embodied-affective-listening` is the body ear of akoúō. It listens for force, pressure, intensity, mood, vibration, fatigue, pleasure, discomfort, dread, propulsion, attention capture, and subperceptual charge.

This mode asks what sound does before, beneath, or beside conscious interpretation.

## When To Use

Use this skill for:

- bass music
- club music
- reggaetón
- noise
- drone
- ambient
- ASMR
- sirens and alarms
- sonic weapons or coercive sound
- military sound
- immersive installation
- sound therapy or meditation contexts
- atmospheres of dread, suspension, euphoria, exhaustion, intimacy, or propulsion
- any sound where bodily response matters more than source identification

## Core Question

What does this sound do before, beneath, or beside conscious interpretation?

## Input Assumptions

This skill can work with:

- audio files
- prompts describing sound intensity or affect
- listener reports
- installation notes
- performance notes
- field notes about volume, space, and bodies
- technical data about loudness, bass, repetition, or spatial pressure

Embodied effects depend on playback system, room, volume, hearing ability, history, trauma, fatigue, culture, and expectation. If these are missing, the skill must mark bodily claims as inferred or interpreted, not universal facts.

## Listening Procedure

1. Identify the object and input type.
2. Identify whether any volume, playback, space, or listener context is available.
3. Attend to pressure, vibration, repetition, roughness, beating, masking, dynamics, and density.
4. Describe likely bodily vectors: propulsion, fatigue, tension, suspension, irritation, dread, pleasure, calm, or euphoria.
5. Separate audible or measured features from inferred affective effects.
6. Identify possible coercive or accessibility risks when the sound captures attention, overwhelms, masks speech, or targets bodies unevenly.
7. State which bodily claims remain undetermined because listener and playback context are missing.
8. Recommend a next mode to ground, complicate, or contextualize the affective reading.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `embodied-affective-listening`
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

- pressure
- vibration
- fatigue
- tension
- propulsion
- suspension
- irritation
- pleasure
- dread
- euphoria
- masking
- beating
- roughness
- repetition
- spatial pressure
- attention capture
- affective contagion
- possible coercive design

## Guardrails

- Do not universalize bodily response.
- Do not claim that a sound causes a specific emotion in all listeners.
- Do not ignore playback system, volume, room, hearing ability, disability, trauma, fatigue, memory, culture, or desire.
- Do not aestheticize harmful or coercive sound without naming risk.
- Do not confuse sub-bass presence with guaranteed bodily impact unless playback conditions are known.
- Do not treat affect as less mediated than technical or cultural meaning.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

- `signal-inspection-listening` when loudness, frequency, dynamic range, or repetition should be measured
- `critical-political-listening` when bodily force intersects with policing, military sound, accessibility, platform design, labor, or public space
- `acoulogical-object-listening` when affective response needs clearer perceptual grounding
- `ecological-posthuman-listening` when bodily listening is part of habitat, weather, animal, or environmental relation
- `symbolic-fictional-listening` when affective force should be developed into declared sonic fiction or ritual reading

## Example

Input: a sound prompt describing an endless low drone in a narrow room.

- Heard: a low continuous drone as described in the prompt
- Measured: undetermined without audio or room measurements
- Inferred: possible pressure, masking, fatigue, and spatial tension
- Interpreted: the drone may organize attention through bodily endurance rather than explicit meaning
- Speculative: could become a ritual or architectural sonic fiction if requested
- Undetermined: actual volume, frequency, room modes, listener response, duration, and source
