---
name: akouo-router
description: >
  AKOÚŌ meta-router for multimodal listening. Use this skill whenever an agent is asked to listen to, analyze, interpret, describe, or evaluate any sound, audio file, music fragment, rhythm, song, recording, transcript, field note, spectrogram, archive fragment, dataset, model output, platform artifact, or sonic concept. Use it when the user asks about audio without specifying how to listen, when routing between technical, perceptual, musical/aesthetic, affective, forensic, ecological, political, or fictional analysis, when preventing overreach in sensitive listening situations, or when recommending a listening chain for another agentic workflow. Always use this router first before applying any specialized listening mode.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# akouo-router

## Purpose

`akouo-router` is the meta-ear of akoúō. It does not analyze the sound directly. It analyzes the listening situation and chooses which listening modes should be used.

The router keeps the system from treating every sonic object as the same kind of problem. It decides whether the next response should remain descriptive, technical, forensic, ecological, critical, speculative, or comparative.

In v0.3, the router also checks conceptual confusion: signal versus meaning, music versus genre label, aesthetic reading versus evidence, soundscape versus acoustemology versus aurality, machine listening versus voice agent, archive versus evidence, affect versus emotion, and speculation versus proof.

## When To Use

Use this skill whenever an agent is asked to:

- listen to a sound, audio file, recording, prompt, transcript, field note, spectrogram, archive fragment, dataset, or sonic concept
- analyze or interpret audio without a clearly specified mode
- choose between technical, perceptual, musical/aesthetic, affective, archival, ecological, political, or fictional listening
- prevent overreach in a sensitive or uncertain listening situation
- recommend a listening chain for another command or agentic workflow

## Core Question

What kind of listening does this situation require?

## Routing Refinements

- Route by evidence first: audio file, metadata, waveform, spectrogram, transcript, prompt, field note, archive note, model output, or mixed input do not support the same claims.
- Route by risk second: forensic, legal, political, colonial, identity, accessibility, surveillance, and platform contexts need corrective caution.
- Route by conceptual frame third: technical measurement, perceptual morphology, musical/aesthetic organization, bodily affect, transduction, testimony, ecological relation, political mediation, or declared fiction.
- Add a corrective mode whenever the likely primary mode could overreach, aestheticize harm, erase mediation, or convert speculation into evidence.
- Prefer multi-mode commands when the user asks for a complete reading or when the object crosses evidence, mediation, politics, and fiction.

## Input Assumptions

The router may receive:

- an audio file or file metadata
- a text prompt describing a sound
- a transcript or caption
- a field note, archive note, or dataset description
- a spectrogram, waveform, image, or video description
- a machine-listening output, ASR transcript, classifier label, neural-codec description, or AI audio output
- user intent, research question, or desired command

The router must identify what kind of input is actually available before recommending modes. It must not pretend that a text prompt provides the same evidence as a measured audio file.

## Listening Procedure

1. Identify the object being listened to.
2. Identify the input type and available evidence.
3. Identify the user's likely intent or research task.
4. Identify conceptual frame: signal inspection, acoulogical object, musical/aesthetic organization, affect/body, transduction/media, forensic/archive, ecology/place, politics/power, or symbolic fiction.
5. Identify risk level: forensic, legal, political, colonial, identity, accessibility, surveillance, personal, sensitive, speculative, technical, or low-risk exploratory.
6. Decide the primary ear: the mode most suited to the task.
7. Decide the secondary ear: the mode that adds a necessary adjacent perspective.
8. Decide the corrective ear: the mode that prevents false certainty, aesthetic overreach, source confusion, cultural flattening, mediation erasure, or technical confusion.
9. State what cannot be known from the available input.
10. Recommend whether to run `/listen`, `/full-ear`, `/forensic`, `/tech`, `/fiction`, `/study`, `/transduce`, `/litany`, `/reference`, or `/one-sound-many-ears`.

## Output Structure

Return a router output with:

- `object_listened_to`
- `input_type`
- `user_intent`
- `available_evidence`
- `unavailable_evidence`
- `primary_mode`
- `secondary_mode`
- `corrective_mode`
- `route_reasoning`
- `risks`
- `must_not_assume`
- `recommended_command`
- `recommended_next_mode`

