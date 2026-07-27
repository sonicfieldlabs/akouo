# AKOÚŌ Skill Index

A quick-reference manifest of all portable listening skills in this repository.

## Version Notes

`v0.9` adds attributable listening passes, listening provenance and corpus lineage, addressable route decisions and coded silence, explicit plural-listening versus ear-swarm declarations, plus `corpus-listening` and `/corpus`; it also makes clear that supplied text is not heard sound. `v0.8` adds accountable listening context: position, apertures, auditory scales, sources, participants, authority, revision, and honest absence become validated data on every current hearing. `v0.7` adds the sovereignty layer: the `sovereign-listening` mode, the `/covenant` command, and the listening-covenant schema (`schemas/covenant.schema.json`). `v0.6` instruments the system for host apps with the manifest, presets, memory-lineage listening, apparatus/listener/memory declarations, and budget-aware routing plans.

## Meta-Skills

| Skill | Description |
|-------|-------------|
| [`akouo-router`](skills/akouo-router/SKILL.md) | Meta-router that analyzes the listening situation, evidence type, risk level, conceptual frame, and assigns primary, secondary, and corrective listening modes. Use this first before any specialized mode. |
| [`reference-layer`](skills/reference-layer/SKILL.md) | Conceptual mapping layer that turns a sonic object or prior listening output into concepts, sonic methodologies, authors or traditions, research routes, questions, cautions, and adjacent modes. Used by `/reference`, `/study`, and `/method`. |

## Listening Modes

| Skill | Description | When To Use |
|-------|-------------|-------------|
| [`signal-inspection-listening`](skills/signal-inspection-listening/SKILL.md) | Technical signal inspection ear. | Audio files, waveforms, spectrograms, metadata, dynamics, frequency, clipping, noise, codecs, compression, machine-listening outputs. |
| [`acoulogical-object-listening`](skills/acoulogical-object-listening/SKILL.md) | Perceptual object ear for sound-as-auditum. | Sound design, experimental music, Foley, synthetic sounds, ambiguous sources, acousmatic situations, texture-first listening. |
| [`embodied-affective-listening`](skills/embodied-affective-listening/SKILL.md) | Body and affect ear. | Bass/club music, noise, drone, ambient, ASMR, sirens, sonic weapons, accessibility, atmospheres of dread or euphoria. |
| [`transductive-media-listening`](skills/transductive-media-listening/SKILL.md) | Mediation and transduction ear. | Sonification, sensors, AI audio, voice cloning, ASR, neural codecs, compression artifacts, platform-mediated recordings. |
| [`forensic-archival-listening`](skills/forensic-archival-listening/SKILL.md) | Evidentiary and archival ear. | Recordings of violence, testimony, surveillance, protest recordings, archives, damaged tapes, legal or custody contexts. |
| [`ecological-posthuman-listening`](skills/ecological-posthuman-listening/SKILL.md) | More-than-human and ecological ear. | Field recordings, weather, hydrophones, animal sound, acoustic ecology, urban ecology, soundwalks, habitat and infrastructure listening. |
| [`critical-political-listening`](skills/critical-political-listening/SKILL.md) | Critical and political ear. | AI audio platforms, surveillance, colonial archives, acoustic justice, sonic policing, marginalized voices, platform critique. |
| [`musical-aesthetic-listening`](skills/musical-aesthetic-listening/SKILL.md) | Musical, aesthetic, and sound-design ear. | Music, rhythm, pulse, meter, tempo, pitch, harmony, interval, melody, contour, timbre, texture, form, production aesthetics, sound-design utility, poetic usefulness, and genre/cultural caution. |
| [`symbolic-fictional-listening`](skills/symbolic-fictional-listening/SKILL.md) | Speculative and symbolic ear. | Sonic fiction, myth, ritual, hauntology, game audio, film worlds, ambient fantasy, creative worldbuilding. |
| [`audiovisual-scenic-listening`](skills/audiovisual-scenic-listening/SKILL.md) | Sound-image-text-scene ear. | Video, film, games, UI sound, captions, subtitles, synchronization, offscreen sound, diegesis, audiovisual phrasing, and sound-versus-vision cautions. |
| [`voice-speech-listening`](skills/voice-speech-listening/SKILL.md) | Voice, speech, and transcript ear. | Spoken audio, transcripts, ASR, TTS, voice agents, voice cloning, podcasts, radio, diarization, intelligibility, consent, and identity caution. |
| [`accessibility-normative-listening`](skills/accessibility-normative-listening/SKILL.md) | Accessibility and hearing-norm ear. | Captions, transcripts, haptics, deaf and hard-of-hearing access, sensory variation, fatigue, masking, alerts, assistive technology, and implied listener audits. |
| [`material-event-listening`](skills/material-event-listening/SKILL.md) | Material, vibration, and event ear. | Resonance, vibration, duration, flux, feedback, low frequencies, installation sound, propagation, loudspeakers, room coupling, and sonic process. |
| [`memory-lineage-listening`](skills/memory-lineage-listening/SKILL.md) | Sound-memory and lineage ear. | Stored listening records, akousma/akousmata stores, recurrence, kinship, lineage, series over time, archive comparison, and registering listenings into a store. |
| [`sovereign-listening`](skills/sovereign-listening/SKILL.md) | Sovereignty ear that listens under a covenant. | Community protocols, consent-bound recording, the right to silence and opacity, retention rules, habitat protocols, listening without identification, and auditing hearings against a declared covenant. |
| [`corpus-listening`](skills/corpus-listening/SKILL.md) | Computational-inheritance and corpus-provenance ear. | Training, fine-tuning, retrieval, annotation, provider disclosure, licensing, labor, consent, jurisdiction, opt-out, and unknown lineage. |

## Schema Bundles

Each skill folder includes a `references/` directory containing the JSON schemas needed for strict output formatting:

- `listening-output.schema.json` — shared output structure for all listening modes
- `listening-context.schema.json` — accountable declaration of position, apertures, scale, sources, participants, authority, revision, and honest absence
- `claim-taxonomy.schema.json` — epistemic claim categories (heard, measured, inferred, interpreted, speculative, undetermined)
- `listening-pass.schema.json` — one attributable listening at one moment
- `listening-provenance.schema.json` — evidence sources, cuts, corpora, and optional source-of-voice disclosure
- `route-decision.schema.json` — accountable gate outcomes, including coded silence
- `ensemble.schema.json` — explicit plural-listening or ear-swarm declaration
- `router-output.schema.json` — router-specific output structure (bundled with `akouo-router` only)
- `routing-plan.schema.json` — expanded agent handoff route structure (bundled with `akouo-router` only)
- `reference-map.schema.json` — conceptual mapping output structure (bundled with `reference-layer` only)

## Compatibility

All skills follow the standard skill format:
- YAML frontmatter with `name` and `description` for agent triggering
- Markdown body with structured instructions
- Bundled JSON schemas for standalone use

Compatible with any LLM agent framework that supports skill injection (OpenCode, Claude Code, Gemini, etc.).

## Using This Index

- **Humans**: Browse the table above and click through to individual `SKILL.md` files.
- **Agents**: Load `SKILL.md` from any skill folder as a system prompt. Schemas are in `references/`.
- **Developers**: Preserve the manifest and bundled-schema conventions, then run `./scripts/validate-release.sh` after adding or modifying a skill.
