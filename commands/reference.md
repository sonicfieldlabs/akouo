# /reference

## Purpose

`/reference` maps a sonic object or prior listening output to concepts, methodologies, authors, traditions, cautions, adjacent modes, and research routes.

It is not a bibliography generator. It is a conceptual mapping layer.

## When To Use

Use `/reference` for:

- sound studies research routes
- sonic methodologies
- author and tradition mapping
- conceptual clarification
- thesis, essay, or project development
- connecting a listening report to adjacent methods
- routing concepts for voice, audiovisual, accessibility, field, material, and agentic listening workflows
- identifying cautions before deeper interpretation

## Skills Called

- `reference-layer`
- optionally any prior listening output from another mode or command
- optionally `akouo-router` when no prior listening output exists and a starting mode is needed

## Execution Order

1. Identify the object or prior listening output.
2. Identify triggered concepts and methodological problems.
3. Map relevant authors, traditions, and sonic practices.
4. Identify possible research routes.
5. Identify cautions and overclaiming risks.
6. Recommend adjacent listening modes.

## Expected Output

Use `schemas/command-output.schema.json` when wrapped as a command result.

The reference map should include:

- concepts triggered
- sonic methodologies
- authors or traditions
- possible research routes
- research questions
- cautions
- adjacent modes
- recommended next mode

## Guardrails

- References must clarify the listening situation.
- Prefer conceptual relevance over quantity.
- Map methods and questions, not only names.
- Include cautions, not only affinities.
- Keep references tied to the actual sound, prompt, archive, or prior output.
- State when the available input is too thin for confident reference mapping.

## Must Not Do

- Do not produce a random reading list.
- Do not decorate weak analysis with famous names.
- Do not imply that a reference proves an interpretation.
- Do not erase nonhuman, embodied, technical, archival, political, or speculative dimensions.
- Do not collapse method into bibliography.

## Recommended Follow-Up

Recommend `/study` when the user wants the references developed into research notes. Recommend `/listen` or `/full-ear` when the reference map lacks a listening basis.
