<img width="3966" height="1586" alt="akouo" src="https://github.com/user-attachments/assets/bd53f4b7-662e-4bad-b92e-21773f814864" />

# AKOÚŌ 

## Operational ears for the agentic era

AKOÚŌ is a multimodal listening system and prompt library for agentic workflows. It serves as a portable skill layer for AI agents (like OpenClaw, Hermes, Claude, Gemini, or OpenCode), allowing them to perform accountable, structured sonic inquiry.

Most audio AI systems ask what is inside an audio file. AKOÚŌ asks how an agent should listen, what each listening mode reveals, what it hides, and what must remain unknown.

AKOÚŌ does not pretend that agents hear like humans. It gives them accountable, switchable, operational ears.

This public release contains the portable AKOÚŌ skills, router, command definitions, schemas, and a local-first reference app for running the listening workflows.

Official public repository: <https://github.com/sonicfieldlabs/akouo>. Current release contract: `v0.6`.

## Version Status

- `v0.1` marks the first public portable-skills release.
- `v0.2` refines the listening modes with stronger theoretical distinctions, clearer evidence boundaries, and more explicit public-repo hygiene.
- `v0.3` adds `musical-aesthetic-listening` as a public mode for music, rhythm, pitch, harmony, texture, sound-design utility, poetic usefulness, and genre/cultural caution.
- `v0.4` expands AKOÚŌ into a more portable listening router for agentic workflows with voice/speech, audiovisual/scene, accessibility/normativity, and material/event listening.
- `v0.5` consolidates agentic routing: `reference-layer` becomes a portable meta-skill, routing plans carry evidence levels and claim permissions, the app gains deeper browser-side signal estimates, and `SYSTEM_GUIDE.md` documents the integration contract.
- `v0.6` instruments the system for host apps: a machine-readable contract (`akouo.manifest.json`), portable listening presets (`presets/`), the new `memory-lineage-listening` mode and `/remember` command for sound-memory stores, apparatus/listener/memory declarations on outputs, per-claim `source` and `time_range`, budget-aware routing plans, and command-level claim-permission overrides.

## Core Idea

A sound is never only a source. It can be approached as:

- a signal measured in time and frequency
- a perceptual object or auditum
- a bodily and affective event
- a technical or computational trace
- an archive, testimony, or damaged record
- an ecological relation
- a cultural and political mediation
- a musical and aesthetic organization
- a voice, speech, transcript, or voice-agent relation
- an audiovisual scene across sound, image, text, interface, and timing
- an accessibility problem shaped by hearing norms, captions, haptics, devices, and sensory variation
- a material event of vibration, resonance, propagation, duration, and process
- a symbolic, fictional, or speculative world

akoúō keeps these dimensions distinct through explicit listening modes and a strictly enforced JSON claim taxonomy.

## Claim Taxonomy

Every output must distinguish its findings into the following epistemic categories:

- `heard`: directly present in the audio, prompt, transcript, or provided description
- `measured`: produced by file, signal, waveform, spectrogram, or metadata inspection
- `inferred`: plausible logical deductions (not theory or culture)
- `interpreted`: cultural, theoretical, affective, or contextual reading
- `speculative`: fictional, symbolic, imaginative, or possible-world reading
- `undetermined`: what cannot be responsibly claimed

This taxonomy is the main public contract of the system, preventing LLMs from hallucinating certainty or confusing a theoretical reading for a forensic measurement.

## v0.6 Instrumented Listening

The v0.6 release makes AKOÚŌ consumable as data, not just prose, and connects it to sound-memory stores. It adds:

