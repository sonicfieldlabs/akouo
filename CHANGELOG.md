# Changelog

## v0.8 — Accountable Listening

- Added `schemas/listening-context.schema.json`, the shared declaration of a
  hearing's position, apertures, auditory scales, evidence sources,
  participants, action authority, revision, and honest absences.
- Added the optional `listening_context` block to the listening-output
  contract. Current producers emit it; v0.7 records remain valid.
- Closed reference-app drift: sovereign listening and `/covenant` now appear
  in the executable mode and command registries, and browser reports declare
  the apparatus and evidence channels they actually used.
- Fixed the example validator so the already-valid `covenant` output block is
  accepted and added validation for the accountable context.
- Strengthened every operational ear: model observations are not
  measurements, action capability is not authority, disagreement remains
  attributable, and re-listening creates revisions instead of silent
  replacement.
- Added `ACCOUNTABLE_LISTENING.md` as the concise producer/consumer contract
  for the wider listening stack.
- Bumped `akouo-contract` and the reference app to `0.8.0`
  (`akouo/v0.8`).

## v0.7 — Sovereign Listening

- Added `sovereign-listening`, the fifteenth mode: listening under an explicit
  **listening covenant** — a small, human-written declaration of sonic
  sovereignty (what this ear will not listen to, will release after hearing,
  will not reveal, will not retain, will blur, or will refuse at certain
  hours, and why). The covenant is a bridge language, not a guarantee of
  obedience: rules a host can execute are enforced at its gates; every line
  it cannot execute is carried verbatim as a commitment and reported with
  the hearing. Lineage is declared (`extends`, e.g. the Algophonya
  manifesto): the mode is the manifesto's Rights of the Audible — silence,
  opacity, community protocols — made operational.
- Added `/covenant`, the eighteenth command: verify and apply a covenant,
  listen to what it admits, report enforcement, withholding, and
  commitments.
- Added `schemas/covenant.schema.json`: the parsed covenant (id, `extends`
  lineage, executable `rules` over a small verb vocabulary — do_not_listen,
  ignore, do_not_reveal, do_not_retain, coarsen, quiet_hours, max_window,
  require_consent — and carried `commitments`).
- Listening outputs gain an optional `covenant` block (identity + withheld
  list + commitments count), so every hearing can answer *under which ethics
  was this listened?* Withholding is honest, attributed absence: counted and
  named by rule and category, never described, never conflated with
  `undetermined`.
- Contract bumped to `akouo/v0.7` (manifest, package `akouo-contract`
  0.7.0). Defaults unchanged everywhere: no covenant is loaded unless the
  operator adopts one, and a covenant governs the listener that adopted it —
  it protects the listened-to and is not an instrument for silencing others.
- Aligned with Earworm v0.4 (akousma spec v1.3 `covenant` block on records)
  and oída 0.4 (the covenant engine: input/content/output/retention gates).

## v0.6.3 — Located, Directed Memory

- Documented akousma spec v1.2 awareness in `memory-lineage-listening` and
  `/remember`: host stores may now carry `location` (where a sound was
  heard) and `capture` (past/future direction + window seconds) on records.
  Both are host metadata evidence — claims that lean on them take
  `source: "metadata"`, never `measured`; location is consent-scoped and is
  repeated into outputs only when the task requires it.
- A `capture.direction` of `past` (the ring buffer heard the sound before
  the trigger) is named as lineage information: the listener chose the
  sound after hearing it.
- Data contract unchanged: still `akouo/v0.6`; no schema or manifest edits.
  This is a documentation/distribution release aligned with Earworm v0.3,
  Oída 0.3.0 (remote ear, future/past capture), and akousmata 0.3.0 (the
  listening map).

## v0.6.2 — Installed Host Contract

- Packaged the canonical skills, commands, presets, schemas, and manifest as
  `akouo-contract`, so Oída and other hosts can install AKOÚŌ as a dependency
  without copying the skill library or requiring a sibling checkout.
- Kept the public data contract pinned to `akouo/v0.6`; this is a distribution
  and host-integration release, not a claim-taxonomy break.
- Documented Oída as the reference unified gateway for Oída-owned perception
  and audio-capable host perception.

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
