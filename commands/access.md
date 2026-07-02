# /access

## Purpose

`/access` is the accessibility and hearing-norm command. It audits who the system assumes can hear, what alternatives exist, where sonic information becomes inaccessible, and how captions, transcripts, haptics, visuals, device context, volume, attention, fatigue, and sensory variation shape listening.

## When To Use

Use `/access` for:

- captions, transcripts, subtitles, alt descriptions, and haptic alternatives
- voice agents, spoken interfaces, alerts, alarms, notification systems, and assistive workflows
- deaf, hard-of-hearing, neurodivergent, fatigued, masked, loud, or low-bandwidth listening contexts
- accessibility reviews of sonic apps, videos, games, installations, and agent workflows
- critiques of normal-hearing assumptions in listening analysis

## Skills Called

- `akouo-router` as an implicit planning pass that supplies the evidence inventory, risks, and forbidden assumptions the synthesis must respect
- `accessibility-normative-listening`
- `voice-speech-listening` when speech, captions, transcript, ASR, or dialogue matter
- `embodied-affective-listening` when volume, fatigue, alarm, pressure, masking, overload, bass, or haptics matter
- `critical-political-listening`

## Execution Order

1. Run `accessibility-normative-listening` to identify implied listener, access path, sensory assumptions, and missing alternatives.
2. Run `voice-speech-listening` when speech, captions, transcripts, ASR, or dialogue carry important information.
3. Run `embodied-affective-listening` when loudness, repetition, overload, fatigue, vibration, or masking may affect bodies differently.
4. Run `critical-political-listening` to name institutional, platform, labor, language, infrastructure, and exclusion stakes.
5. Synthesize access risks and concrete follow-up requirements without claiming user testing that has not occurred.

## Expected Output

Use `schemas/command-output.schema.json`.

The output must include:

- implied listener and listening conditions
- accessible alternatives provided or missing
- captions, transcripts, haptics, visuals, language, and timing concerns
- body and attention load when relevant
- what requires user testing or assistive-technology testing
- recommended next mode

## Guardrails

- Accessibility is a listening method, not a compliance afterthought.
- Do not assume one normal hearing listener, room, device, language, attention pattern, or body.
- Captions and transcripts require quality, timing, completeness, and context checks.
- Haptic and visual alternatives are not automatically equivalent to audio.
- State when testing with affected users or assistive technologies is required.

## Must Not Do

- Do not reduce accessibility to captions only.
- Do not speak for disabled users as if their experience were known.
- Do not universalize discomfort, fatigue, clarity, intelligibility, or immersion.
- Do not ignore language, device, environment, masking, or cognitive load.
- Do not claim compliance without standards, tests, or evidence.

## Recommended Follow-Up

Recommend `/voice` for speech-heavy systems. Recommend `/audiovision` for captioned video, games, or interface scenes. Recommend `/tech` when loudness, frequency, masking, or signal traits must be measured.