- `akouo.manifest.json`: the machine-readable contract — skills with structured metadata (facets, cost tier, memory policy, corrective eligibility), command chains as data, the Evidence Ladder as data, and command permission overrides. Host apps load this instead of hand-copying tables that drift.
- `presets/presets.json`: portable listening presets for recurring use-cases (basic, signal, field, music, voice, recall, remember, deep, forensic, access, fiction, generative, extended-spectrum), each with a mode chain, cost tier, memory policy, and perception passes.
- `memory-lineage-listening`: the fourteenth mode. It listens WITH stored sound-memories (earworm-style akousma records): recurrence, kinship, lineage, and change over time — while keeping memory as its own evidence stream, never proof about the present sound.
- `/remember`: the memory command — situate a sound in its lineage and register the listening into a store.
- Apparatus declarations: outputs can declare their listening substrate (ASR cascade, audio-token model, speech-native model, DSP toolchain, human ear, hybrid stack), perception sources, and known blind spots, so claim limits derive from the declared apparatus instead of surfacing after the fact.
- `listener` (human/agent/hybrid) and `memory` (akousma links) blocks on outputs, plus `akouo_version` for contract pinning.
- Per-claim `source` (audio, dsp, metadata, model, transcript, context, memory, human) and `time_range`, so evidence streams never blur and temporal claims stay anchored.
- Budget-aware routing: plans may carry `budget` (light/standard/deep) and `preset_id`; risk always overrides budget.
- Command permission overrides as data: `/forensic` suppresses interpreted/speculative claims; `/fiction` grants declared speculation.

## v0.5 Agentic Routing Consolidation

The v0.5 release makes AKOÚŌ more usable as an agent handoff layer. It adds:

- `reference-layer` as a portable meta-skill for concepts, methods, traditions, cautions, research routes, and adjacent modes
- expanded routing plans (`routing_plan`) for `/route` and `/method`, including evidence level, claim permissions, mode chain, stop conditions, and agent handoff notes
- a router Evidence Ladder that maps available evidence to allowed claim categories
- a deeper browser-side signal adapter in the reference app: BS.1770-style loudness and loudness range, FFT band-energy and spectral statistics, onset density with a guarded BPM candidate, stereo correlation/width/balance, and clipping-ratio estimates
- release validation for schema enum alignment, bundled reference schemas, generated artifacts, and public hygiene

## v0.4 Agentic Listening Expansion

The v0.4 working set turns AKOÚŌ into a broader listening router for autonomous and cross-app agent workflows. It adds:

- `voice-speech-listening` for voice, speech, transcripts, ASR, TTS, voice agents, identity caution, and consent boundaries
- `audiovisual-scenic-listening` for video, film, games, UI sound, captions, subtitles, synchronization, and sound-image-scene relations
- `accessibility-normative-listening` for hearing norms, captions, transcripts, haptics, assistive paths, sensory variation, fatigue, masking, and implied listener audits
- `material-event-listening` for vibration, resonance, duration, flux, material supports, propagation, and event behavior
- new workflow commands: `/voice`, `/audiovision`, `/access`, `/field`, `/method`, and `/route`

## v0.3 Musical/Aesthetic Integration

The v0.3 release promotes musical and aesthetic listening into the public core. `musical-aesthetic-listening` lets agents describe rhythm, pitch, harmony, timbre, texture, production aesthetics, form, sound-design utility, and poetic usefulness without collapsing into genre labels, cultural overreach, or unsupported claims about tradition, instrument, source, or scene.

## v0.2 Conceptual Discipline

The v0.2 skills keep the same public schemas and mode names, but sharpen the conceptual boundaries between:

- signal, perceptual object, affect, mediation, evidence, ecology, politics, and speculation
- soundscape, acoustemology, and aurality
- machine listening, ASR, voice agents, neural audio codecs, and generative audio
- affect and named emotion
- testimony, archive, legal evidence, and symbolic witness
- declared sonic fiction and evidentiary claims

## Core Architecture

akoúō is organized as one meta-router, fourteen distinct listening modes, and one conceptual reference layer. These are packaged as portable agent skills (`skills/`) that can be injected into any LLM agent supporting skill-based system prompts or custom instructions.

- `akouo-router` (meta-skill: chooses modes before analysis)
- `signal-inspection-listening`
- `acoulogical-object-listening`
- `embodied-affective-listening`
- `transductive-media-listening`
- `forensic-archival-listening`
- `ecological-posthuman-listening`
- `critical-political-listening`
- `musical-aesthetic-listening`
- `symbolic-fictional-listening`
- `audiovisual-scenic-listening`
- `voice-speech-listening`
- `accessibility-normative-listening`
- `material-event-listening`
- `memory-lineage-listening`
- `reference-layer` (meta-skill: maps listening to concepts, methods, traditions, and cautions)

