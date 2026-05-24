---
name: material-event-listening
description: >
  AKOÚŌ material and event listening ear. Use this skill whenever an agent needs to analyze sound as vibration, flux, event, duration, material process, pressure, infrastructure, object/event tension, sonic materialism, microsound, noise, feedback, resonance, instrument material, loudspeaker matter, gallery installation, or environmental force. Use it when technical signal inspection is too narrow and perceptual object listening is too object-centered; trigger it for drones, noise, feedback, resonant spaces, material sound art, physical interfaces, speakers, instruments, sound sculptures, weather, engines, machines, sub-bass, unsound, ultrasound, infrasound, and any question about what sound does as matter over time.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# material-event-listening

## Purpose

`material-event-listening` is the ear for sound as matter, vibration, duration, process, and event. It corrects the tendency to treat sound only as source, signal, object, meaning, or style.

This mode listens for what unfolds, resonates, propagates, decays, accumulates, and acts through bodies, rooms, devices, materials, and time.

## When To Use

Use this skill for:

- drones, noise, feedback, resonance, hum, rumble, and sustained vibration
- microsound, grains, clicks, bursts, discontinuities, and event density
- sound sculptures, installations, loudspeakers, instruments, physical interfaces, and material sound art
- sub-bass, ultrasound, infrasound, unsound, tactile vibration, and pressure
- weather, engines, machines, infrastructure, geological or architectural sound
- questions about duration, process, flux, emergence, decay, and material agency
- cases where acoulogical object listening feels too static or source-centered
- sonic ontology or methodology questions about object versus event

## Core Question

What material event is unfolding, and what does it do across bodies, spaces, devices, and time?

## Input Assumptions

This skill can work with:

- audio files
- signal or spectrogram observations
- installation, instrument, sculpture, or performance notes
- field notes about vibration, resonance, room, material, or infrastructure
- prompts describing drones, noise, feedback, pressure, or duration
- technical descriptions of loudspeakers, sensors, interfaces, materials, or playback systems

If no audio, measurement, or material context is supplied, the mode must mark material claims as conditional.

## Listening Procedure

1. Identify object, input type, and whether material, playback, signal, or spatial evidence is available.
2. Identify the event: onset, duration, persistence, change, decay, recurrence, modulation, pressure, resonance, or propagation.
3. Attend to material agencies: bodies, air, surface, room, speaker, microphone, sensor, instrument, weather, machine, infrastructure, or archive medium.
4. Separate measured extensive traits such as frequency, amplitude, duration, and file properties from interpreted intensive traits such as density, force, grain, and pressure.
5. Ask whether the sound behaves more like an object, event, flux, effect, trace, or interface.
6. Identify vibration that may exceed ordinary audibility, but do not claim bodily effect without playback or measurement evidence.
7. Identify ecological, political, or labor stakes when materials involve extraction, infrastructure, public space, or environmental condition.
8. State what remains unavailable: exact frequency, amplitude, material composition, room coupling, playback level, source, and listener body.
9. Recommend a next mode to ground, measure, contextualize, or critique the material event.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `material-event-listening`
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

- event, flux, duration, and becoming
- extensive traits: frequency, amplitude, duration, timing, spatial position
- intensive traits: timbre, grain, density, pressure, roughness, force
- resonance, feedback, room coupling, propagation, decay
- material supports: speakers, instruments, bodies, surfaces, media, minerals, electricity, air, water
- microsound and event density
- unsound, infrasound, ultrasound, and tactile vibration
- object/event tension
- extraction, infrastructure, and environmental material stakes

## Guardrails

- Do not replace measurement with ontology.
- Do not claim exact frequency, amplitude, or bodily effect without evidence.
- Do not treat vibration as politically innocent or universally shared.
- Do not make sound mystical because it is material, invisible, or vibratory.
- Do not erase devices, loudspeakers, rooms, bodies, and materials.
- Do not reduce material sound to technical signal alone.
- Do not place ontology, affective force, or cultural materialism in `inferred`; keep these in `interpreted`.

## Recommended Next Modes

- `signal-inspection-listening` when frequency, amplitude, duration, clipping, dynamics, spectrum, or artifacts should be measured
- `embodied-affective-listening` when pressure, haptic audition, fatigue, pleasure, pain, or attention capture matters
- `transductive-media-listening` when sensors, microphones, speakers, codecs, or interfaces transform the event
- `ecological-posthuman-listening` when material events involve habitat, weather, climate, nonhuman agencies, or infrastructure
- `critical-political-listening` when material sound intersects with extraction, labor, public space, weaponization, access, or platform systems
- `acoulogical-object-listening` when the event needs perceptual morphology before ontology

## Examples

Input: a prompt describing a long feedback tone resonating through a metal room.

- Heard: `[{"statement":"The prompt describes a long feedback tone resonating through a metal room.","confidence":"high","basis":"User-provided description"}]`
- Measured: `[]`
- Inferred: `[{"statement":"Sustained feedback and room resonance are possible from the description, but exact frequency, amplitude, and material coupling require measurement.","confidence":"low","basis":"Technical-material inference from prompt"}]`
- Interpreted: `[{"statement":"The sound can be approached as an unfolding material event across speaker, room, metal surface, air, and listening body.","confidence":"medium","basis":"Material-event listening frame"}]`
- Speculative: `[]`
- Undetermined: `[{"statement":"Actual waveform, frequency, loudness, room dimensions, speaker position, material composition, source chain, and bodily effect remain unknown.","confidence":"high","basis":"No measured signal or room data supplied"}]`
