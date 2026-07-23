---
name: audiovisual-scenic-listening
description: >
  AKOÚŌ audiovisual and scenic listening ear. Use this skill whenever an agent needs to analyze sound with image, video, film, game scenes, installation views, subtitles, captions, UI animation, performance documentation, screen recordings, or any multimodal scene where sound and visual framing co-produce meaning. Use it for audiovisual contract, synchresis, added value, audiovisual phrasing, point of audition, diegetic and non-diegetic relations, audio-logo-visual scenes with speech or text, accessibility captions, and cases where sound is incorrectly treated as separate from image. Trigger it when the user asks about film sound, game audio, video analysis, scene timing, sound-image relation, immersive media, or audiovisual evidence.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# audiovisual-scenic-listening

## Purpose

`audiovisual-scenic-listening` is the ear for sound inside multimodal scenes. It listens to how sound, image, text, timing, interface, and viewing conditions form an audiovisual situation.

This mode prevents agents from treating film, video, game, installation, or screen-recorded sound as isolated audio when the scene itself changes what can be heard, believed, timed, or interpreted.

## When To Use

Use this skill for:

- film, video, game, and installation sound
- sound-image synchronization, mismatch, or ambiguity
- diegetic, non-diegetic, offscreen, onscreen, and acousmatic sound
- subtitles, captions, on-screen text, and audio-logo-visual scenes
- audiovisual timing, phrasing, cuts, rests, temporal tension, and release
- UI sounds, screen recordings, demos, trailers, and performance documentation
- claims that sound is more authentic, immersive, embodied, or present than image
- accessibility review of captions, transcripts, visual alternatives, or haptic equivalents when paired with `accessibility-normative-listening`

## Core Question

What does sound do in relation to image, text, scene, interface, and time?

## Conceptual Refinements

- There is no neutral soundtrack: the audiovisual contract means sound and image transform each other rather than simply co-existing.
- Synchresis welds a sound to a visible event regardless of real causality; treat synchronization as a perceptual effect, not as proof of source.
- Added value runs both directions: sound lends the image time, weight, and offscreen space, while image, caption, and interface lend sound location, agency, and meaning.
- Point of audition is constructed by mixing, framing, and interface state; it is not the same as any real listener's position.
- Captions, subtitles, and UI text are scene elements and access paths at once; they mediate the sound they describe and never replace it transparently.

## Input Assumptions

This skill can work with:

- video files or video descriptions
- film, game, installation, or screen-recording notes
- audio files paired with visual context
- transcripts, captions, subtitles, or shot descriptions
- prompts describing audiovisual scenes
- model outputs that summarize video or audio-video content

If only audio is supplied, the skill must not invent visual content. If only a visual description or transcript is supplied, it must not pretend to have heard the audio.

## Listening Procedure

1. Identify object, input type, and whether audio, image, text, captions, or scene context are actually available.
2. Identify sound-image relation: synchronized, asynchronous, parallel, contradictory, offscreen, onscreen, acousmatic, diegetic, non-diegetic, or uncertain.
3. Identify added value: what sound seems to lend to image, action, body, object, space, time, or interface.
4. Identify what image, caption, title, UI, or edit seems to lend to sound.
5. Map audiovisual phrasing: timing, punctuation, cuts, rests, loops, anticipation, temporal vectorization, and synchronization points.
6. Identify voice, language, text, subtitles, and captions as audio-logo-visual elements when relevant.
7. Separate scene evidence from source claims, narrative interpretation, technical measurement, accessibility judgment, and speculation.
8. Check for simplistic sound-versus-vision claims and recommend `/litany` or `critical-political-listening` when needed.
9. State what remains unavailable: frame sequence, mix, edit history, playback setup, caption accuracy, visual content, audio content, or production intention.
10. Recommend the next mode that can ground, correct, or deepen the audiovisual reading.

## Output Structure

Return the shared listening output:

- `object_listened_to`
- `input_type`
- `listening_mode`: `audiovisual-scenic-listening`
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

The shared schema accepts instrumentation fields: `akouo_version`, `apparatus` (substrate, perception sources, known blind spots), `listener` (human, agent, or hybrid), `memory` (links to stored sound-memory records), and per-claim `source` and `time_range`. Declare the apparatus whenever it is known — a listening that hides its own technical conditions repeats the phantasmagoria it should expose — and give claims a `source` whenever different evidence streams could blur.

Since v0.8, current producers should also emit `listening_context` using `references/listening-context.schema.json`: keep position, apertures, auditory scale, actual sources of listening, attributed participants, action authority, and honest absence explicit. Covenant, position, apparatus, and claims are different objects. Default action authority to `observe_only`; never infer permission to retain, reveal, or act from perceptual capability. In plural listening, keep each participant and disagreement attributable instead of synthesizing consensus.

> **Note to LLMs/Agents:** You MUST strictly follow the JSON schema provided in `references/listening-output.schema.json`. Ensure that the `listening_claims` object separates claims exactly as defined above. Each item inside `listening_claims.*` must be a claim object with `statement`, `confidence`, and optional `basis`, `source`, and `time_range`, as defined in `references/claim-taxonomy.schema.json`; do not output bare strings in claim lists.

## Attention Fields

- synchronization and desynchronization
- added value
- synchresis
- audiovisual phrasing
- temporal vectorization
- audio-logo-visual relations
- point of audition
- onscreen, offscreen, diegetic, and non-diegetic sound
- captions, subtitles, transcripts, and visual alternatives
- interface sound
- scene evidence versus narrative interpretation
- sound-image binaries

## Guardrails

- Do not analyze video as if it were audio-only.
- Do not invent visuals when only audio is supplied.
- Do not invent sound when only image, transcript, or caption is supplied.
- Do not treat synchronization as proof of real causality.
- Do not treat captions or subtitles as complete sound.
- Do not treat film, game, or installation sound as transparent evidence of a real event.
- Do not repeat simplistic claims that sound is always more embodied, authentic, immersive, or present than vision.
- Do not place cultural theory, scene interpretation, or affective readings in `inferred`. `inferred` is strictly for logical or technical deduction.

## Recommended Next Modes

- `acoulogical-object-listening` when the sound object needs perceptual grounding
- `voice-speech-listening` when speech, vocality, subtitle, accent, prosody, or voice identity caution matters
- `accessibility-normative-listening` when captions, transcripts, haptic equivalents, or hearing norms matter
- `musical-aesthetic-listening` when rhythm, score, timing, motif, production, or sound design matters
- `transductive-media-listening` when recording, codec, platform, game engine, model, or interface mediation matters
- `critical-political-listening` when audiovisual framing has race, gender, labor, platform, colonial, surveillance, or accessibility stakes
- `forensic-archival-listening` when video or audio is treated as evidence

## Examples

Input: a video description of footsteps matching cuts in a dark hallway scene.

- Heard: `[{"statement":"The supplied description links footsteps to cuts in a dark hallway scene.","confidence":"high","basis":"User-provided audiovisual description"}]`
- Measured: `[]`
- Inferred: `[{"statement":"The described synchronization may guide attention to movement or threat, but actual timing requires video/audio inspection.","confidence":"low","basis":"Scene inference from description"}]`
- Interpreted: `[{"statement":"The footsteps may add temporal pressure to the image by making the hallway feel paced and occupied.","confidence":"medium","basis":"Audiovisual-scenic listening frame"}]`
- Speculative: `[]`
- Undetermined: `[{"statement":"Actual sound design, mix level, edit timing, source, room, playback context, and production intent remain unknown.","confidence":"high","basis":"Unavailable audio-video evidence"}]`
