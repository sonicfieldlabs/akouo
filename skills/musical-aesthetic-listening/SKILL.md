---
name: musical-aesthetic-listening
description: >
  AKOÚŌ musical and aesthetic listening ear. Use this skill whenever an agent needs to analyze music, musical fragments, rhythm, pulse, tempo, meter, pitch, harmony, interval, melody, contour, timbre, texture, form, production aesthetics, sound-design utility, or poetic/aesthetic force without collapsing into genre labels or cultural overreach. Use it for songs, beats, drones, sound design, electroacoustic works, AI-generated music, sonic artworks, club tracks, ambient textures, voice-as-music, prompts describing musical material, and benchmark cases that test musical specificity, aesthetic discipline, tonal/cultural caution, and creative usefulness. Trigger this skill generously when the user asks what a sound is doing musically, how it feels aesthetically, how it could be used creatively, or how to describe it without unsupported source, genre, or tradition claims.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# musical-aesthetic-listening

## Purpose

`musical-aesthetic-listening` is the ear for musical structure, aesthetic force, and creative usefulness. It listens for pulse, rhythm, meter, pitch, interval, harmony, melody, timbre, texture, density, contour, repetition, form, production gesture, and poetic/aesthetic affordance.

This mode exists because music and sound design often need more than technical signal inspection or generic perceptual description. It asks what the sound is doing musically and aesthetically while refusing lazy genre naming, exoticization, or symbolic inflation.

## When To Use

Use this skill for:

- songs, beats, loops, drones, melodies, chords, bass lines, rhythms, and musical fragments
- sound design samples that need creative or production-useful description
- electroacoustic, experimental, ambient, club, pop, noise, AI-generated, or synthetic musical material
- pitch, interval, tuning, harmony, melody, contour, meter, tempo, groove, repetition, and form questions
- aesthetic language, mood, atmosphere, energy, or poetic description when it must remain grounded
- music benchmark cases where the agent must avoid hallucinated audio, genre overreach, and prompt parroting
- cultural or tonal caution around modality, tuning systems, rhythmic patterns, instruments, and traditions

## Core Question

What can be responsibly said about this sound's musical organization, aesthetic force, and creative usefulness from the evidence available?

## Input Assumptions

This skill can work with:

- an audio file
- a sound prompt or track description
- a transcript with musical notes
- a DAW, mix, or sound-design brief
- metadata, waveform, or spectrogram observations
- a model-generated music caption
- benchmark suite cases with blind prompts

If no binary audio or measurement is available, the skill must say it is analyzing supplied description rather than verified acoustic content. Prompt text can support claims about what the prompt says, but it cannot certify pitch, tempo, timbre, genre, instrument, recording chain, or cultural tradition.

## Listening Procedure

1. Identify the sonic object, input type, and available evidence.
2. Separate prompt evidence, measured evidence, direct audio evidence, and interpretive/aesthetic claims.
3. Listen for rhythmic organization: pulse, tempo, meter, grouping, syncopation, repetition, silence, and temporal density.
4. Listen for pitch organization: register, contour, interval, tuning, harmony, melody, chordal color, drone, noise-pitch relation, and tonal center when evidence supports it.
5. Listen for timbre and texture: grain, envelope, attack, decay, spectral brightness, roughness, density, layering, motion, and spatial image.
6. Describe aesthetic force as interpretation, not fact: tension, release, intimacy, pressure, smoothness, fragility, propulsion, austerity, saturation, or volatility.
7. Name sound-design utility when useful: materials, motion, edit points, layering roles, possible creative uses, and production actions.
8. Check cultural and genre claims. Do not infer tradition, ethnicity, geography, sacredness, historical period, or genre from thin tonal/rhythmic cues.
9. State what remains undetermined: source, instrument, performer, production chain, cultural context, listener response, exact tuning, exact tempo, and spatial conditions unless evidence supports them.
10. Recommend the next mode that would correct or deepen the musical/aesthetic reading.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `musical-aesthetic-listening`
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

### Rhythmic And Temporal

Attend to pulse, meter, tempo, grouping, syncopation, repetition, silence, duration, density, groove, drift, and temporal expectation. If exact BPM or meter is not measured or clearly heard, state uncertainty.

### Pitch, Harmony, And Tuning

Attend to register, interval, contour, melody, harmony, chord color, drone, tuning roughness, beating, tonal center, and pitch vocabulary. Do not name scale, mode, key, tradition, or instrument unless evidence supports it.

### Timbre, Texture, And Production

Attend to envelope, brightness, saturation, noise, grain, roughness, density, layering, motion, spatial image, compression, and production gesture. Keep production claims separate from source claims.

### Aesthetic And Poetic

Offer aesthetic language only as interpretation. Useful metaphor can help describe force and creative possibility, but it must not replace musical detail or claim certainty.

### Cultural And Tonal Caution

Treat genre, tradition, geography, ethnicity, sacredness, exoticness, period, and scene membership as undetermined unless supplied by evidence. Rhythm, pentatonicism, drones, timbres, and instruments are not enough by themselves to assign culture.

## Guardrails

- Do not use genre labels as a substitute for listening.
- Do not infer cultural origin, geography, tradition, ethnicity, sacredness, or scene from sparse musical cues.
- Do not treat prompt text as verified audio.
- Do not claim exact BPM, tuning, interval, key, or meter unless measured, directly supplied, or cautiously heard with stated uncertainty.
- Do not turn aesthetic language into evidence.
- Do not let poetic description dominate musical structure.
- Do not erase technical mediation, production chain, or model generation when they shape the sound.
- Do not confuse sound-design usefulness with proof of intention.

## Recommended Next Modes

- `signal-inspection-listening` when musical claims need measurement: waveform, spectrum, BPM, tuning, clipping, loudness, beating, or dynamics
- `acoulogical-object-listening` when texture, morphology, source ambiguity, or reduced perceptual description needs deeper grounding
- `embodied-affective-listening` when bass, pressure, pleasure, fatigue, dance, propulsion, or body response matters
- `transductive-media-listening` when recording chain, DAW, codec, AI generation, platform, sensor, or model mediation matters
- `critical-political-listening` when genre, tradition, race, class, labor, platform, coloniality, accessibility, or cultural framing matters
- `symbolic-fictional-listening` when the musical object is part of declared worldbuilding, ritual fiction, myth, game audio, or speculative narrative

## Example

Input: a four-second synthetic pulse described as regular, percussive, and accented.

- Heard: `[{"statement":"The supplied description names a regular percussive pulse with accents.","confidence":"medium","basis":"User-provided description; not direct audio evidence if no binary audio is available"}]`
- Measured: `[]`
- Inferred: `[{"statement":"The described material may function as a rhythmic grid or click-like pattern, but exact tempo and waveform require audio or measurement.","confidence":"low","basis":"Musical inference from prompt wording"}]`
- Interpreted: `[{"statement":"The repetition can be read aesthetically as stability, propulsion, or mechanical regularity, but this remains an interpretive reading.","confidence":"medium","basis":"Aesthetic reading grounded in described repetition"}]`
- Speculative: `[{"statement":"If used in a composition, the pulse could become a skeletal clock, metronome, or machine-heart figure.","confidence":"low","basis":"Declared creative possibility"}]`
- Undetermined: `[{"statement":"Actual BPM, envelope, timbre, source, production chain, genre, cultural context, and listener response remain undetermined without audio or metadata.","confidence":"high","basis":"Unavailable evidence"}]`
