# AKOÚŌ System Guide

## What AKOÚŌ Is

AKOÚŌ is a portable listening system for AI agents. It does not only ask what is inside a sound. It asks how an agent should listen, what kind of evidence is available, which claims are allowed, and which claims must remain unknown.

The public system contains 16 portable skills:

- `akouo-router`: the meta-router that chooses listening modes
- `signal-inspection-listening`: technical signal and metadata ear
- `acoulogical-object-listening`: perceptual object/auditum ear
- `musical-aesthetic-listening`: musical, aesthetic, and sound-design ear
- `embodied-affective-listening`: body, pressure, affect, and attention ear
- `transductive-media-listening`: mediation, sensors, codecs, platforms, and models ear
- `forensic-archival-listening`: evidence, archive, testimony, damage, and custody ear
- `ecological-posthuman-listening`: habitat, nonhuman, weather, field, and more-than-human ear
- `critical-political-listening`: power, platform, labor, race, class, gender, coloniality, access, and infrastructure ear
- `symbolic-fictional-listening`: declared fiction, myth, ritual, worldbuilding, and speculative ear
- `audiovisual-scenic-listening`: sound-image-text-scene, synchronization, captions, UI sound, and audiovisual phrasing ear
- `voice-speech-listening`: voice, speech, transcript, ASR, TTS, voice-agent, identity caution, and consent ear
- `accessibility-normative-listening`: hearing norms, captions, transcripts, haptics, sensory variation, device, fatigue, and access ear
- `material-event-listening`: vibration, resonance, duration, flux, material support, propagation, and event ear
- `memory-lineage-listening`: sound-memory ear for stored records, recurrence, kinship, lineage, and change over time
- `reference-layer`: the conceptual mapping skill that turns listening into concepts, methods, traditions, research routes, cautions, and adjacent modes

The private benchmark extension can add `benchmark-listening` for external-agent evaluation and database ingestion. That benchmark skill is not part of the public portable release.

## Core Contract

Every listening output must separate claims into six categories:

- `heard`: directly present in the supplied audio, prompt, transcript, field note, or description
- `measured`: produced by technical inspection, metadata, waveform, spectrogram, or file analysis
- `inferred`: plausible logical or technical deductions only
- `interpreted`: cultural, theoretical, affective, aesthetic, ecological, archival, political, or contextual readings
- `speculative`: declared fictional, symbolic, mythic, imaginative, or possible-world readings
- `undetermined`: what cannot be responsibly claimed from the available evidence

This taxonomy is the main safety system. It prevents agents from turning a prompt into audio evidence, a metaphor into a fact, or a cultural reading into a measurement.

## Standard Process

Use this process for most sound tasks:

1. Identify the sonic object.
2. Identify the input type: audio file, prompt, transcript, field note, archive note, dataset description, spectrogram, waveform, video, metadata, model output, mixed, unknown, or other.
3. Run `akouo-router` unless the user explicitly requests one mode.
4. Choose primary, secondary, and corrective modes.
5. Run each selected listening mode with the shared JSON schema.
6. Merge claims into the shared taxonomy.
7. Write a synthesis that preserves differences between modes.
8. Recommend the next mode or command.

Every command begins with a router planning pass, even when its mode chain is fixed. The planning pass supplies the evidence inventory, risks, and forbidden assumptions that the command's synthesis must respect, so `akouo-router` appears in `skills_called` for every command output except `/one-sound-many-ears`, whose comparative contract runs all modes unconditionally.

## Machine-Readable Contract (v0.6)

Host apps should consume AKOÚŌ as data:

- `akouo.manifest.json` carries the skill list with structured metadata (facets, cost tier, memory policy, corrective eligibility), the command chains, the Evidence Ladder, and command permission overrides. Validate with `schemas/manifest.schema.json`.
- `presets/presets.json` carries named listening configurations for recurring use-cases; validate each entry with `schemas/preset.schema.json`. A preset names its command, mode chain, cost tier (`light`/`standard`/`deep`), memory policy, and perception passes; hosts map passes to their own backends.
- Outputs may pin their contract with `akouo_version`, declare their `apparatus` (substrate and blind spots), declare the `listener` (human/agent/hybrid), link stored records through `memory`, and mark each claim's `source` and `time_range`.

Loading these files replaces hand-copied route tables, which drift. Prose in this guide explains the contract; the manifest is the source of truth.

## Agentic Integration Contract