Each skill lives in its own folder with a `SKILL.md` file, following the standard skill format used by OpenCode, Claude Code, and compatible agent frameworks.

## Using the System

To give an agent an "akoúō ear":
1. Supply the agent with the appropriate `SKILL.md` from the relevant `skills/<mode>/` folder as its system prompt or custom instruction.
2. Supply the agent with the appropriate JSON schema from `schemas/`, or from the skill's bundled `references/` folder when using a skill standalone, to strictly format its output.
3. Provide the sonic object (as an audio file, a text prompt, a spectrogram, or a transcript).

For agent frameworks that support skill discovery, each `SKILL.md` includes YAML frontmatter with `name` and `description` fields for automatic triggering.

## 60-Second Reviewer Path

```sh
cd app
npm install
npm run dev
```

Open the local Vite URL, drop a short WAV/AIFF/MP3/OGG file or enter a sound prompt, choose `/listen`, and run `INITIATE LOCAL LISTENING PASS`. The deterministic local path runs fully offline: no model provider, benchmark server, credentials, or network connection is required.

### Example

User prompt: *"Analyze this field recording from a rainforest at night."*

Agent loads `skills/ecological-posthuman-listening/SKILL.md` and produces structured output:

```json
{
  "object_listened_to": "Rainforest night field recording",
  "input_type": "audio_file",
  "listening_mode": "ecological-posthuman-listening",
  "listening_claims": {
    "heard": [
      {
        "statement": "Layered insect-like textures, distant water movement, and occasional leaf rustle are present in the supplied recording.",
        "confidence": "medium",
        "basis": "Audible content or user-provided description"
      }
    ],
    "measured": [],
    "inferred": [
      {
        "statement": "The recording may contain mixed biophony and geophony layers.",
        "confidence": "low",
        "basis": "Ecological layer inference without verified species, location, or spectral inspection"
      }
    ],
    "interpreted": [
      {
        "statement": "The recording presents habitat as an overlap of nonhuman rhythm and weather, not a pure nature scene.",
        "confidence": "medium",
        "basis": "Ecological listening frame"
      }
    ],
    "speculative": [],
    "undetermined": [
      {
        "statement": "Species identity, exact location, season, microphone type, and ecological condition remain unknown.",
        "confidence": "high",
        "basis": "Missing contextual and technical evidence"
      }
    ]
  },
  "what_appears": ["A night field recording can be approached through habitat relations rather than isolated source labels."],
  "what_remains_hidden": ["Species, site, season, recorder position, and ecological condition remain unavailable."],
  "mediations": {
    "technical": ["The microphone and file container mediate access to the habitat."],
    "cultural": [],
    "spatial": ["Distance and microphone position shape what becomes audible."],
    "bodily": [],
    "archival": [],
    "computational": []
  },
  "risks": {
    "hallucination": ["Do not invent species or location from texture alone."],
    "over_identification": ["Do not identify animals without evidence."],
    "cultural_flattening": [],
    "forensic_overreach": [],
    "source_confusion": ["Do not treat the recording as direct unmediated nature."],
    "aesthetic_overstatement": ["Avoid romanticizing the scene as pure wilderness."]
  },
  "main_reading": "The recording should be read as a mediated habitat relation across nonhuman, weather, spatial, and technical layers.",
  "alternative_reading": "A signal-inspection pass could ground this reading in measured frequency, duration, noise, and dynamic traits.",
  "recommended_next_mode": "transductive-media-listening"
}
```

Commands (located in `commands/`) combine these skills into reusable listening chains, like `/one-sound-many-ears`, `/forensic`, `/voice`, `/audiovision`, `/access`, `/field`, `/method`, or `/route`.

