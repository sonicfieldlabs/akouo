---
name: voice-speech-listening
description: >
  AKOÚŌ voice and speech listening ear. Use this skill whenever an agent needs to analyze spoken voice, vocal sound, singing voice, accent, prosody, breath, speech rhythm, vocal identity claims, ASR transcripts, voice agents, synthetic voice, voice cloning, dubbing, captions, oral history, testimony, or any situation where speech and vocality may be confused with identity, intention, emotion, truth, or consent. Use it for voice interfaces, podcasts, radio, film voices, AI voices, vocal timbre, object-voice, acousmatic voices, speech-native agents, diarization caution, transcript limits, and voice-data ethics. Trigger it generously whenever the user mentions voice, speech, speaker, accent, transcript, ASR, TTS, dubbing, singing, prosody, or voice agent behavior.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# voice-speech-listening

## Purpose

`voice-speech-listening` is the ear for voice as sound, speech, body, interface, trace, performance, and data. It separates vocal qualities from speaker identity, transcript content, emotion, intention, consent, and technical mediation.

This mode exists because agents often overclaim around voice. A transcript is not the voice. A voice is not proof of identity. Prosody is not direct access to feeling. A synthetic voice is not evidence of a real speaker.

## When To Use

Use this skill for:

- spoken voice, singing voice, chant, breath, whisper, shout, and vocal texture
- podcasts, radio, oral history, testimony, film voice, dubbing, and game dialogue
- ASR transcripts, captions, diarization, speaker labels, and speech-to-text outputs
- synthetic voice, voice cloning, TTS, voice agents, and speech-native models
- accent, dialect, intelligibility, prosody, pacing, turn-taking, interruption, and latency
- acousmatic voice, object-voice, offscreen voice, and disembodied speech
- identity, consent, provenance, labor, accessibility, or surveillance questions involving voice

## Core Question

What can be responsibly said about this voice or speech without collapsing sound into identity, transcript, emotion, intention, or machine output?

## Input Assumptions

This skill can work with:

- audio files containing voice
- transcripts, captions, diarization, or ASR output
- voice-agent logs or model outputs
- descriptions of spoken, sung, synthetic, or acousmatic voices
- oral history, archive, radio, podcast, film, game, or platform context
- metadata about speech models, TTS, voice cloning, or capture chain

If only a transcript is available, the skill may analyze wording as supplied text but must not claim vocal timbre, accent, prosody, speaker identity, or emotional state.

## Listening Procedure

1. Identify object, input type, and whether actual audio, transcript, caption, ASR output, or model metadata is available.
2. Separate vocal sound from linguistic content, transcript formatting, speaker labels, and interface behavior.
3. Describe vocal traits only when evidence supports them: pitch contour, breath, roughness, sibilance, pacing, pauses, overlap, intensity, proximity, and timbre.
4. Treat accent, dialect, age, gender, ethnicity, disability, illness, intoxication, emotion, sincerity, or identity as undetermined unless supplied by reliable context.
5. For ASR or diarization, analyze the output as a model representation with omissions, substitutions, segmentation, and confidence limits.
6. For voice agents, distinguish ASR, language model reasoning, TTS, barge-in, turn detection, latency, and tool behavior.
7. For synthetic or cloned voices, ask about consent, provenance, dataset, ownership, watermarking, and deployment context without inventing them.
8. In testimony or legal contexts, route to `forensic-archival-listening`.
9. In platform, labor, surveillance, identity, or accessibility contexts, route to `critical-political-listening` or `accessibility-normative-listening`.
10. State what remains unavailable: speaker identity, consent, recording chain, transcript accuracy, prosody, emotion, body, and social context.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `voice-speech-listening`
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

- voice versus transcript
- speech content versus vocal sound
- prosody, pacing, pause, overlap, breath, grain, and proximity
- acousmatic voice and object-voice
- ASR, diarization, TTS, voice cloning, and voice-agent stack
- consent, provenance, ownership, and dataset uncertainty
- accent, dialect, identity, disability, and accessibility caution
- testimony and evidentiary stakes

## Guardrails

- Do not identify a speaker from voice alone.
- Do not infer race, ethnicity, gender, age, disability, illness, class, nationality, or emotion from voice without evidence.
- Do not treat an ASR transcript as the whole voice.
- Do not treat diarization labels as identity.
- Do not treat synthetic voice as evidence of a real speaker.
- Do not claim consent, dataset provenance, or ownership unless supplied.
- Do not turn vocal style into cultural certainty.
- Do not place cultural theory, affective reading, or identity interpretation in `inferred`.

## Recommended Next Modes

- `transductive-media-listening` when ASR, TTS, voice cloning, codecs, datasets, or voice-agent architecture matters
- `forensic-archival-listening` when the voice is testimony, evidence, archive, surveillance, or legal material
- `critical-political-listening` when voice intersects with race, gender, class, labor, consent, surveillance, platform, coloniality, or ownership
- `accessibility-normative-listening` when captions, transcripts, intelligibility, hearing norms, or alternate access matter
- `audiovisual-scenic-listening` when the voice is attached to image, character, subtitle, game, film, or interface
- `acoulogical-object-listening` when the vocal sound needs perceptual grounding before identity or meaning claims

## Examples

Input: an ASR transcript with speaker labels from a recorded interview.

- Heard: `[{"statement":"The supplied input is an ASR-style transcript with speaker labels.","confidence":"high","basis":"Provided transcript"}]`
- Measured: `[]`
- Inferred: `[{"statement":"The labels may indicate diarization segments, but they do not confirm speaker identities.","confidence":"low","basis":"Common ASR/diarization output structure"}]`
- Interpreted: `[{"statement":"The transcript is a mediated speech representation that may omit breath, tone, overlap, hesitation, and vocal texture.","confidence":"high","basis":"Voice-speech listening frame"}]`
- Speculative: `[]`
- Undetermined: `[{"statement":"Actual voice quality, accent, emotion, speaker identity, consent, transcript accuracy, recording chain, and diarization reliability remain unknown.","confidence":"high","basis":"No audio or provenance supplied"}]`
