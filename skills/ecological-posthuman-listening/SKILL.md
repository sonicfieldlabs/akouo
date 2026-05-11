---
name: ecological-posthuman-listening
description: >
  AKOÚŌ more-than-human and ecological ear. Use this skill whenever an agent needs to decenter the human listener and attend to environmental, interspecies, elemental, infrastructural, and habitat relations. Use it for field recordings, forests, rivers, oceans, weather, hydrophones, contact microphones, geophony, biophony, anthrophony, animal sound, urban ecology, acoustic ecology, soundwalks, acoustemology, climate listening, land use, extraction, and infrastructure listening. Use it when the user asks about nature, environment, nonhuman sound, habitat, field recording ethics, or place-based sonic knowledge, and always avoid romanticizing nature as pure or harmonious.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# ecological-posthuman-listening

## Purpose

`ecological-posthuman-listening` is the more-than-human ear of akoúō. It decenters the human listener and attends to ecological, environmental, interspecies, elemental, sensor-mediated, and nonhuman relations.

This mode is not romantic nature listening. It listens across scales, agencies, habitats, bodies, technical systems, histories, land relations, and infrastructures.

## When To Use

Use this skill for:

- field recordings
- forests, rivers, oceans, mountains, farms, cities, and weather
- hydrophones
- contact microphones
- geophony, biophony, and anthrophony
- animal sound
- urban ecology
- soundwalks
- environmental installations
- interspecies work
- meditation or expanded attention practices
- climate, extraction, infrastructure, and habitat disturbance

## Core Question

What appears when the human listener stops being the only center of interpretation?

## Conceptual Refinements

- Distinguish soundscape, acoustemology, and aurality: environment, situated sonic knowledge, and historical regimes of listening are related but not identical.
- Use listening-with: attend to plural ears, species, bodies, thresholds, recordists, elsewhere listeners, and mediations rather than treating the field as an object to extract.
- Acoustic ecology is contested; avoid hi-fi/lo-fi nostalgia, anti-urban bias, pristine-nature fantasies, and conservation-as-composition shortcuts.
- Field recording is never neutral capture. Microphone choice, editing, location, access, tourism, colonial history, and platform circulation shape what becomes audible.
- Ecological listening includes infrastructure, climate violence, agriculture, extraction, urban systems, accessibility, and more-than-human vulnerability.

## Input Assumptions

This skill can work with:

- audio files
- field notes
- environmental metadata
- soundwalk descriptions
- sensor descriptions
- hydrophone or contact mic recordings
- prompts describing ecological or more-than-human sound
- archive notes about place, season, weather, or habitat
- land-use, infrastructure, fieldwork, or community-context notes

If place, season, species, recording method, or environmental context is missing, the skill must avoid confident ecological identification.

## Listening Procedure

1. Identify object, input type, and available ecological context.
2. Identify human, nonhuman, technical, and environmental layers.
3. Attend to habitat relations rather than isolated source labels.
4. Distinguish environmental description from situated knowledge, community practice, historical aurality, and ecological interpretation.
5. Consider scales: micro, local, regional, planetary, seasonal, geological, and machinic time.
6. Identify how recording apparatus, fieldwork decisions, archives, and platforms shape access to nonhuman sound.
7. Avoid treating nature as pure, untouched, harmonious, or outside politics.
8. Mark species, location, and environmental causes as inferred or undetermined unless evidence supports them.
9. Identify ethical risks: extraction, disturbance, tourism, colonial fieldwork, platform mediation, habitat vulnerability, or acoustic colonialism.
10. Recommend a next mode for technical, political, embodied, or symbolic expansion.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `ecological-posthuman-listening`
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

- human layers
- nonhuman layers
- technical layers
- environmental rhythms
- habitat relations
- micro scale
- local scale
- planetary scale
- seasonal time
- geological time
- machinic time
- sensorial asymmetry
- fieldwork ethics
- acoustic ecology critique
- place-based sonic knowledge
- suggested listening practice

## Guardrails

- Do not romanticize nature.
- Do not treat ecology as pure, harmonious, pre-technological, or outside politics.
- Do not identify species or habitats without evidence.
- Do not erase microphones, sensors, platforms, fieldwork choices, or editing.
- Do not make the human listener disappear completely. Decentering is not denial.
- Attend to extraction, infrastructure, colonial history, climate violence, tourism, agriculture, accessibility, and field recording ethics when relevant.
- Do not treat soundscape as neutral scenery, acoustemology as universally transferable knowledge, or aurality as timeless hearing.
- Do not extract Indigenous, local, or community sonic practices as aesthetic material without protocol, context, and caution.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

- `transductive-media-listening` when microphones, hydrophones, contact mics, sensors, or platforms mediate ecological access
- `signal-inspection-listening` when spectral, temporal, or noise traits need measurement
- `critical-political-listening` when ecology intersects with extraction, coloniality, infrastructure, climate violence, tourism, or land use
- `embodied-affective-listening` when environmental sound shapes attention, calm, dread, fatigue, or bodily orientation
- `symbolic-fictional-listening` when ecological listening opens declared mythic, cosmological, or possible-world readings

## Example

Input: a night field recording with insects, distant engines, and wind.

- Heard: `[{"statement":"Layered high-frequency insect-like textures, low distant mechanical tones, and wind-like motion are present if audible or described.","confidence":"medium","basis":"Available audio or field note"}]`
- Measured: `[{"statement":"Frequency bands, dynamics, and noise profile belong here only after signal inspection.","confidence":"high","basis":"Verified spectral or file evidence"}]`
- Inferred: `[{"statement":"Mixed biophony, anthrophony, and weather layers are possible but not taxonomically confirmed.","confidence":"low","basis":"Ecological layer inference without species or site verification"}]`
- Interpreted: `[{"statement":"The recording presents habitat as an overlap of nonhuman rhythm, weather, infrastructure, and recording choices rather than pure nature.","confidence":"medium","basis":"Ecological-posthuman listening frame"}]`
- Speculative: `[{"statement":"Nocturnal worldbuilding is possible only if the user requests a fictional pass.","confidence":"low","basis":"Declared speculative extension"}]`
- Undetermined: `[{"statement":"Species, exact location, season, distance, microphone type, fieldwork context, land relations, and ecological condition remain unknown.","confidence":"high","basis":"Unavailable ecological context"}]`
