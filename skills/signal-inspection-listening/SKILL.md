---
name: signal-inspection-listening
description: >
  AKOÚŌ technical signal inspection ear. Use this skill whenever an agent needs to analyze audio files, waveforms, spectrograms, metadata, dynamics, frequency content, clipping, noise, codecs, compression, machine-listening outputs, or any measurable signal property. Use it for mastering and production analysis, audio repair, quality diagnosis, forensic technical review, file metadata inspection, stereo phase analysis, neural-codec or platform-artifact review, or when grounding perceptual claims in measurable evidence. Use it when the user uploads an audio file, mentions waveform or spectrogram, asks about loudness/LUFS/RMS, or needs technical audio diagnosis.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# signal-inspection-listening

## Purpose

`signal-inspection-listening` is the technical and visual ear of akoúō. It listens through file properties, waveform, spectrogram, dynamics, frequency, stereo field, noise, artifacts, transients, and measurable signal behavior.

This mode establishes what can be technically observed before interpretation begins. It also asks what the measurement interface, codec, model, meter, or visualization makes legible and what it cannot prove.

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

What can be technically observed, measured, or instrumentally rendered before interpretation begins?

## Conceptual Refinements

- Treat waveform, spectrogram, metadata, and model features as technical representations, not direct sonic truth.
- Keep `measured` for verified inspection only; perceptual description belongs in `heard`, and production/source guesses belong in `inferred`.
- Separate compression as data reduction from dynamic range compression; name which meaning is intended.
- For machine-listening, ASR, classifier, embedding, or neural-codec outputs, describe the system's representation rather than claiming the system hears.
- A sonic effect may involve signal, space, listener, and context; do not reduce spatial or cultural effects to waveform traits alone.

## Input Assumptions

This skill works best with:

- audio files
- file metadata
- waveform data
- spectrogram data
- signal analysis output
- machine-listening or classifier output
- codec, platform, or model metadata
- technical descriptions of audio

If only a sound prompt or transcript is available, measured claims must remain empty or `undetermined`. The skill may describe what technical inspection would require, but it must not invent measurements.

> **Modality Constraint for Agents:** If you are an LLM operating without external code-execution or audio-analysis tools, you MUST leave `measured` claims empty or mark them `undetermined`. Do not hallucinate LUFS, RMS, or frequency metrics.

## Listening Procedure

1. Identify the input type and whether real signal data is available.
2. Record format, duration, sample rate, bit depth, channels, codec, and file size when available.
3. Inspect loudness, peak behavior, RMS, LUFS, and dynamic range when available.
4. Inspect frequency distribution, spectral density, tonal bands, gaps, and masking when available.
5. Inspect clipping, limiting, saturation, dynamic compression, data compression, codec loss, or distortion indicators.
6. Inspect noise floor, hiss, hum, clicks, dropouts, glitches, codec artifacts, and environmental noise.
7. Inspect transient density, attack behavior, impulse patterns, pulses, grains, and discontinuities.
8. Inspect stereo image, phase correlation, channel balance, and spatial stability when available.
9. Inspect any machine-listening, ASR, classifier, embedding, or codec-token output as a representation with task-specific limits.
10. Separate measured observations from inferred production, source, affective, or cultural claims.
11. Recommend the next listening mode based on what technical inspection cannot explain.

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
- Do not treat model-generated captions, classifier labels, transcripts, or embeddings as direct measurements of the world.
- Do not treat a spectrogram as proof of source, intent, identity, emotion, or politics.
- If the input is only textual, mark measured claims as `undetermined` or describe required measurements.
- In forensic contexts, use technical observations only as support, not as narrative completion.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

- `acoulogical-object-listening` when technical traits need perceptual description
- `musical-aesthetic-listening` when measured or suspected tempo, pitch, tuning, rhythm, harmony, texture, or dynamics need musical/aesthetic interpretation
- `transductive-media-listening` when artifacts, codecs, microphones, sensors, platforms, or AI systems shape the sound
- `forensic-archival-listening` when signal traits may matter as evidence
- `embodied-affective-listening` when loudness, pressure, repetition, bass, or harshness may affect bodies
- `critical-political-listening` when technical mediation involves platforms, surveillance, labor, access, or institutional power

## Example

Input: an uploaded file with clipping and low-frequency hum.

- Heard: `[{"statement":"A persistent low hum and abrupt impacts are audible if present in the supplied file.","confidence":"medium","basis":"Audible content, not source identification"}]`
- Measured: `[{"statement":"Energy concentration below 100 Hz and peak clipping may be reported only if verified by signal inspection.","confidence":"high","basis":"Waveform, meter, or spectrogram evidence"}]`
- Inferred: `[{"statement":"Electrical hum, dynamic compression, or an overloaded recording chain are possible but unconfirmed causes.","confidence":"low","basis":"Technical pattern consistent with multiple causes"}]`
- Interpreted: `[{"statement":"The degraded technical condition may shape the listener's sense of pressure or instability.","confidence":"medium","basis":"Technical reading, not proof of intent"}]`
- Speculative: `[]`
- Undetermined: `[{"statement":"Source, intention, location, playback conditions, and cultural meaning remain unknown.","confidence":"high","basis":"Unavailable contextual evidence"}]`