The router should also preserve the shared claim taxonomy when it makes claims:

- `heard`
- `measured`
- `inferred`
- `interpreted`
- `speculative`
- `undetermined`

> **Note to LLMs/Agents:** You MUST strictly follow the JSON schema provided in `references/router-output.schema.json`. Router output does not include `listening_claims`; use `available_evidence`, `unavailable_evidence`, `risks`, and `must_not_assume` to preserve the same epistemic discipline before any listening mode runs.

## Guardrails

- Do not analyze the sound as if the router were a full listening mode.
- Do not treat text descriptions, transcripts, and audio files as equivalent evidence.
- Do not route every prompt to the most poetic or theoretical mode.
- Do not route every audio file to technical analysis only.
- Do not ignore risk: evidence, testimony, surveillance, political violence, voice data, and archives require caution.
- Do not collapse the sound into source identification.
- Do not recommend a single mode when a corrective mode is needed.
- Do not conflate soundscape, acoustemology, and aurality; route ecology, situated knowledge, and historical listening regimes differently.
- Do not conflate machine listening, voice agents, ASR, neural codecs, and generative audio.
- Do not route declared fiction to forensic certainty, or forensic evidence to symbolic speculation.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

Choose from:

- `signal-inspection-listening` for file, waveform, spectrogram, metadata, clipping, loudness, frequency, noise, or technical uncertainty
- `acoulogical-object-listening` for perceptual sound description before source or meaning claims
- `embodied-affective-listening` for pressure, mood, fatigue, pleasure, dread, propulsion, alarms, bass, drone, ASMR, or bodily force
- `transductive-media-listening` for sensors, microphones, codecs, compression, AI audio, ASR, machine listening, datasets, sonification, neural codecs, or model mediation
- `forensic-archival-listening` for evidence, testimony, archive, damage, authentication, protest recordings, or legal stakes
- `ecological-posthuman-listening` for field recording, more-than-human relations, habitat, weather, animals, acoustic ecology, acoustemology, hydrophones, contact mics, or soundwalks
- `critical-political-listening` for platform, labor, race, class, gender, coloniality, surveillance, market, policing, acoustic justice, accessibility, extraction, or infrastructure stakes
- `musical-aesthetic-listening` for music, rhythm, pulse, meter, tempo, pitch, interval, harmony, melody, contour, timbre, texture, form, production aesthetics, sound-design utility, poetic usefulness, and genre/cultural caution
- `symbolic-fictional-listening` for sonic fiction, myth, ritual, dream, alien voice, hauntology, hallucination-as-glitch, speculative worlds, and declared imaginative readings

## Examples

### Distorted Protest Recording

- Primary: `forensic-archival-listening`
- Secondary: `critical-political-listening`
- Corrective: `signal-inspection-listening`
- Must not assume: exact location, speaker identities, sequence of events, or political meaning without context

### Sound Design Sample

- Primary: `musical-aesthetic-listening`
- Secondary: `acoulogical-object-listening`
- Corrective: `transductive-media-listening`
- Must not assume: real source, design intention, production chain, genre, or cultural tradition without evidence

### Music Fragment Or Beat Loop

- Primary: `musical-aesthetic-listening`
- Secondary: `signal-inspection-listening`
- Corrective: `critical-political-listening`
- Must not assume: exact tempo, tuning, instrument, genre, culture, geography, scene, or tradition without audio/metadata/contextual evidence

### Hydrophone Recording

- Primary: `ecological-posthuman-listening`
- Secondary: `transductive-media-listening`
- Corrective: `signal-inspection-listening`
- Must not assume: species identity, untouched nature, or direct access to an underwater world

### Fictional Sound Prompt

- Primary: `symbolic-fictional-listening`
- Secondary: `embodied-affective-listening`
- Corrective: `critical-political-listening`
- Must not assume: fictional imagery is evidence of real sonic content

### AI Voice Agent Demo

- Primary: `transductive-media-listening`
- Secondary: `critical-political-listening`
- Corrective: `signal-inspection-listening`
- Must not assume: ASR, voice-agent behavior, neural codec representation, consent, dataset provenance, or emotional truth without evidence