For the agent-to-agent handoff format, see `examples/routing-plan-example.json`: an expanded routing plan (per `schemas/routing-plan.schema.json`) carrying `route_confidence`, `evidence_level`, `claim_permissions`, a `mode_chain`, `stop_conditions`, and an `agent_handoff` summary that a receiving agent can act on without re-listening.

## Repository Layout

```text
akouo/
  README.md
  AGENTS.md            # Instructions for AI agents working on this project
  SYSTEM_GUIDE.md      # Operational guide for commands, workflows, and app contract
  SKILL_INDEX.md       # Quick-reference manifest of all skills
  CHANGELOG.md         # Release history from v0.1 through v0.6
  akouo.manifest.json  # Machine-readable system contract (skills, commands, ladder, overrides)
  LICENSE
  .gitignore
  app/                 # Local-first reference app for running AKOÚŌ workflows
  presets/
    presets.json         # Portable listening presets (validated by schemas/preset.schema.json)
  scripts/
    validate-release.sh  # Pre-release validation script
  skills/
    akouo-router/
      SKILL.md
      references/
    signal-inspection-listening/
      SKILL.md
      references/
    acoulogical-object-listening/
      SKILL.md
      references/
    embodied-affective-listening/
      SKILL.md
      references/
    transductive-media-listening/
      SKILL.md
      references/
    forensic-archival-listening/
      SKILL.md
      references/
    ecological-posthuman-listening/
      SKILL.md
      references/
    critical-political-listening/
      SKILL.md
      references/
    musical-aesthetic-listening/
      SKILL.md
      references/
    symbolic-fictional-listening/
      SKILL.md
      references/
    audiovisual-scenic-listening/
      SKILL.md
      references/
    voice-speech-listening/
      SKILL.md
      references/
    accessibility-normative-listening/
      SKILL.md
      references/
    material-event-listening/
      SKILL.md
      references/
    memory-lineage-listening/
      SKILL.md
      references/
    reference-layer/
      SKILL.md
      references/
  commands/
  schemas/
  examples/
  evals/
```

## Public-Repo Hygiene

This repository is safe for public release. It contains no private recordings, API keys, personal data, or local system paths. All skills use generic framework-agnostic instructions with no dependency on a specific model provider. `node_modules/` and build artifacts are excluded by `.gitignore`.

Conceptual refinements should be incorporated as public-facing skill language only. Do not bundle private notes, local research directories, unpublished source maps, private file paths, or personal identifiers into the portable skills.

Run `./scripts/validate-release.sh` before publishing to verify skill structure, schema consistency, hygiene, and absence of generated build artifacts.

For a full operational guide covering commands, workflows, benchmark ingestion, and data structure, see [`SYSTEM_GUIDE.md`](SYSTEM_GUIDE.md).

## Roadmap

Done: 
- First versions of 13 listening modes for multimodal listening
- First version of the router
- v0.2 conceptual refresh of router and listening modes
- v0.3 integration of `musical-aesthetic-listening`
- v0.4 working expansion for voice, audiovisual scene, accessibility, material event, router scoring, and agent handoff commands
- v0.5 consolidation of `reference-layer`, router Evidence Ladder, documented agentic integration contract, and expanded routing plans
- Deeper browser-side signal adapter in the reference app: BS.1770-style loudness and loudness range, FFT band-energy and spectral statistics, onset density with a guarded BPM candidate, and stereo correlation/width/balance
- v0.6 machine-readable contract (`akouo.manifest.json`), portable presets, `memory-lineage-listening` + `/remember` for sound-memory stores, apparatus/listener/memory declarations, per-claim `source`/`time_range`, and budget-aware routing
Next: 
- Sample-accurate waveform and spectrogram visualization with true-peak metering
- Stronger interop examples for calling AKOÚŌ from other agent apps and frameworks

The store-connected flow now exists as its own app: the **akousmata listening
navigator** (`github.com/sonicfieldlabs/akousmata`) is the reference library
over the shared store — memory-lineage listening and `/remember` run against
it, and manual human listening events enter the same library as agent
listenings (listener `human`, contract `akousmata/v0.1`).

## License

MIT License. See `LICENSE`.
