# Changelog

## v0.6.1 — The Akousmata Navigator

- Documented the akousmata listening navigator
  (`github.com/sonicfieldlabs/akousmata`) as the reference store
  implementation for `memory-lineage-listening` and `/remember`.
- Documented manual human listening events: entries written by the navigator
  carry `listener.type: "human"` and the `akousmata/v0.1` contract pin —
  human and agent listenings share one library and one output discipline.

## v0.6 — Instrumented Listening

- Added `akouo.manifest.json`, the machine-readable system contract: skills with structured metadata (facets, cost tier, memory policy, corrective eligibility), command chains as data, the Evidence Ladder as data, and command permission overrides — validated by the new `schemas/manifest.schema.json`.
- Added `presets/presets.json` with thirteen portable listening presets (basic, signal, field, music, voice, recall, remember, deep, forensic, access, fiction, generative, extended-spectrum), validated by the new `schemas/preset.schema.json`.
- Added `memory-lineage-listening`, the fourteenth listening mode: listening with stored sound-memories (recurrence, kinship, lineage, change over time) while keeping memory a distinct evidence stream.
- Added the `/remember` command for situating a sound in its lineage and registering the listening into a sound-memory store.
- Extended the shared listening output with optional `akouo_version`, `apparatus` (substrate, perception sources, known blind spots), `listener` (human/agent/hybrid), and `memory` (akousma links) blocks.
- Extended claims with optional `source` (audio, dsp, metadata, model, transcript, context, memory, human, other) and `time_range` anchors.
- Extended routing plans with optional `budget` (light/standard/deep) and `preset_id`; command outputs may carry `akouo_version` and `preset_id`.
- Documented command-level claim-permission overrides (`/forensic` suppresses interpreted/speculative; `/fiction` grants declared speculation) in the router skill and the manifest.
- Router upgrades: substrate awareness with derived claim limits, causal-confidence guidance by listening situation, vococentrism correction, memory-route scoring, and preset/budget honoring.
- Deepened `acoulogical-object-listening` (typological axes, causal-situation grading, cultural recognizability) and `forensic-archival-listening` (time anchoring, apparatus declaration, command override note).
- App contract updated for the new mode, command, and optional fields; release validation now checks presets, the manifest, and the v0.6 example.
- Breaking (comparative outputs only): `/one-sound-many-ears` `mode_comparison` now requires the `memory_lineage` key.

## v0.5 — Agentic Routing Consolidation

- Added `reference-layer` as a portable meta-skill for concepts, methodologies, traditions, cautions, and adjacent modes.
- Added expanded `routing_plan` output for `/route` and `/method`, including evidence level, claim permissions, mode chain, stop conditions, and agent handoff notes.
- Added the router Evidence Ladder so available evidence maps to permitted claim categories.
- Expanded the browser-side signal adapter with BS.1770-style loudness and loudness range, FFT spectral statistics, band energy, onset density, guarded BPM candidates, stereo correlation/width/balance, and clipping-ratio estimates.
- Added release validation for schema enum alignment, bundled reference schema consistency, generated artifact exclusion, public hygiene, and example structure.
- Hardened the public reference app first-run path: local listening works offline by default, benchmark autosave is opt-in, benchmark keys are origin-scoped, dev servers bind to localhost by default, and router term matching is token-aware.

## v0.4 — Agentic Listening Expansion

- Added `voice-speech-listening`, `audiovisual-scenic-listening`, `accessibility-normative-listening`, and `material-event-listening`.
- Added `/voice`, `/audiovision`, `/access`, `/field`, `/method`, and `/route` commands.
- Added the local-first Vite + React reference app as part of the release scope.
- Expanded routing for voice, audiovisual scene, access, material events, and agent handoff workflows.

## v0.3 — Musical/Aesthetic Integration

- Added `musical-aesthetic-listening` for rhythm, pulse, tempo, pitch, harmony, timbre, texture, form, production aesthetics, sound-design utility, poetic usefulness, and genre/cultural caution.
- Updated schemas, examples, commands, and index material for the expanded public mode set.

## v0.2 — Conceptual Discipline

- Refined the original listening modes with stronger evidence boundaries, mediation awareness, and public-repo hygiene.
- Sharpened distinctions among signal, perceptual object, affect, mediation, archive, ecology, politics, and speculation.
- Clarified claim taxonomy usage across skills and examples.

## v0.1 — Public Baseline

- Published the initial portable AKOÚŌ skill library with router, listening modes, commands, canonical schemas, examples, and MIT license.
