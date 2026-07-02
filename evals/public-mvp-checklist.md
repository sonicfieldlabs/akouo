# Phase 8 Evaluation Checklist

> **Historical snapshot.** This checklist evaluates the original public MVP (router + nine listening modes, ten commands) and predates the v0.3 musical/aesthetic integration and the v0.4 agentic expansion (voice, audiovisual, accessibility, material event, `/voice`, `/audiovision`, `/access`, `/field`, `/method`, `/route`, reference-layer skill). Kept as a record of the Phase 8 baseline; do not use it as the current system inventory — see `SKILL_INDEX.md` and `SYSTEM_GUIDE.md`.

## Scope

This evaluation compares the current public MVP against the akoúō foundation requirements through Phase 8.

Evaluated areas:

- public repository structure
- portable skill system
- command definitions
- shared schemas
- local-first app architecture and command execution
- research/reference layer
- public-repo hygiene
- conceptual alignment with agentic listening

## Verification Runs

- JSON schema and example parsing: passed
- TypeScript production build: passed
- Local app server smoke test: passed
- Public-safety scan for private paths, private keys, secret assignments, and private network addresses: passed
- Generated artifacts removed after testing: passed

## Foundation Checklist

### Core Skills

- [x] `akouo-router` exists.
- [x] `signal-inspection-listening` exists.
- [x] `acoulogical-object-listening` exists.
- [x] `embodied-affective-listening` exists.
- [x] `transductive-media-listening` exists.
- [x] `forensic-archival-listening` exists.
- [x] `ecological-posthuman-listening` exists.
- [x] `critical-political-listening` exists.
- [x] `symbolic-fictional-listening` exists.
- [x] Each skill includes purpose, use cases, core question, input assumptions, procedure, output structure, guardrails, and next modes.
- [x] Each skill lives in its own folder with a `SKILL.md` file following standard agent skill format.
- [x] Each `SKILL.md` includes YAML frontmatter with `name` and `description` for automatic agent triggering.
- [x] Each skill bundles required JSON schemas in a `references/` folder for standalone portability.
- [x] Skill documents are framework-agnostic and do not depend on one model provider.

Status: complete.

### Commands

- [x] `/listen` exists.
- [x] `/full-ear` exists.
- [x] `/study` exists.
- [x] `/tech` exists.
- [x] `/reference` exists.
- [x] `/litany` exists.
- [x] `/fiction` exists.
- [x] `/forensic` exists.
- [x] `/transduce` exists.
- [x] `/one-sound-many-ears` exists.
- [x] Every command documents skills called.
- [x] Every command documents execution order.
- [x] Every command documents expected output.
- [x] Every command documents guardrails.
- [x] Every command documents what it must not do.
- [x] The app exposes all ten commands.
- [x] The local runner executes all ten commands.

Status: complete for local deterministic execution. Deeper model-backed listening remains deferred.

### Shared Schemas

- [x] `claim-taxonomy.schema.json` exists.
- [x] `listening-output.schema.json` exists.
- [x] `router-output.schema.json` exists.
- [x] `command-output.schema.json` exists.
- [x] `comparative-listening-output.schema.json` exists.
- [x] `reference-map.schema.json` exists.
- [x] Schemas parse as valid JSON.
- [x] Schemas preserve the shared claim taxonomy.

Status: complete for current MVP schemas.

### Claim Taxonomy

- [x] Outputs preserve `heard`.
- [x] Outputs preserve `measured`.
- [x] Outputs preserve `inferred`.
- [x] Outputs preserve `interpreted`.
- [x] Outputs preserve `speculative`.
- [x] Outputs preserve `undetermined`.
- [x] Skill docs require claim separation.
- [x] App types encode the taxonomy.
- [x] App renderer displays the taxonomy.

Status: complete.

### Shared Output Logic

- [x] Output accounts for object listened to.
- [x] Output accounts for input type.
- [x] Output accounts for listening mode.
- [x] Output accounts for what appears.
- [x] Output accounts for what remains hidden.
- [x] Output accounts for mediations.
- [x] Output accounts for risks.
- [x] Output accounts for main reading.
- [x] Output accounts for alternative reading.
- [x] Output accounts for recommended next mode.

Status: complete.

### App MVP And Local Use

- [x] App builds with TypeScript and Vite.
- [x] App supports local development server use.
- [x] App accepts text-based sound prompts.
- [x] App accepts audio file upload.
- [x] App performs basic browser-side audio metadata inspection when possible.
- [x] App allows command selection.
- [x] App can run `/listen`.
- [x] App can run `/full-ear`.
- [x] App can run all Phase 6 commands.
- [x] App displays structured output according to the shared schema logic.
- [x] App shows which listening modes were used.
- [x] App shows claim categories.
- [x] App shows recommended next mode.
- [x] App shows mediations and risks.
- [x] App shows undetermined claims.
- [x] App supports copy/export of structured JSON results.

Status: complete for local deterministic MVP. Real signal analysis beyond browser metadata remains partial.

### Audio Processing Adapter

