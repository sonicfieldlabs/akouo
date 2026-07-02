---
name: reference-layer
description: >
  AKOÚŌ conceptual reference and mapping layer. Use this skill whenever an agent needs to turn a sonic object, a prior listening output, or a research question into concepts, sonic methodologies, authors or traditions, research routes, research questions, cautions, and adjacent listening modes. Use it for sound studies research, essay and thesis development, artistic research, methodology design, workshop planning, and for the `/reference`, `/study`, and `/method` commands. Use it after one or more listening modes have produced outputs, or directly when the user asks where a sonic question sits in existing methods and traditions. It maps concepts and cautions; it is not a bibliography generator and must not produce citation dumps.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# reference-layer

## Purpose

`reference-layer` is the conceptual mapping ear of akoúō. It does not listen to the sound directly. It listens to the listening: it takes a sonic object, a prior listening output, or a research intent and maps it to concepts, methodologies, traditions, research routes, questions, cautions, and adjacent listening modes.

Like `akouo-router`, this is a meta-skill. The router decides how to listen before analysis; the reference layer decides where the listening sits in existing methods and what could responsibly come next in research.

## When To Use

Use this skill for:

- turning a listening report into research routes and questions
- mapping a sonic object or method question to sound studies concepts and traditions
- essay, thesis, project, workshop, and fieldwork method development
- naming cautions before deeper interpretation
- choosing adjacent listening modes for the next pass
- the mapping step inside `/reference`, `/study`, and `/method`

## Core Question

Which concepts, methods, traditions, questions, and cautions does this listening situation activate, and which adjacent ears should hear it next?

## Conceptual Refinements

- A reference is a route, not an authority: naming a concept or tradition opens a path of inquiry; it never proves an interpretation.
- Methods and concepts answer to the object: every mapped route must stay tied to the actual sound, prompt, archive, or prior listening output.
- Traditions are situated: sound studies categories travel with histories and exclusions; do not universalize Western or Northern framings as default method.
- Cautions are part of the map: each conceptual route carries its own overreach risks, and the map must name them alongside the affinities.
- The reference layer inherits the claim discipline: concepts and traditions belong to `interpreted` reasoning; they never upgrade a claim's evidence category.

## Input Assumptions

This skill can work with:

- one or more prior listening outputs in the shared schema
- a router output or routing plan
- a sonic object description, prompt, field note, or archive note
- a research question, essay draft, or method sketch
- a command context from `/reference`, `/study`, or `/method`

If the available input is too thin for confident mapping, the skill must say so and return a minimal map with explicit cautions rather than padding the output with famous names.

## Listening Procedure

1. Identify the object, prior outputs, and research intent.
2. Identify which concepts the situation actually triggers, not which concepts are merely available.
3. Map sonic methodologies that operationalize those concepts.
4. Map authors or traditions as orientation points, with their situated limits.
5. Derive possible research routes that the user could actually take next.
6. Formulate research questions that stay answerable from the available or obtainable evidence.
7. Name cautions: overreach risks, universalisms, appropriations, and theory-versus-evidence confusions specific to this map.
8. Recommend adjacent listening modes that would ground, correct, or extend the mapped routes.
9. State when the input is too thin for confident reference mapping.

## Output Structure

Return a reference map:

- `concepts_triggered`
- `sonic_methodologies`
- `authors_or_traditions`
- `possible_research_routes`
- `research_questions`
- `cautions`
- `adjacent_modes`

> **Note to LLMs/Agents:** You MUST strictly follow the JSON schema provided in `references/reference-map.schema.json`. When the reference map is wrapped inside a command result, it appears as the `reference_map` field of `schemas/command-output.schema.json`. The reference layer produces no `listening_claims` of its own; concepts and traditions support `interpreted` reasoning and never convert claims into `heard`, `measured`, or `inferred`.

## Guardrails

- Do not produce a bibliography dump or a random reading list.
- Do not decorate weak analysis with famous names.
- Do not imply that a reference proves an interpretation.
- Do not map more concepts than the situation triggers; relevance over quantity.
- Do not universalize Western or Northern sound studies categories as default method.
- Do not erase nonhuman, embodied, technical, archival, political, or speculative dimensions when selecting routes.
- Do not let theory override the claim taxonomy of prior listening outputs.
- State clearly when the available input is too thin for confident mapping.

## Recommended Next Modes

- `acoulogical-object-listening` when the map needs perceptual grounding before theory
- `signal-inspection-listening` when a mapped route depends on measurable claims
- `critical-political-listening` when mapped traditions carry power, colonial, labor, or access stakes
- `ecological-posthuman-listening` when routes concern field, habitat, or more-than-human method
- `symbolic-fictional-listening` when a route opens declared speculative or worldbuilding method
- `musical-aesthetic-listening` when routes concern musical organization, production, or aesthetic value

## Example

Input: a prior `ecological-posthuman-listening` output about a night field recording, with a user goal of writing a methods chapter.

- `concepts_triggered`: `["listening-with", "acoustemology", "field recording ethics", "claim taxonomy"]`
- `sonic_methodologies`: `["situated field listening", "habitat relation mapping", "capture-chain documentation"]`
- `authors_or_traditions`: `["Steven Feld / acoustemology", "acoustic ecology and its critics", "posthuman sound studies"]`
- `possible_research_routes`: `["compare habitat relations across recording sessions", "document fieldwork decisions as part of the listening method", "test ecological claims against measured spectral evidence"]`
- `research_questions`: `["What does the recording stage as habitat relation rather than scenery?", "Which fieldwork decisions shaped what became audible?"]`
- `cautions`: `["Do not romanticize the field as pure nature.", "Do not treat acoustemology as universally transferable method.", "Species and site claims remain undetermined without evidence."]`
- `adjacent_modes`: `["transductive-media-listening", "critical-political-listening", "signal-inspection-listening"]`
