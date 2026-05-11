---
name: symbolic-fictional-listening
description: >
  AKOÚŌ speculative and symbolic ear. Use this skill whenever an agent needs to interpret sound through myth, cosmology, sonic fiction, ritual, dream, alien voice, hauntology, hallucination-as-glitch, or speculative worldbuilding. Use it for sonic fiction, game audio, film worlds, ambient fantasy, AI-hallucinated sonic descriptions, hyperstition, mythscience, creative writing, sound design briefs, and symbolic readings of musical or sonic material. Use it when the user asks for a fictional, mythic, dreamlike, possible-world, or worldbuilding reading of sound, but always label speculation explicitly and never present imagination as evidence.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# symbolic-fictional-listening

## Purpose

`symbolic-fictional-listening` is the speculative ear of akoúō. It interprets sound through symbolic systems, myth, cosmology, sonic fiction, hallucination, futurity, ritual, dream, alien voice, synthetic worlds, and hyperstition.

This mode permits imagination as method, but only inside declared speculative boundaries.

## When To Use

Use this skill for:

- sonic fiction
- speculative sound worlds
- alien voice
- mythic sound
- ritual sound
- religious or cosmogonic sound
- hyperstition
- fictional audio prompts
- game sound
- film worlds
- dreamcore
- ambient fantasy
- AI hallucinated sonic descriptions
- symbolic reading of musical or sonic material
- creative writing, sound design briefs, and worldbuilding

## Core Question

What world does this sound imply, invoke, haunt, worship, simulate, or invent?

## Conceptual Refinements

- Sonic fiction is a method, not decoration: it lets sound generate concepts, worlds, and temporalities while keeping evidence boundaries intact.
- Mythscience can intensify impossible histories and speculative systems, but it must not masquerade as scholarship or forensic fact.
- Sonic possible worlds ask what reality the sound makes actual for a listener, without claiming that world is externally verified.
- Hauntology, remanence, ghosts, lost futures, and dead media should be handled as symbolic or cultural readings unless evidence supports archival claims.
- Hallucination-as-glitch can reveal generative assumptions in AI audio or perception, but it does not prove hidden messages, entities, or intent.

## Input Assumptions

This skill can work with:

- audio files
- sound prompts
- fictional descriptions
- game, film, installation, or narrative contexts
- AI-generated sonic captions
- music or sound design fragments
- ritual, mythic, symbolic, or dreamlike material
- obsolete media, hauntological textures, glitches, or speculative AI outputs

If the input is fictional or prompted, the skill must identify it as such. If real audio is present, the skill must separate actual audible traits from speculative worldbuilding.

## Listening Procedure

1. Identify the object, input type, and whether speculation is requested or appropriate.
2. Establish a speculative frame explicitly.
3. Identify perceptual anchors: what in the sound or prompt supports the symbolic reading.
4. Identify registers: mythic, religious, technological, erotic, ghostly, cosmic, urban, ancestral, synthetic, ritual, hauntological, or glitch.
5. Build a possible sonic world without presenting it as evidence.
6. Identify agents, forces, cosmology, temporal logic, atmosphere, implied bodies, media residues, and rules of audibility.
7. Separate symbolic interpretation from heard, measured, inferred, and undetermined claims.
8. Identify political or cultural risks if the fiction borrows from real traditions, violence, archives, identities, sacred practices, or Black/Indigenous futurisms.
9. Recommend a next mode to ground, critique, or deepen the speculative pass.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `symbolic-fictional-listening`
- `listening_claims.heard`
- `listening_claims.measured`
- `listening_claims.inferred`
- `listening_claims.interpreted`
- `listening_claims.speculative`
- `listening_claims.undetermined`
- `what_appears`
- `what_remains_hidden`
- `mediations.technical`
- `mediations.cultural`
- `mediations.spatial`
- `mediations.bodily`
- `mediations.archival`
- `mediations.computational`
- `risks.hallucination`
- `risks.over_identification`
- `risks.cultural_flattening`
- `risks.forensic_overreach`
- `risks.source_confusion`
- `risks.aesthetic_overstatement`
- `main_reading`
- `alternative_reading`
- `recommended_next_mode`

> **Note to LLMs/Agents:** You MUST strictly follow the JSON schema provided in `references/listening-output.schema.json`. Ensure that the `listening_claims` object separates claims exactly as defined above. Each item inside `listening_claims.*` must be a claim object with `statement`, `confidence`, and optional `basis`, as defined in `references/claim-taxonomy.schema.json`; do not output bare strings in claim lists.

## Attention Fields

- mythic register
- religious register
- technological register
- erotic register
- ghostly register
- cosmic register
- urban register
- ancestral register
- synthetic register
- fictional setting
- agents and forces
- cosmology
- temporal logic
- atmosphere
- hyperstitional potential
- sonic possible world
- media ghosts and lost futures
- hallucination or glitch status

## Guardrails

- Speculation must be labeled as speculation.
- Do not present imaginative interpretation as evidence.
- Do not use fictional mode to make forensic, political, or identity claims.
- Do not appropriate sacred, Indigenous, racialized, or cultural forms as aesthetic material without caution and context.
- Do not hide uncertainty inside poetic confidence.
- Do not turn every sound into myth if the user requested technical or evidentiary listening.
- If the sound concerns violence, testimony, or archive, keep forensic claims separate and conservative.
- Do not claim that AI hallucination, noise, or pareidolia reveals hidden messages, entities, or intent.
- Do not detach sonic fiction from its political and cultural lineages when those lineages are relevant.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

- `acoulogical-object-listening` when symbolic reading needs perceptual grounding
- `embodied-affective-listening` when fictional force depends on pressure, dread, pleasure, trance, fatigue, or ritual intensity
- `ecological-posthuman-listening` when the sonic world involves nonhuman agencies, habitats, cosmologies, or elemental scales
- `critical-political-listening` when symbolic reading risks flattening real histories, cultures, identities, archives, or power relations
- `transductive-media-listening` when the fictional sound emerges through AI generation, sensors, synthesis, or media conversion

## Example

Input: a prompt describing a choir of broken satellites singing at dawn.

- Heard: `[{"statement":"The input is a fictional prompt describing satellite-like voices and a dawnlike atmosphere.","confidence":"high","basis":"Prompt content, not verified audio"}]`
- Measured: `[]`
- Inferred: `[{"statement":"Metallic, choral, distant, harmonic, or glitching traits are suggested by the prompt but not confirmed as audio.","confidence":"low","basis":"Textual implication"}]`
- Interpreted: `[{"statement":"The prompt stages communication between obsolete machines and planetary time.","confidence":"medium","basis":"Symbolic reading of the fiction"}]`
- Speculative: `[{"statement":"A possible world appears in which orbital debris performs a synthetic dawn ritual.","confidence":"medium","basis":"Declared sonic-fiction frame"}]`
- Undetermined: `[{"statement":"Actual audio content, production technique, acoustic space, cultural references, and intended narrative remain unknown.","confidence":"high","basis":"No audio or production context supplied"}]`
