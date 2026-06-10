---
name: accessibility-normative-listening
description: >
  AKOÚŌ accessibility and hearing-norm audit ear. Use this skill whenever an agent needs to analyze sound, audio interfaces, captions, transcripts, alerts, voice agents, installations, media, games, archives, or agent workflows for accessibility, Deaf and hard-of-hearing access, sensory plurality, haptic or visual alternatives, intelligibility, hearing variation, fatigue, trauma, neurodivergence, normative hearing assumptions, audism, or universal design. Use it when the user asks whether a sonic system is accessible, inclusive, captioned, transcript-ready, haptic, usable without sound, safe at volume, or fair to people who do not hear like the presumed default listener.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# accessibility-normative-listening

## Purpose

`accessibility-normative-listening` is the ear that audits the presumed listener. It asks who can access the sound, who is expected to hear normally, who is excluded, and what alternate pathways are needed.

This mode treats accessibility as part of sonic design and interpretation, not as a late checklist. It refuses the assumption that sound analysis begins from a single able, hearing, undistracted, trauma-free, fatigue-free listener.

## When To Use

Use this skill for:

- captions, transcripts, subtitle quality, alt text, and audio descriptions
- haptic, visual, textual, spatial, or multimodal alternatives to sound
- alarms, alerts, notifications, voice agents, UI sounds, and safety signals
- Deaf and hard-of-hearing access, hearing aids, cochlear implants, hearing loops, and assistive technology
- noisy environments, low-volume playback, masking, fatigue, trauma, neurodivergence, and sensory overload
- installations, performances, games, apps, archives, classrooms, and public-space audio
- critique of hearing normativity, audism, and testing-hearing assumptions
- design audits for agentic listening systems and audio AI workflows

## Core Question

Who is the implied listener, and what access paths are missing?

## Conceptual Refinements

- Every sonic design implies a listener: a hearing range, a language, an attention budget, a device, and an environment. Naming that implied listener is the first analytic act.
- Deafness and hearing variation are not absences of sound but different sensory configurations; access work translates information, it does not compensate a deficit.
- Captions and transcripts are partial, authored mediations with their own timing, omissions, and style; caption quality is an empirical question, not a checkbox.
- Audism names the assumption that hearing is the default and superior mode; audits should detect it in interfaces, workflows, and analysis language alike.
- Accessibility claims need testing evidence: assistive-technology behavior, user reports, and environmental conditions cannot be inferred from design intent.

## Input Assumptions

This skill can work with:

- app or interface descriptions
- audio, video, caption, transcript, or accessibility notes
- installation, performance, archive, classroom, or public-space documentation
- voice-agent or audio-alert workflows
- user reports about hearing, fatigue, usability, volume, or sensory overload
- technical data about loudness, masking, speech intelligibility, or playback context

If accessibility information is missing, this mode should mark it undetermined and recommend what must be gathered.

## Listening Procedure

1. Identify object, input type, user context, and whether accessibility information is available.
2. Identify the implied listener: hearing ability, language, attention, body, device, environment, and interaction assumptions.
3. Check whether core information is available without sound through captions, transcripts, visual state, haptic cues, logs, or controls.
4. Check whether sound remains usable with hearing variation, low-quality speakers, noise, masking, fatigue, trauma, neurodivergence, and assistive technology.
5. Assess captions and transcripts as partial access, not full replacement for voice, tone, timing, music, soundscape, or affect.
6. Identify risks: alarms only in sound, inaccessible audio-only workflows, uncaptioned video, poor contrast for visual alternatives, autoplay, volume spikes, masking, or forced attention capture.
7. Separate design findings from cultural interpretation and from legal claims.
8. Recommend concrete design directions while marking missing evidence.
9. Route to `voice-speech-listening`, `audiovisual-scenic-listening`, `embodied-affective-listening`, or `critical-political-listening` when needed.
10. Include `undetermined` claims for absent user testing, caption quality, assistive technology behavior, and environmental conditions.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `accessibility-normative-listening`
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

- implied hearing subject
- Deaf and hard-of-hearing access
- captions, transcripts, visual state, and haptic alternatives
- speech intelligibility and masking
- volume, fatigue, overload, trauma, and attention capture
- assistive technologies
- universal design and flexibility
- access without sound
- caption limits and transcript limits
- hearing tests, norms, and institutional standards

## Guardrails

- Do not treat deafness as absence from sound.
- Do not reduce accessibility to captions only.
- Do not claim legal compliance unless the relevant standard and evidence are supplied.
- Do not assume a single normal listener, speaker, body, language, room, or device.
- Do not make disabled users responsible for inaccessible design.
- Do not treat transcript access as full access to voice, music, timing, or soundscape.
- Do not ignore sensory overload, fatigue, trauma, volume, masking, or forced attention.
- Do not place access ethics or cultural readings in `inferred`; keep them in `interpreted`.

## Recommended Next Modes

- `voice-speech-listening` when speech, captions, transcript, ASR, voice agent, or intelligibility matters
- `audiovisual-scenic-listening` when sound is paired with video, UI, subtitles, or visual alternatives
- `embodied-affective-listening` when volume, vibration, fatigue, masking, or overload matters
- `critical-political-listening` when access intersects with institutions, labor, race, class, gender, coloniality, platform, or public space
- `signal-inspection-listening` when loudness, clipping, masking, spectral profile, or speech intelligibility needs measurement
- `transductive-media-listening` when assistive technology, codec, platform, model, or device mediation matters

## Examples

Input: an app description says alerts are audio-only.

- Heard: `[{"statement":"The supplied description says the alerts are audio-only.","confidence":"high","basis":"User-provided design description"}]`
- Measured: `[]`
- Inferred: `[{"statement":"Users who cannot hear the alert, have muted devices, or are in noisy environments may miss critical state changes.","confidence":"medium","basis":"Design inference from audio-only alert path"}]`
- Interpreted: `[{"statement":"The design implies a normative hearing user and should provide visual, textual, and possibly haptic alternatives.","confidence":"high","basis":"Accessibility-normative listening frame"}]`
- Speculative: `[]`
- Undetermined: `[{"statement":"Actual alert content, urgency, volume, captioning, haptic support, visual state, user testing, and legal requirements remain unknown.","confidence":"high","basis":"Missing design and testing evidence"}]`
