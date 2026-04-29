# /listen

## Purpose

`/listen` is the default akoúō command. It routes one sonic object through a primary, secondary, and corrective ear.

Use it when the user wants a responsible general listening pass without specifying a specialized mode.

## When To Use

Use `/listen` for:

- general audio or sound prompt interpretation
- first-pass analysis of unknown sonic material
- routing a recording, field note, transcript, spectrogram, or sonic description
- identifying what kind of listening should happen next
- avoiding premature source identification

## Skills Called

- `akouo-router`
- router-selected primary listening mode
- router-selected secondary listening mode
- router-selected corrective listening mode

## Execution Order

1. Run `akouo-router`.
2. Run the selected primary mode.
3. Run the selected secondary mode.
4. Run the selected corrective mode.
5. Synthesize the three listening outputs without flattening their differences.

## Expected Output

Use `schemas/command-output.schema.json`.

The command output must include:

- router output
- skills called
- execution order
- one standard listening output per selected mode
- claim summary using the shared claim taxonomy
- risks and mediations
- main reading
- alternative reading
- recommended next mode

## Guardrails

- Mode selection must happen before interpretation.
- The corrective mode must actively limit overclaiming.
- The synthesis must preserve disagreement between modes.
- Text prompts, transcripts, and audio files must not be treated as equivalent evidence.
- If the input is sensitive, forensic, political, or testimonial, route conservatively.

## Must Not Do

- Do not skip the router.
- Do not identify a source as fact without evidence.
- Do not turn the three-mode chain into one seamless interpretation.
- Do not place speculative claims outside `speculative`.
- Do not place unverified technical claims inside `measured`.
- Do not ignore `undetermined`.

## Recommended Follow-Up

If the user needs depth, recommend `/full-ear`. If the object raises evidence, archive, or harm concerns, recommend `/forensic`. If it opens research directions, recommend `/study` or `/reference`.
