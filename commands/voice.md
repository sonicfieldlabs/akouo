# /voice

## Purpose

`/voice` is the voice and speech command. It separates vocal sound, transcript content, ASR output, TTS, voice-agent behavior, identity caution, consent, and access paths.

## When To Use

Use `/voice` for:

- spoken audio
- transcripts and captions
- podcasts, radio, interviews, and voice notes
- ASR, diarization, TTS, dubbing, voice cloning, and voice agents
- voice interfaces and agentic workflows
- identity, consent, intelligibility, or accessibility concerns

## Skills Called

- `akouo-router` as an implicit planning pass that supplies the evidence inventory, risks, and forbidden assumptions the synthesis must respect
- `voice-speech-listening`
- `transductive-media-listening`
- `accessibility-normative-listening`
- `critical-political-listening` when identity, consent, surveillance, platform, dataset, labor, or institutional stakes appear

## Execution Order

1. Run `voice-speech-listening` to separate vocal sound, speech content, transcript, identity claims, and voice mediation.
2. Run `transductive-media-listening` when ASR, TTS, voice agents, voice cloning, codecs, platforms, or model outputs are involved.
3. Run `accessibility-normative-listening` to audit captions, transcript path, intelligibility, hearing assumptions, and alternate access.
4. Run `critical-political-listening` when the voice is tied to consent, surveillance, labor, dataset, identity, archive, platform, or institutional risk.
5. Synthesize with strict separation between heard voice, text evidence, model output, interpretation, speculation, and unknowns.

## Expected Output

Use `schemas/command-output.schema.json`.

The output must include:

- what is voice evidence, transcript evidence, model evidence, or only prompt evidence
- identity and consent cautions
- transcript, caption, ASR, or diarization limits
- access paths and missing access paths
- mediation chain when known
- recommended next mode

## Guardrails

- A transcript is not the whole voice.
- A voice is not proof of identity, age, gender, ethnicity, disability, sincerity, or emotion.
- ASR and diarization are representations, not neutral capture.
- Treat consent, dataset provenance, and platform mediation as unknown unless supplied.
- Keep accessibility integral to voice analysis, not an optional afterthought.

## Must Not Do

- Do not infer identity or protected traits from vocal sound.
- Do not treat transcript text as complete vocal evidence.
- Do not claim emotion, truthfulness, consent, or agency from tone alone.
- Do not ignore captions, transcripts, language access, or intelligibility.
- Do not turn generated or cloned voice into evidence of a real speaker.

## Recommended Follow-Up

Recommend `/forensic` for testimony, legal, archival, or harm contexts. Recommend `/transduce` for voice-agent, ASR, TTS, cloning, or dataset questions. Recommend `/access` when the main issue is intelligibility, captions, or alternate access.