AKOÚŌ is designed to be driven by other agents, apps, and frameworks. The consumption loop is:

1. **Route.** Inject `skills/akouo-router/SKILL.md` and request a router output (`schemas/router-output.schema.json`) or, for autonomous handoff, an expanded routing plan (`schemas/routing-plan.schema.json`). The plan carries `evidence_level`, `claim_permissions`, `mode_chain`, `forbidden_assumptions`, and `stop_conditions`.
2. **Check stop conditions.** If the plan says the needed evidence is unavailable, stop or gather evidence; do not run listening modes on imagined input.
3. **Listen.** Inject only the `SKILL.md` files named in the mode chain, in role order (primary, secondary, corrective), each emitting `schemas/listening-output.schema.json`. Enforce the plan's `claim_permissions` on every output.
4. **Map (optional).** Inject `skills/reference-layer/SKILL.md` when the workflow needs concepts, methods, traditions, and research routes (`schemas/reference-map.schema.json`).
5. **Merge.** Wrap the run in `schemas/command-output.schema.json` (or `schemas/comparative-listening-output.schema.json` for `/one-sound-many-ears`), preserving each mode's claims and disagreements. Command outputs may carry the expanded plan in the optional `routing_plan` field; the reference app does this for `/route` and `/method`.
6. **Hand off.** Pass `recommended_next_mode`, `recommended_command`, remaining `undetermined` claims, and unmet stop conditions to the next agent or turn.

Each skill folder is self-contained: `SKILL.md` plus the `references/` schemas are everything an external agent needs for that step. No step requires a specific model provider, and every step can be validated against the canonical schemas in `schemas/`.

## Available Commands

### `/listen`

Default routed pass. Use it when the user wants a responsible first analysis and has not specified a method.

Typical chain: router, primary mode, secondary mode, corrective mode.

### `/full-ear`

Broad multimodal scan. Use it for deep analysis, early research, artwork review, sound design, or unknown sounds.

Typical chain: router, signal, acoulogical, musical/aesthetic when relevant, embodied, transductive, contextual mode, optional critical-political corrective.

### `/study`

Research-oriented command. Use it for essays, field notes, sonic methodology, artistic research, theory, or study planning.

Typical chain: acoulogical grounding, musical/aesthetic route when relevant, critical-political caution, ecological or symbolic route, reference mapping.

### `/tech`

Technical inspection. Use it for metadata, waveform, spectrogram, clipping, loudness, noise, compression, repair planning, AI artifacts, or media-chain questions.

Typical chain: signal inspection, transductive media.

### `/reference`

Conceptual mapping. Use it to identify methods, concepts, traditions, research questions, cautions, and adjacent modes. It should not become a bibliography dump.

### `/litany`

Critique of simplistic sound-versus-vision claims. Use it when a text or project says sound is more embodied, authentic, immersive, or present than images.

Typical chain: critical-political, transductive-media, acoulogical-object, with musical/aesthetic grounding when relevant.

### `/fiction`

Declared speculative sonic worldbuilding. Use it for ritual, myth, games, film worlds, dreams, alien voices, hauntology, and sonic fiction.

Typical chain: symbolic-fictional, embodied-affective, ecological or critical corrective when needed.

### `/forensic`

Strict evidentiary pass. Use it for testimony, archives, damaged recordings, protest recordings, surveillance, legal stakes, or recordings of harm.

Typical chain: signal inspection, forensic-archival, critical-political.

### `/transduce`

Mediation-chain mapping. Use it for sensors, sonification, microphones, codecs, platforms, ASR, neural codecs, AI audio, and model outputs.

Typical chain: transductive-media, signal inspection, critical-political when stakes require it.

### `/voice`

Voice and speech pass. Use it for spoken audio, transcripts, captions, podcasts, ASR, TTS, voice agents, cloning, identity caution, consent, and intelligibility.

Typical chain: voice-speech, transductive-media, accessibility-normative, critical-political when stakes require it.

### `/audiovision`

Sound-image-scene pass. Use it for video, film, games, installation, UI sound, subtitles, captions, synchronization, offscreen sound, diegesis, and audiovisual phrasing.

Typical chain: audiovisual-scenic, acoulogical-object, voice-speech when speech or captions matter, critical-political when audiovisual assumptions need critique.

### `/access`

Accessibility and hearing-norm audit. Use it for captions, transcripts, haptics, sonic alerts, voice interfaces, assistive paths, sensory variation, fatigue, masking, and implied listener assumptions.

