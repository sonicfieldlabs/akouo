# /remember

## Purpose

`/remember` is the memory command of akoúō. It situates one sonic object in its lineage against a sound-memory store and registers the present listening into that store.

Use it when a listening should not evaporate: when the sound belongs to a series, an archive, a practice, or a body of work whose memory matters.

## When To Use

Use `/remember` for:

- registering a listening into an akousma/akousmata-style store or any sound-memory record system
- comparing a new sound against stored records before deciding it is new
- longitudinal listening: same place, instrument, voice, or system across time
- keeping lineage: what a sound derives from, varies, answers, or repeats
- reviewing what the store already holds — and lacks — about a sound

For memory comparison WITHOUT writing, run the same chain under a read-only preset (`recall` in `presets/presets.json`) or state explicitly that no record should be created.

## Skills Called

- `akouo-router`
- `memory-lineage-listening` (primary)
- `acoulogical-object-listening` (secondary)
- `signal-inspection-listening` (corrective)

## Execution Order

1. Run `akouo-router`; confirm store availability is part of the evidence inventory.
2. Run `acoulogical-object-listening` for a fresh perceptual description that memory must not overwrite.
3. Run `memory-lineage-listening` against the consulted records.
4. Run `signal-inspection-listening` as corrective when apparent recurrence or change could be apparatus difference.
5. Synthesize; populate the `memory` block (`akousma_id`, `akousmata_refs`, `lineage_note`) on outputs the host will store.
6. When the host store speaks akousma spec v1.2, pass through its `location` (where heard) and `capture` (past/future direction + window seconds) blocks untouched — they are the host's record, not listening claims. Claims that lean on them take `source: "metadata"`; location is consent-scoped and never travels further than the store the host names.

## Expected Output

Use `schemas/command-output.schema.json`.

The command output must include:

- routing plan or router output with store availability in the evidence inventory
- one standard listening output per mode, with memory-derived claims carrying `source: "memory"`
- the `memory` block on the primary output when the host assigns a record identifier
- claim summary using the shared claim taxonomy
- risks, main reading, alternative reading, recommended next mode

## Guardrails

- Stop rather than write when no store is available; never invent a store, record ids, or lineage.
- The fresh perceptual pass comes before memory comparison, so the store cannot pre-format present listening.
- Memory claims never enter `heard` or `measured` for the present sound.
- Registering a record carries apparatus, uncertainties, and consent/rights notes with it; flag their absence.
- Disagreement between memory and present listening is preserved in the synthesis, not resolved by fiat.

## Must Not Do

- Do not skip the router.
- Do not treat store similarity as source identity.
- Do not treat absence from the store as novelty in the world.
- Do not quote stored records that carry consent restrictions.
- Do not ignore `undetermined`.

## Recommended Follow-Up

If lineage acquires evidentiary stakes, recommend `/forensic`. If the series raises habitat or environmental questions, recommend `/field`. If the record will feed generation or transformation, hand off through `/route` with the stored record id.
