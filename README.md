<img width="3966" height="1586" alt="akouo" src="https://github.com/user-attachments/assets/bd53f4b7-662e-4bad-b92e-21773f814864" />

# AKOÚŌ 

## Operational ears for the agentic era

AKOÚŌ is a multimodal listening system and prompt library for agentic workflows. It serves as a portable skill layer for AI agents (like OpenClaw, Hermes, Claude, Gemini, or OpenCode), allowing them to perform accountable, structured sonic inquiry.

Most audio AI systems ask what is inside an audio file. AKOÚŌ asks how an agent should listen, what each listening mode reveals, what it hides, and what must remain unknown.

AKOÚŌ does not pretend that agents hear like humans. It gives them accountable, switchable, operational ears.

This public release contains the portable AKOÚŌ skills, router, command definitions, and schemas. The local app is intentionally not included in this release.

## Version Status

- `v0.1` marks the first public portable-skills release.
- `v0.2` refines the listening modes with stronger theoretical distinctions, clearer evidence boundaries, and more explicit public-repo hygiene.
- `v0.3` adds `musical-aesthetic-listening` as a public mode for music, rhythm, pitch, harmony, texture, sound-design utility, poetic usefulness, and genre/cultural caution.

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

akoúō is organized as one meta-router and nine distinct listening modes. These are packaged as portable agent skills (`skills/`) that can be injected into any LLM agent supporting skill-based system prompts or custom instructions.

- `akouo-router`
- `signal-inspection-listening`
- `acoulogical-object-listening`
- `embodied-affective-listening`
- `transductive-media-listening`
- `forensic-archival-listening`
- `ecological-posthuman-listening`
- `critical-political-listening`
- `musical-aesthetic-listening`
- `symbolic-fictional-listening`

Each skill lives in its own folder with a `SKILL.md` file, following the standard skill format used by OpenCode, Claude Code, and compatible agent frameworks.

## Using the System

To give an agent an "akoúō ear":
1. Supply the agent with the appropriate `SKILL.md` from the relevant `skills/<mode>/` folder as its system prompt or custom instruction.
2. Supply the agent with the appropriate JSON schema from `schemas/`, or from the skill's bundled `references/` folder when using a skill standalone, to strictly format its output.
3. Provide the sonic object (as an audio file, a text prompt, a spectrogram, or a transcript).

For agent frameworks that support skill discovery, each `SKILL.md` includes YAML frontmatter with `name` and `description` fields for automatic triggering.

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

Commands (located in `commands/`) combine these skills into reusable listening chains, like `/one-sound-many-ears` or `/forensic`.

## Repository Layout

```text
akouo/
  README.md
  AGENTS.md            # Instructions for AI agents working on this project
  SKILL_INDEX.md       # Quick-reference manifest of all skills
  LICENSE
  .gitignore
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
  commands/
  schemas/
  examples/
```

## Public-Repo Hygiene

This repository is safe for public release. It contains no private recordings, API keys, personal data, or local system paths. All skills use generic framework-agnostic instructions with no dependency on a specific model provider. `node_modules/` and build artifacts are excluded by `.gitignore`.

Conceptual refinements should be incorporated as public-facing skill language only. Do not bundle private notes, local research directories, unpublished source maps, private file paths, or personal identifiers into the portable skills.

Run `./scripts/validate-release.sh` before publishing to verify skill structure, schema consistency, hygiene, and absence of generated build artifacts.

For a full operational guide covering commands, workflows, benchmark ingestion, and data structure, see [`SYSTEM_GUIDE.md`](SYSTEM_GUIDE.md).

## Roadmap

Done: 
- First versions of 9 listening modes for multimodal listening
- First version of the router
- v0.2 conceptual refresh of router and listening modes
- v0.3 integration of `musical-aesthetic-listening`
Next: 
- Standalone app for quick use of the functions and chat
- Web version of the agent so you can load and describe sounds in browser.

## License

MIT License. See `LICENSE`.
