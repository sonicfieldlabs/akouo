# /forensic

## Purpose

`/forensic` is the strict evidentiary command. It treats sound as trace, testimony, archive, memory, damage, or possible evidence while refusing narrative completion.

## When To Use

Use `/forensic` for:

- recordings of violence
- testimony
- archives
- surveillance audio
- protest recordings
- damaged material
- oral history
- legal or quasi-legal contexts
- political recordings where overclaiming may cause harm
- authentication caution

## Skills Called

- `akouo-router` as an implicit planning pass that supplies the evidence inventory, risks, and forbidden assumptions the synthesis must respect
- `signal-inspection-listening`
- `forensic-archival-listening`
- `critical-political-listening` as corrective

## Execution Order

1. Run `signal-inspection-listening` to identify available technical evidence and limits.
2. Run `forensic-archival-listening` to separate audible evidence, measured evidence, inference, interpretation, speculation, and unknowns.
3. Run `critical-political-listening` to identify archive, testimony, surveillance, policing, colonial, institutional, or evidentiary stakes.
4. Synthesize conservatively.

## Expected Output

Use `schemas/command-output.schema.json`.

The output must include:

- available evidence
- missing evidence
- chain of mediation when known
- significant silences or damage
- confidence limits
- claims separated by taxonomy
- what cannot be responsibly concluded

## Guardrails

- Evidence requires restraint.
- Speculative claims should normally be empty.
- Technical observations can support evidence but cannot complete a story alone.
- Political context matters, but it must not override evidentiary limits.
- The output should use plain, cautious language.

## Must Not Do

- Do not invent evidence.
- Do not identify speakers, locations, weapons, events, or sequences without support.
- Do not treat background sounds as proof without corroboration.
- Do not use poetic language by default.
- Do not convert testimony into symbolic fiction.
- Do not make legal conclusions.

## Recommended Follow-Up

Recommend `/tech` when more signal inspection is needed. Recommend `/reference` only for methodological cautions, not speculative expansion. Recommend `/listen` after forensic constraints are clear if broader interpretation is safe.
