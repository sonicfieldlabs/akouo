# /route

## Purpose

`/route` is the router-only handoff command. It produces a compact listening plan that another agent, app, framework, or workflow can execute without running a full listening analysis.

## When To Use

Use `/route` for:

- agentic workflow orchestration
- routing audio, transcript, video, field note, dataset, metadata, or model output into AKOÚŌ skills
- deciding primary, secondary, and corrective listening modes
- producing a stop-condition list before autonomous work begins
- integrating AKOÚŌ with other apps, skill systems, benchmark runners, or model routers

## Skills Called

- `akouo-router`

## Execution Order

1. Identify input type and available evidence.
2. Score likely listening frames.
3. Select primary, secondary, and corrective modes.
4. State risks and forbidden assumptions.
5. Recommend command, next mode, and handoff conditions.

## Expected Output

Use `schemas/router-output.schema.json`.

When the receiving system supports expanded routing plans, also use `schemas/routing-plan.schema.json`.

The output must include:

- object listened to
- input type
- available and unavailable evidence
- primary, secondary, and corrective modes
- route reasoning
- risks and must-not-assume list
- recommended command and next mode

## Guardrails

- `/route` does not analyze the sound.
- It must not make content claims that belong to listening modes.
- It must preserve claim discipline by naming evidence limits and stop conditions.
- It must be portable across agent frameworks.
- It must not include private file paths, private notes, credentials, unpublished source maps, or local project data.

## Must Not Do

- Do not pretend routing is analysis.
- Do not skip corrective mode selection.
- Do not treat prompt, transcript, metadata, and audio as equivalent evidence.
- Do not recommend unsupported measurements.
- Do not hide uncertainty to make the plan appear autonomous.

## Recommended Follow-Up

Recommend the selected `recommended_command` when the user wants analysis. Recommend `/method` when the route should become a research or app-integration workflow.