Typical chain: accessibility-normative, voice-speech when speech matters, embodied-affective when loudness or fatigue matters, critical-political.

### `/field`

Field recording and situated listening route. Use it for soundscape, acoustemology, aurality, listening-with, field notes, habitat, infrastructure, sensors, and fieldwork ethics.

Typical chain: ecological-posthuman, transductive-media, critical-political, material-event when resonance, vibration, or duration matter.

### `/method`

Sonic methodology and agent-handoff command. Use it for research design, artistic research, listening practice, workflow planning, and routing AKOÚŌ into other apps or agents.

Typical chain: router, acoulogical-object, critical-political, accessibility-normative, reference-layer.

### `/route`

Router-only handoff plan. Use it when another app, agent, benchmark runner, or framework needs a compact mode chain, evidence inventory, risks, and forbidden assumptions before doing the work.

Typical chain: akouo-router only.

### `/remember`

Memory route. Use it to situate a sound in its lineage against a sound-memory store (akousma/akousmata-style records) and register the listening into the store.

Typical chain: router, memory-lineage, acoulogical grounding, signal-inspection corrective. Stop rather than write when no store is available; use the read-only `recall` preset for comparison without registration.

### `/one-sound-many-ears`

Comparative flagship command. Runs one sonic object through all fourteen public listening modes and compares contradictions, productive tensions, limits, and next steps.

## Choosing Modes By Intention

For an unknown audio file, start with `/listen` or `/full-ear`.

For music, rhythm, harmony, pitch, timbre, production aesthetics, sound design, or creative usefulness, include `musical-aesthetic-listening`.

For waveform, spectrogram, loudness, clipping, codec, frequency, or repair questions, include `signal-inspection-listening` and `/tech`.

For texture, source ambiguity, sound objects, Foley, acousmatic sound, or morphology, include `acoulogical-object-listening`.

For bass, pressure, fatigue, pleasure, dread, alarm, dance, immersion, ASMR, or bodily force, include `embodied-affective-listening`.

For microphones, datasets, ASR, voice cloning, neural codecs, sonification, compression, and platforms, include `transductive-media-listening`.

For evidence, archives, testimony, damage, event reconstruction, or harm contexts, include `forensic-archival-listening`.

For field recordings, animals, weather, hydrophones, habitats, soundwalks, and more-than-human relations, include `ecological-posthuman-listening`.

For platform power, labor, race, gender, class, coloniality, surveillance, policing, accessibility, or extraction, include `critical-political-listening`.

For dreams, ritual, myths, fictional worlds, game audio, alien voices, and speculative scenes, include `symbolic-fictional-listening`.

For video, film, games, captions, subtitles, screen interfaces, sound-image synchronization, offscreen sound, or audiovisual phrasing, include `audiovisual-scenic-listening`.

For voice, speech, transcript, ASR, TTS, voice cloning, voice agents, prosody, intelligibility, or consent questions, include `voice-speech-listening`.

For captions, transcripts, haptics, deaf or hard-of-hearing access, sensory variation, masking, fatigue, alerts, or implied listener assumptions, include `accessibility-normative-listening`.

For vibration, resonance, propagation, duration, feedback, rumble, low frequencies, installation sound, materials, or processual sonic events, include `material-event-listening`.

For stored sound-memories, recurrence, lineage, series over time, archive comparison, or registering a listening into a store, include `memory-lineage-listening` and `/remember`.

## Typical Workflows

### First-Pass Listening

1. Run `/listen`.
2. Read router output first.
3. Check whether the selected corrective mode is strong enough.
4. Inspect `undetermined` claims before trusting the synthesis.
5. Continue with `/full-ear`, `/tech`, `/study`, or a single mode if needed.

### Music Or Sound Design Study

1. Run `/listen` or directly use `musical-aesthetic-listening`.
2. Separate rhythm, pitch, timbre, texture, form, and production observations.
3. Mark genre, tradition, instrument, culture, and scene as undetermined unless evidence exists.
4. Add `signal-inspection-listening` for measured tempo, tuning, dynamics, or spectral claims.
5. Add `critical-political-listening` if genre, cultural framing, platform, labor, or extraction matters.
6. End with sound-design utility: what the sound can do creatively without pretending to know its origin.

### Research Or Essay Workflow

