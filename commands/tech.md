# /tech

## Purpose

`/tech` is the technical inspection command. It focuses on file properties, signal behavior, waveform or spectrogram evidence, production artifacts, and mediation chains.

## When To Use

Use `/tech` for:

- file properties
- waveform and spectrogram inspection
- mastering, mixing, or production notes
- clipping, distortion, noise, hum, hiss, dropouts, or codec artifacts
- audio repair planning
- metadata review
- AI audio artifacts
- sensor, microphone, compression, or platform mediation

## Skills Called

- `signal-inspection-listening`
- `transductive-media-listening` when mediation, codecs, sensors, models, platforms, or conversion chains are relevant

## Execution Order

1. Run `signal-inspection-listening`.
2. Run `transductive-media-listening` if the sound's capture, encoding, transformation, or model mediation matters.
3. Synthesize technical observations and state what cannot be measured from the available input.

## Expected Output

Use `schemas/command-output.schema.json`.

The output must include:

- technical observations
- measured claims only when measurement exists
- inferred technical causes clearly marked
- mediation chain when known
- what remains technically undetermined
- recommended next mode

## Guardrails

- Technical evidence is not cultural meaning.
- Do not invent file metadata or measurements.
- Do not overstate source identity from signal traits.
- If only text is supplied, state what technical inspection would require.
- Keep repair or production recommendations separate from evidence claims.

## Must Not Do

- Do not place unverified values in `measured`.
- Do not claim exact microphone, plugin, codec, platform, or model unless known.
- Do not treat spectrogram patterns as proof of intention.
- Do not ignore transduction when the recording chain shapes the sound.
- Do not make forensic claims from technical artifacts alone.

## Recommended Follow-Up

Recommend `/forensic` if the technical findings may support evidence. Recommend `/listen` or `/full-ear` if the user needs interpretation beyond signal behavior.
