# AKOÚŌ System Guide

## What AKOÚŌ Is

AKOÚŌ is a portable listening system for AI agents. It does not only ask what is inside a sound. It asks how an agent should listen, what kind of evidence is available, which claims are allowed, and which claims must remain unknown.

The public v0.3 system contains 10 portable skills:

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

### `/one-sound-many-ears`

Comparative flagship command. Runs one sonic object through all nine public listening modes and compares contradictions, productive tensions, limits, and next steps.

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
3. Look for contradictions between evidence, perception, music, affect, mediation, archive, ecology, politics, and fiction.
4. Use the most responsible reading as a map, not a final truth.
5. Choose the next mode based on the user's actual goal.

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

## Practical Guardrails

- Never claim that an agent heard binary audio if only text was supplied.
- Never treat a file name as ground truth in blind tests.
- Never convert genre, culture, tradition, ethnicity, or geography into a confident claim without evidence.
- Never let poetic or symbolic interpretation escape `interpreted` or `speculative`.
- Always include meaningful `undetermined` claims when evidence is missing.
- Always keep mode outputs distinct before synthesis.
