---
name: transductive-media-listening
description: >
  AKOÚŌ mediation and transduction ear. Use this skill whenever an agent needs to analyze how sound is transformed, compressed, amplified, or invented through technical, biological, computational, or symbolic conversion. Use it for sonification, biosensors, hydrophones, contact microphones, AI-generated audio, voice cloning, speech-to-text outputs, datasets, compression artifacts, degraded media, platform-mediated recordings, and algorithmic audio. Use it when the user asks about how something was recorded, what a microphone or sensor does to the source, or how AI, codecs, or platforms mediate sound.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# transductive-media-listening

## Purpose

`transductive-media-listening` is the mediation ear of akoúō. It listens to conversion: how something becomes sound through technical, biological, computational, electrical, archival, or symbolic transformation.

This mode asks what is transformed, lost, invented, compressed, amplified, or hallucinated when one domain becomes sonic.

## When To Use

Use this skill for:

- sonification
- biosensors
- hydrophones
- contact microphones
- field recording devices
- AI-generated audio
- voice cloning
- speech-to-text outputs
- datasets and model training material
- sample packs
- compression artifacts
- degraded media
- installations
- sensor-to-sound systems
- algorithmic or model-mediated audio
- platform-mediated recordings and uploads

## Core Question

What is transformed, lost, invented, compressed, amplified, or hallucinated when one domain becomes sonic?

## Input Assumptions

This skill can work with:

- an audio file
- metadata about capture devices or platforms
- microphone, sensor, codec, or model details
- a sonification mapping description
- an AI audio generation prompt
- a dataset description
- a transcript produced by speech-to-text
- an archive or field recording note

If the mediation chain is unknown, the skill must say so. It can identify likely mediations, but it must not invent a recording chain, model, platform, or dataset.

## Listening Procedure

1. Identify the object and input type.
2. Identify source domain and target domain.
3. Identify capture mechanism: microphone, sensor, hydrophone, contact mic, screen recording, model, transcript, archive, or user prompt.
4. Identify transducers, interfaces, encodings, codecs, algorithms, mappings, or platforms when known.
5. Identify what the mediation may amplify, suppress, quantize, compress, smooth, hallucinate, or erase.
6. Separate trace, representation, measurement, interface, model output, and reconstruction.
7. Identify technical, aesthetic, political, institutional, and labor stakes when relevant.
8. State what remains hidden in the mediation chain.
9. Recommend a next mode to ground or critique the mediated sound.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `transductive-media-listening`
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

## Distinctions To Preserve

- sound as trace
- sound as representation
- sound as measurement
- sound as interface
- sound as model output
- sound as hallucinated reconstruction

## Guardrails

- Do not treat a mediated sound as direct access to its source domain.
- Do not assume that sonification preserves the truth of the data.
- Do not treat AI-generated audio as evidence of a real acoustic event.
- Do not treat speech-to-text as the whole voice.
- Do not ignore compression, codecs, microphones, sensors, platforms, datasets, and playback systems.
- Do not invent hidden datasets, training sources, or capture chains.
- When mediation has institutional stakes, recommend `critical-political-listening`.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

- `signal-inspection-listening` when artifacts, compression, noise, or metadata require technical inspection
- `critical-political-listening` when mediation involves platforms, institutions, labor, voice data, colonial archives, surveillance, or market systems
- `ecological-posthuman-listening` when sensors or field devices mediate more-than-human environments
- `forensic-archival-listening` when mediated sound is treated as evidence or testimony
- `acoulogical-object-listening` when the mediated object needs perceptual description before source claims

## Example

Input: a hydrophone recording from an unknown underwater site.

- Heard: underwater sound as provided or described
- Measured: file and spectral traits only if inspected
- Inferred: hydrophone access transforms pressure variations into a listenable signal
- Interpreted: the recording is not direct oceanic presence but a mediated interface with underwater vibration
- Speculative: none unless requested
- Undetermined: species, exact location, depth, equipment model, gain settings, ecological cause, and editing chain