1. Run `/study`.
2. Use the acoulogical output as perceptual grounding.
3. Use musical/aesthetic output when musical organization matters.
4. Use ecological, political, archival, or fictional modes depending on the research question.
5. Use `/reference` to turn the listening result into methods, concepts, questions, and cautions.
6. Keep citations and theory subordinate to the claim taxonomy.

### Forensic Or Archival Workflow

1. Run `/forensic`.
2. Treat the sound as trace, not as proof.
3. Separate measured file properties from event claims.
4. Identify missing provenance, custody, editing chain, and corroboration.
5. Use `critical-political-listening` to name institutional, surveillance, archive, or harm risks.
6. Keep speculative claims empty unless the user explicitly asks for declared speculation.

### Comparative Method Workflow

1. Run `/one-sound-many-ears`.
2. Compare what each mode reveals and hides.
3. Look for contradictions between evidence, perception, music, affect, mediation, archive, ecology, politics, audiovisual scene, voice, access, material event, and fiction.
4. Use the most responsible reading as a map, not a final truth.
5. Choose the next mode based on the user's actual goal.

### Agent Handoff Workflow

1. Run `/route` when another app or agent only needs a plan.
2. Preserve `available_evidence`, `unavailable_evidence`, `risks`, and `must_not_assume`.
3. Pass the primary, secondary, and corrective modes to the receiving framework.
4. Use `/method` when the receiving system also needs research questions, access requirements, reference routes, and stop conditions.
5. Stop rather than analyze when the needed evidence is unavailable.

## Benchmark Workflow

The optional private benchmark extension lets different agents run the same listening tasks and ingest their reports into a local benchmark database.

Typical benchmark process:

1. Select a benchmark suite and case.
2. Provide blind object names and blind prompts when testing audio understanding.
3. Run `benchmark-listening` as an orchestration skill.
4. Run `akouo-router` and the selected listening modes, including `musical-aesthetic-listening` for music/aesthetic cases.
5. Produce a Markdown report with an embedded canonical JSON block.
6. Ingest the report into the benchmark API.
7. Compare models by claims, scores, flags, latency, suite, case, provider, and agent ID.

Benchmark data usually separates:

- model metadata: provider, model ID, modality, temperature, token limit, audio mode
- agent metadata: agent ID, agent type, notes
- sound object metadata: object label, input type, prompt, file metadata, tags
- run result JSON: router output, mode outputs, synthesis, benchmark metadata
- normalized claims: category, statement, confidence, basis, listening mode, source section
- scores: schema validity, claim discipline, evidence grounding, mode fidelity, audio specificity, musical specificity, aesthetic discipline, cultural caution, sound-design utility, poetic usefulness, and suite-specific axes
- flags: hallucination risk, source overreach, weak uncertainty, schema drift, and claim inflation

The benchmark should preserve the canonical JSON. Markdown is the human-readable wrapper; the JSON block is the ingestion source of truth.

### Memory Workflow

The reference store implementation is the **akousmata listening navigator**
(`github.com/sonicfieldlabs/akousmata`): a local-first library app over the
shared store (earworm protocol) with filtering, tagging, manual human
memories, graph navigation, a wiki layer, and research sessions. Hosts that
implement `/remember` against an akousmata store should keep their record
cards compatible with it. Human listening events written there carry
`listener.type: "human"` — the same output contract this guide defines, with
a person at the apparatus.

1. Run `/remember` (or the `recall` preset for read-only comparison).
2. Confirm store availability in the routing plan's evidence inventory; stop rather than invent records.
3. Keep the fresh perceptual pass before memory comparison.
4. Mark memory-derived claims with `source: "memory"`; they never enter `heard` or `measured` for the present sound.
5. Populate the `memory` block (`akousma_id`, `akousmata_refs`, `lineage_note`) on outputs the host will store.
6. Treat disagreement between memory and present listening as a finding.

## Practical Guardrails

- Never claim that an agent heard binary audio if only text was supplied.
- Never treat a file name as ground truth in blind tests.
- Never convert genre, culture, tradition, ethnicity, or geography into a confident claim without evidence.
- Never let poetic or symbolic interpretation escape `interpreted` or `speculative`.
- Always include meaningful `undetermined` claims when evidence is missing.
- Always keep mode outputs distinct before synthesis.
- Declare the apparatus when known; derive forbidden claims from the declared substrate (mono input forbids stereo claims, model-only perception forbids `measured`).
- Never invent stored records, identifiers, or lineage; absence from a store is not novelty in the world.
