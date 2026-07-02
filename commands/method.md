# /method

## Purpose

`/method` is the sonic methodology command. It turns a listening situation into a research and agent-handoff plan: which ears to use, which evidence is available, which claims are permitted, which references matter, and what another agent or app should do next.

## When To Use

Use `/method` for:

- research design and artistic research
- listening practice design
- essays, theses, workshops, fieldwork plans, and project methods
- agentic workflow planning
- routing sonic tasks into other apps, agents, datasets, or frameworks
- deciding whether the next step should be technical, perceptual, voice, audiovisual, access, field, forensic, political, fictional, or reference work

## Skills Called

- `akouo-router`
- `acoulogical-object-listening`
- `critical-political-listening`
- `accessibility-normative-listening`
- `reference-layer`

## Execution Order

1. Run `akouo-router` to identify evidence, risk, command route, primary mode, secondary mode, and corrective mode.
2. Run `acoulogical-object-listening` to keep method grounded in the object rather than abstract theory.
3. Run `critical-political-listening` to audit power, access, extraction, archive, labor, platform, and institutional stakes.
4. Run `accessibility-normative-listening` to name implied listener, alternate access path, and missing testing.
5. Run `reference-layer` to map concepts, methods, traditions, cautions, research routes, and adjacent modes.
6. Synthesize as an operational plan for the next agentic workflow.

## Expected Output

Use `schemas/command-output.schema.json`.

The output must include:

- evidence inventory
- permitted and forbidden claim types
- proposed mode chain
- methodology, references, and cautions
- access requirements
- handoff notes for another agent, app, or framework
- recommended next mode or command

When the receiving system supports expanded routing plans, carry them in the optional `routing_plan` field (`schemas/routing-plan.schema.json`); the reference app emits this for `/method` so the handoff includes evidence level, claim permissions, and stop conditions.

## Guardrails

- Method is operational: it must guide what to do next, not only describe theory.
- Keep references subordinate to claim discipline.
- Include access and corrective listening even when the task looks purely aesthetic or technical.
- Do not expose private notes, local paths, private recordings, or unpublished source maps in a public workflow.
- Make stop conditions explicit when evidence is too thin.

## Must Not Do

- Do not turn methodology into a bibliography dump.
- Do not recommend measurements without available audio, waveform, spectrogram, or metadata.
- Do not recommend identity, culture, or event claims without evidence.
- Do not ignore access, consent, platform, or fieldwork ethics.
- Do not make the plan depend on one agent framework.

## Recommended Follow-Up

Recommend `/route` when another agent only needs a compact handoff. Recommend `/reference` when research concepts need expansion. Recommend `/full-ear` when the object needs broad listening before method is finalized.