- [x] Audio adapter accepts files.
- [x] Audio adapter extracts file name, MIME type, file size, duration, sample rate, and channel count when the browser can decode the file.
- [x] Deeper waveform, spectrogram, loudness, clipping, phase, and frequency claims are marked undetermined.
- [x] App architecture isolates future audio analysis in `audioAdapter.ts`.

Status: partial by design. Deeper audio analysis should be added later without redesigning the app.

### Router Requirements

- [x] Router recommends primary mode.
- [x] Router recommends secondary mode.
- [x] Router recommends corrective mode.
- [x] Router distinguishes prompt, audio file, transcript, archive note, dataset description, metadata, field note, and other inputs.
- [x] Router flags unavailable evidence.
- [x] Router warns against treating prompt, transcript, and measured audio as equivalent.

Status: complete for deterministic routing. More nuanced routing heuristics can be refined later.

### Conceptual Guardrails

- [x] No skill collapses sound into mere source identification.
- [x] `forensic-archival-listening` avoids speculation by default.
- [x] `symbolic-fictional-listening` labels speculation clearly.
- [x] `critical-political-listening` avoids generic accusation and requires concrete mediations.
- [x] `signal-inspection-listening` does not confuse signal data with cultural meaning.
- [x] `ecological-posthuman-listening` avoids romanticizing nature.
- [x] `embodied-affective-listening` avoids universalizing bodily response.
- [x] `transductive-media-listening` distinguishes trace, representation, measurement, interface, model output, and reconstruction.
- [x] `/litany` audits sound-versus-vision binaries rather than replacing them with another universal formula.

Status: complete in docs and local runner language.

### Research And Reference Layer

- [x] Reference layer maps concepts.
- [x] Reference layer maps sonic methodologies.
- [x] Reference layer maps authors or traditions.
- [x] Reference layer maps possible research routes.
- [x] Reference layer maps research questions.
- [x] Reference layer maps cautions.
- [x] Reference layer maps adjacent modes.
- [x] Reference layer is not a bibliography generator.
- [x] `/reference` uses the reference layer.
- [x] `/study` uses the reference layer.
- [x] Public reference map schema exists.
- [x] Public reference map example exists.

Status: complete for MVP concept mapping. Formal citation support and source retrieval are deferred.

### Public Repository Hygiene

- [x] No private paths found in repository scan.
- [x] No private keys found in repository scan.
- [x] No secret assignment patterns found in repository scan.
- [x] No private network addresses found in repository scan.
- [x] Generated build outputs are ignored and removed after validation.
- [x] Dependency folders are ignored and removed after validation.
- [x] Large private media files are ignored by default.
- [x] README warns against committing private data, credentials, private recordings, and unnecessary artifacts.

Status: complete for current files.

### README Accuracy

- [x] README describes akoúō as agentic listening, not generic audio analysis.
- [x] README names the core architecture.
- [x] README names all commands.
- [x] README explains the claim taxonomy.
- [x] README includes public-repo hygiene guidance.
- [x] README status reflects implemented phases through Phase 8.

Status: complete.

## Complete

- Public repository skeleton.
- Portable skill documents for router and nine listening modes, each packaged in its own `SKILL.md` folder with bundled schemas.
- Command definition layer for all ten commands.
- Shared JSON schemas for claim taxonomy, listening output, router output, command output, comparative output, and reference map.
- Local-first app architecture.
- Working local app MVP.
- Full local command integration.
- Research/reference layer.
- Copy/export of structured JSON results.
- Public example for reference maps.
- Build and local smoke test workflow.
- Public-safety hygiene checks.

## Partial

- Audio analysis is limited to browser metadata and decode-derived duration, sample rate, and channel count.
- Routing is deterministic and rule-based rather than model-assisted or context-rich.
- Reference layer maps traditions and methods, but does not retrieve sources or produce formal citations.
- App has a working UI, but not yet a full design-system pass or accessibility audit.
- Export is JSON only; Markdown and research-note exports remain future work.

## Remaining To Develop

- Deeper audio adapter for waveform, spectrogram, loudness, clipping, phase, frequency distribution, and silence detection.
- More robust router heuristics and optional model-backed route selection.
- Full examples for prompt input, audio file input, command output, and comparative listening output.
- Automated schema validation against generated app outputs.
- Accessibility and UI guideline audit.
- Contribution guidelines.
- More complete README usage instructions for all commands and output interpretation.

## Deferred To Later Versions

- Local model backend integration.
- Bring-your-own API provider integration.
- MCP-style integration.
- Real audio feature extraction backend.
- Recorded audio input.
- Spectrogram and waveform visualization.
- Markdown, research-note, and agent-readable export formats beyond JSON.
- Formal citation engine with source retrieval.
- Persistent project/session storage.
- Multi-file comparative workflows.

## Evaluation Conclusion

The current system satisfies the public MVP foundation for akoúō as an agentic listening system. It provides accountable, switchable ears; preserves claim discipline; exposes all core skills and commands; runs locally; accepts prompts and audio files; marks unavailable measurements as undetermined; and maintains public-repo hygiene.

The main remaining gap is depth of audio computation, not conceptual architecture. The app correctly avoids pretending that browser metadata is full signal analysis, which keeps the current MVP aligned with the foundation document's epistemic discipline.
