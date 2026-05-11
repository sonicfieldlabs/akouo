# /full-ear

## Purpose

`/full-ear` performs a broad multimodal scan of one sonic object. It is the deep default for artists, researchers, sound designers, and agent developers who want several listening dimensions at once.

## When To Use

Use `/full-ear` for:

- deep analysis of an audio file
- rich interpretation of a sound prompt
- field recordings
- music fragments
- sound design samples
- sonic artworks
- unknown sounds
- early research notes where multiple listening routes are useful

## Skills Called

- `akouo-router` as a planning pass for contextual mode selection
- `signal-inspection-listening`
- `acoulogical-object-listening`
- `musical-aesthetic-listening` when music, rhythm, pitch, harmony, texture, production aesthetics, or sound-design utility matters
- `embodied-affective-listening`
- `transductive-media-listening`
- one router-selected contextual mode when useful
- `critical-political-listening` as an optional corrective when stakes require it

## Execution Order

1. Run `akouo-router` to identify input type, risks, and the contextual mode.
2. Run `signal-inspection-listening`.
3. Run `acoulogical-object-listening`.
4. Run `musical-aesthetic-listening` when musical or aesthetic organization matters.
5. Run `embodied-affective-listening`.
6. Run `transductive-media-listening`.
7. Run the router-selected contextual mode if it adds a dimension not already covered.
8. Run `critical-political-listening` as corrective when the sound involves platforms, archives, voice, surveillance, labor, coloniality, policing, markets, accessibility, or cultural stakes.
9. Synthesize the results as a multi-ear report.

## Expected Output

Use `schemas/command-output.schema.json`.

The output must show:

- each mode used
- what each mode reveals
- what each mode cannot know
- claim summary across all modes
- mediations and risks
- main reading
- alternative reading
- recommended next mode

## Guardrails

- Keep technical observations distinct from perceptual, affective, mediated, political, and speculative readings.
- Do not force all nine listening modes if a compact full-ear pass is more responsible.
- Do not turn the synthesis into a total interpretation.
- Mark absent measurements as `undetermined` when no real audio or signal data exists.
- Use `critical-political-listening` when the sound is socially or institutionally loaded, not as generic decoration.

## Must Not Do

- Do not pretend the system has heard audio when only a prompt was supplied.
- Do not let signal inspection dictate cultural meaning.
- Do not universalize embodied affect.
- Do not ignore mediation chains.
- Do not hide uncertainty to make the report feel complete.

## Recommended Follow-Up

Recommend `/one-sound-many-ears` when the user wants direct mode comparison. Recommend `/reference` when the user wants concepts, authors, methods, and research routes.
