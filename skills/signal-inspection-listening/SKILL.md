---
name: signal-inspection-listening
description: >
  AKOÚŌ technical signal inspection ear. Use this skill whenever an agent needs to analyze audio files, waveforms, spectrograms, metadata, dynamics, frequency content, clipping, noise, codecs, or any measurable signal property. Use it for mastering and production analysis, audio repair, quality diagnosis, forensic technical review, file metadata inspection, stereo phase analysis, or when grounding perceptual claims in measurable evidence. Use it when the user uploads an audio file, mentions waveform or spectrogram, asks about loudness/LUFS/RMS, or needs technical audio diagnosis.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# signal-inspection-listening

## Purpose

`signal-inspection-listening` is the technical and visual ear of akoúō. It listens through file properties, waveform, spectrogram, dynamics, frequency, stereo field, noise, artifacts, transients, and measurable signal behavior.

This mode establishes what can be technically observed before interpretation begins.

## When To Use

Use this skill for:

- file inspection
- audio metadata
- waveform or spectrogram reading
- mastering and production notes
- clipping, distortion, saturation, or limiting
- frequency distribution and spectral profile
- silence, noise floor, hiss, hum, or electrical artifacts
- dynamics, peak level, RMS, LUFS, or dynamic range
- stereo phase, stereo width, or channel imbalance
- audio repair and quality diagnosis
- microsonic events, grains, bursts, pulses, or discontinuities
- forensic caution when technical evidence is needed

## Core Question

What can be technically observed before interpretation begins?

## Input Assumptions

This skill works best with:

- audio files
- file metadata
- waveform data
- spectrogram data
- signal analysis output
- technical descriptions of audio

If only a sound prompt or transcript is available, measured claims must remain empty or `undetermined`. The skill may describe what technical inspection would require, but it must not invent measurements.

> **Modality Constraint for Agents:** If you are an LLM operating without external code-execution or audio-analysis tools, you MUST leave `measured` claims empty or mark them `undetermined`. Do not hallucinate LUFS, RMS, or frequency metrics.

## Listening Procedure

1. Identify the input type and whether real signal data is available.
2. Record format, duration, sample rate, bit depth, channels, codec, and file size when available.
3. Inspect loudness, peak behavior, RMS, LUFS, and dynamic range when available.
4. Inspect frequency distribution, spectral density, tonal bands, gaps, and masking when available.
5. Inspect clipping, limiting, saturation, compression, or distortion indicators.
6. Inspect noise floor, hiss, hum, clicks, dropouts, glitches, codec artifacts, and environmental noise.
7. Inspect transient density, attack behavior, impulse patterns, pulses, grains, and discontinuities.
8. Inspect stereo image, phase correlation, channel balance, and spatial stability when available.
9. Separate measured observations from inferred production, source, or cultural claims.
10. Recommend the next listening mode based on what technical inspection cannot explain.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `signal-inspection-listening`
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

## Guardrails

- Never confuse signal evidence with meaning.
- A spectrogram can show energy distribution, but it cannot prove intention, affect, identity, politics, or source.
- Do not claim exact source from frequency shape alone.
- Do not infer cultural meaning from file properties alone.
- Do not claim technical measurements unless actual signal or metadata inspection was performed.
- If the input is only textual, mark measured claims as `undetermined` or describe required measurements.
- In forensic contexts, use technical observations only as support, not as narrative completion.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

- `acoulogical-object-listening` when technical traits need perceptual description
- `transductive-media-listening` when artifacts, codecs, microphones, sensors, platforms, or AI systems shape the sound
- `forensic-archival-listening` when signal traits may matter as evidence
- `embodied-affective-listening` when loudness, pressure, repetition, bass, or harshness may affect bodies
- `critical-political-listening` when technical mediation involves platforms, surveillance, labor, access, or institutional power

## Example

Input: an uploaded file with clipping and low-frequency hum.

- Heard: persistent low hum, intermittent broadband impact, clipped transient edges if audible
- Measured: energy concentrated below 100 Hz, peak clipping, narrow-band tone if signal data confirms it
- Inferred: possible electrical hum, compression, or overloaded recording chain
- Interpreted: technical pressure or degraded recording condition may shape the listening experience
- Speculative: none unless requested
- Undetermined: source, intention, location, and cultural meaning
