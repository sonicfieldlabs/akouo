---
name: akouo-router
description: >
  AKOÚŌ meta-router for multimodal listening. Use this skill whenever an agent is asked to listen to, analyze, interpret, describe, or evaluate any sound, audio file, music fragment, rhythm, song, voice, speech, transcript, field note, spectrogram, archive fragment, video, caption, dataset, model output, platform artifact, interface sound, accessibility issue, stored sound-memory, or sonic concept. Use it when the user asks about audio without specifying how to listen, when routing between technical, perceptual, musical/aesthetic, affective, voice/speech, audiovisual/scenic, accessibility, material/event, forensic, ecological, political, memory/lineage, or fictional analysis, when preventing overreach in sensitive listening situations, or when recommending a listening chain for another agentic workflow. Always use this router first before applying any specialized listening mode.
compatibility: >
  Works with any LLM agent that supports skill injection (OpenCode, Claude, Gemini, etc.).
  Requires the AKOÚŌ JSON schemas for strict output formatting; bundled in this skill's `references/` folder.
---

# akouo-router

## Purpose

`akouo-router` is the meta-ear of akoúō. It does not analyze the sound directly. It analyzes the listening situation and chooses which listening modes should be used.

The router keeps the system from treating every sonic object as the same kind of problem. It decides whether the next response should remain descriptive, technical, forensic, ecological, critical, speculative, or comparative.

The router also checks conceptual confusion: signal versus meaning, music versus genre label, voice versus transcript, speech versus identity, caption versus sound, audiovisual synchronization versus causality, access versus normal-hearing assumption, material vibration versus measured evidence, soundscape versus acoustemology versus aurality, machine listening versus voice agent, archive versus evidence, affect versus emotion, and speculation versus proof.

## When To Use

Use this skill whenever an agent is asked to:

- listen to a sound, audio file, recording, prompt, transcript, field note, spectrogram, archive fragment, dataset, or sonic concept
- analyze or interpret audio without a clearly specified mode
- choose between technical, perceptual, musical/aesthetic, affective, voice/speech, audiovisual/scenic, accessibility, material/event, archival, ecological, political, or fictional listening
- prevent overreach in a sensitive or uncertain listening situation
- recommend a listening chain for another command or agentic workflow

## Core Question

What kind of listening does this situation require?

## Routing Refinements

- Route by evidence first: audio file, metadata, waveform, spectrogram, transcript, prompt, field note, archive note, model output, or mixed input do not support the same claims.
- Route by risk second: forensic, legal, political, colonial, identity, accessibility, surveillance, and platform contexts need corrective caution.
- Route by conceptual frame third: technical measurement, perceptual morphology, musical/aesthetic organization, bodily affect, voice/speech, audiovisual scene, accessibility and hearing norm, material event, transduction, testimony, ecological relation, political mediation, memory and lineage, or declared fiction.
- Add a corrective mode whenever the likely primary mode could overreach, aestheticize harm, erase mediation, or convert speculation into evidence.
- Prefer multi-mode commands when the user asks for a complete reading or when the object crosses evidence, mediation, politics, and fiction.
- For autonomous workflows, return enough evidence limits, forbidden assumptions, and mode-chain logic that another app or agent can execute the route without inventing missing evidence.
- Correct for vococentrism: the presence of speech pulls routing toward voice modes by default, but a task about ambience, music, habitat, or material behavior keeps its own primary even when someone is speaking in the recording.
- Never let one frame capture the whole route: keep at least one alternative reading alive (`route_reasoning` for router output, `alternative_reading` in mode outputs), especially when confidence is high.

## Machine-Readable Contract

Since v0.6 the routing layer is also published as data. Host apps should load `akouo.manifest.json` (validated by `schemas/manifest.schema.json`) for the skill list, command chains, evidence ladder, and command permission overrides, and `presets/presets.json` (validated by `schemas/preset.schema.json`) for named listening configurations. Hand-copied route tables drift; the manifest is the source of truth this skill's prose explains.

Since v0.8, current producers should also emit `listening_context` from `references/listening-context.schema.json`. Keep four things structurally distinct: **covenant** (what is permitted), **position** (where and in what relation this listener listens), **apparatus** (what can be sensed), and **claims** (what the evidence supports). The context also declares apertures, auditory scales, actual sources of listening, attributed participants, action authority, honest absences, and revision lineage. Capabilities never grant action authority. Multiple participants remain separately attributable; disagreement is retained by the host or memory layer instead of synthesized into fictional consensus.

## Presets And Budget

A caller may name a preset (from `presets/presets.json`) or a budget (`light`, `standard`, `deep`) in the request; expanded routing plans carry them back as `preset_id` and `budget`.

- Honor a named preset's mode chain and cost tier as the starting route.
- `light` keeps the shortest viable chain (primary + one corrective) and prefers cheap perception passes; `standard` follows the command's typical chain; `deep` authorizes every relevant mode and pass.
- Risk always overrides budget and preset: a forensic, consent-sensitive, or identity-sensitive object keeps its corrective mode even under `light`, and the router may add a corrective the preset lacks. Say so in the plan when it happens.
- A preset's `memory_policy` bounds memory use: never consult or write a store beyond it.

## Command Permission Overrides

Some commands modify claim permissions AFTER the Evidence Ladder (also published in `akouo.manifest.json` under `command_permission_overrides`):

| Command | Override | Reason |
|---|---|---|
| `/forensic` | `interpreted_allowed: false`, `speculative_allowed: false` | Strict evidentiary route: paralinguistic and interpretive speculation is suppressed; emotion, age, gender, and identity guesses demote to `undetermined`. |
| `/fiction` | `speculative_allowed: true` | Declared fiction grants speculative permission by user intent; evidence categories keep their ladder limits. |

## Substrate Awareness

Routing plans and mode outputs should declare the listening apparatus (`apparatus` block in the v0.6 listening output): substrate family, perception sources, and known blind spots. Derive forbidden claims from the declared substrate instead of discovering them after the fact:

- mono input: no stereo-image, panning, or spatial-width claims
- known sample rate: no claims about content above the Nyquist bound; low bandwidth models cannot verify high-frequency content
- model perception only (captions, events, transcripts): `measured` stays empty; model output is machine-heard evidence, not measurement
- text-only agent: no `heard` claims about audio it never received
- unknown capture chain: transduction caution before source claims

Each substrate family carries its own epistemic stance — an ASR cascade reduces listening to transcription, a codec-token model to token prediction, a speech-native model to streaming co-presence, a DSP toolchain to measurement. Name the stance rather than letting it pass as neutral hearing.

## Causal Confidence

Causal listening varies by situation, and routing should cap confidence accordingly: when the cause is identified and visible, source claims may run normally; when the cause is identified only by context, source claims lean on `inferred` with the context named; when the sound is unidentified and acousmatic, the sound is the sole information source and cause claims stay at low confidence or in `undetermined`. Causal vagueness between these situations is information, not failure — do not overestimate what analysis of sound alone can settle, and route ambiguous-source material through the perceptual ear before any identification.

## Evidence Ladder And Claim Permissions

When producing an expanded routing plan (`references/routing-plan.schema.json`), derive `claim_permissions` from `evidence_level`. The ladder runs from weakest to strongest evidence:

| `evidence_level` | `heard` | `measured` | `inferred` | `interpreted` | `speculative` |
|---|---|---|---|---|---|
| `none` | no | no | no | no | only if requested |
| `prompt_only` | prompt content only | no | from prompt logic only | yes, marked as reading of a description | only if requested |
| `metadata_only` | no | metadata facts only | from metadata only | cautiously | only if requested |
| `decoded_audio_metadata` | yes, if audio was actually decoded and described | duration, sample rate, channels, basic amplitude only | yes | yes | only if requested |
| `measured_signal` | yes | yes, within the limits of the tool used | yes | yes | only if requested |
| `transcript_or_caption` | text content only, never vocal sound | no | segmentation and format inferences only | yes, marked as text-based | only if requested |
| `contextual_note` | described content only | no | yes, from stated context | yes | only if requested |
| `mixed` | per component | per component | per component | yes | only if requested |

`must_include_undetermined` is `true` at every level. Speculative permission is granted by user intent (declared fiction, worldbuilding, `/fiction`), never by evidence level. When components conflict in `mixed` input, apply the weakest applicable permission to each individual claim, not the strongest.

## Route Confidence

Expanded routing plans carry `route_confidence`. Set it honestly:

- `high`: input type, user intent, and conceptual frame all point to the same primary mode.
- `medium`: the primary mode is clear but the secondary or corrective choice depends on missing context.
- `low`: intent is ambiguous, evidence is thin, or two frames compete; choose the more conservative primary mode, name the competing route in `route_reasoning` for router output or in `mode_chain[].reason` / `agent_handoff.summary` for expanded routing plans, and add a stop condition requesting the missing context.
- `undetermined`: the input cannot be routed responsibly; recommend `/route` with stop conditions or ask for the object, input type, or intent before any listening mode runs.

Low confidence is information, not failure. A conservative route with explicit stop conditions is worth more to a receiving agent than a confident route built on guesses.

## Reference Routing Heuristic

When judgment alone does not settle a route, apply this transparent additive score (ported from the AKOÚŌ reference app). Each matching signal adds its weight to a mode. Judgment by evidence, risk, and frame always overrides the arithmetic; the score is a tiebreaker and a consistency check, not the router.

### Input-type signals

| Input type | Mode hints (weight) |
|---|---|
| `audio_file`, `spectrogram`, `waveform`, `metadata` | signal-inspection (5); plus acoulogical-object (3) for `audio_file`; metadata also adds transductive-media (4) |
| `video` | audiovisual-scenic (6) |
| `transcript` | voice-speech (5), forensic-archival (5) |
| `field_note` | ecological-posthuman (5) |
| `archive_note` | forensic-archival (5) |
| `dataset_description`, `model_output` | transductive-media (4) |
| `sound_prompt`, `mixed`, `unknown`, `other` | acoulogical-object (3) |

### Keyword-family signals

| Family (examples) | Mode (weight) |
|---|---|
| waveform, spectrogram, LUFS, RMS, clipping, codec, phase, sample rate | signal-inspection (3) |
| texture, timbre, grain, foley, acousmatic, ambiguous source | acoulogical-object (3) |
| music, beat, rhythm, tempo, melody, harmony, pitch, loop, sound design | musical-aesthetic (5) |
| body, pressure, vibration, fatigue, dread, ASMR, club, alarm, haptic | embodied-affective (4) |
| sensor, sonification, microphone, compression, dataset, AI audio, ASR, TTS, platform | transductive-media (4) |
| archive, testimony, evidence, violence, surveillance, protest, witness, legal, custody | forensic-archival (5) |
| field recording, forest, river, weather, animal, habitat, soundscape, soundwalk, acoustemology | ecological-posthuman (4) |
| platform, market, labor, race, gender, class, colonial, police, consent, extraction | critical-political (4) |
| fiction, myth, ritual, dream, alien, ghost, worldbuilding, hauntology | symbolic-fictional (5) |
| video, film, game, scene, screen, subtitle, caption, diegetic, UI sound | audiovisual-scenic (5) |
| voice, speech, speaker, accent, transcript, prosody, diarization, podcast, dubbing | voice-speech (5) |
| accessibility, caption, deaf, hard of hearing, haptic, assistive, audism, intelligibility | accessibility-normative (5) |
| material, flux, vibration, resonance, feedback, rumble, infrasound, loudspeaker, installation | material-event (4) |
| memory, remember, recall, lineage, recurrence, heard before, earlier recording, akousma, akousmata, our archive, sound archive of ours, previous version, series over time | memory-lineage (5) |

### Command priors

When the user has already chosen a command, boost its anchor modes: `/tech` → signal-inspection (8), transductive-media (6); `/forensic` → forensic-archival (8), signal-inspection (6), critical-political (5); `/fiction` → symbolic-fictional (8), embodied-affective (4); `/transduce` → transductive-media (8); `/voice` → voice-speech (8); `/audiovision` → audiovisual-scenic (8); `/access` → accessibility-normative (8); `/field` → ecological-posthuman (8), material-event (4); `/study` and `/method` → acoulogical-object (5), critical-political (5); `/method` also → accessibility-normative (4); `/litany` → critical-political (6), audiovisual-scenic (5); `/remember` → memory-lineage (8), acoulogical-object (4).

### Evidence boosts

- Decoded audio or measured signal data is available: signal-inspection +3.
- Uploaded audio with an unknown capture chain: transductive-media +1.
- Stored sound-memory records were supplied or a store is declared available: memory-lineage +2.
- No prompt and no audio at all: acoulogical-object +1 as a minimal-caution default.

### Selection rules

1. Primary = highest-scoring mode; with no positive score, default to `acoulogical-object-listening`.
2. Secondary = next-highest distinct mode. Fallbacks when nothing else scores: signal-inspection → transductive-media; audiovisual-scenic → acoulogical-object; voice-speech → transductive-media; accessibility-normative → voice-speech; material-event → signal-inspection; ecological-posthuman → transductive-media; forensic-archival → signal-inspection; symbolic-fictional → embodied-affective; musical-aesthetic → acoulogical-object; memory-lineage → acoulogical-object; otherwise signal-inspection.
3. Corrective = highest-scoring mode from the corrective set — critical-political, signal-inspection, transductive-media, accessibility-normative, forensic-archival, acoulogical-object — that is not already primary or secondary. Default corrective: `critical-political-listening`. Memory-lineage is never corrective: memory must not police present listening.
4. Map score margins to `route_confidence`: clear leader (top ≥ 6 and at least 4 ahead) → high; leader by 2 or more → medium; tied or barely positive → low; no usable input → undetermined.
5. Memory-lineage runs only when the host supplies stored records or declares a store; otherwise demote it to `deferred` in the mode chain with a stop condition requesting store access.

## Input Assumptions

The router may receive:

- an audio file or file metadata
- a text prompt describing a sound
- a transcript or caption
- a field note, archive note, or dataset description
- a spectrogram, waveform, image, video, caption, subtitle, or interface description
- a machine-listening output, ASR transcript, classifier label, neural-codec description, or AI audio output
- user intent, research question, or desired command

The router must identify what kind of input is actually available before recommending modes. It must not pretend that a text prompt provides the same evidence as a measured audio file.

## Listening Procedure

1. Identify the object being listened to.
2. Identify the input type and available evidence.
3. Identify the user's likely intent or research task.
4. Identify conceptual frame: signal inspection, acoulogical object, musical/aesthetic organization, affect/body, voice/speech, audiovisual scene, accessibility/hearing norm, material event, transduction/media, forensic/archive, ecology/place, politics/power, or symbolic fiction.
5. Identify risk level: forensic, legal, political, colonial, identity, accessibility, surveillance, personal, sensitive, speculative, technical, or low-risk exploratory.
6. Decide the primary ear: the mode most suited to the task.
7. Decide the secondary ear: the mode that adds a necessary adjacent perspective.
8. Decide the corrective ear: the mode that prevents false certainty, aesthetic overreach, source confusion, cultural flattening, mediation erasure, or technical confusion.
9. State what cannot be known from the available input.
10. Recommend whether to run `/listen`, `/full-ear`, `/forensic`, `/tech`, `/fiction`, `/study`, `/transduce`, `/litany`, `/reference`, `/voice`, `/audiovision`, `/access`, `/field`, `/method`, `/route`, `/remember`, or `/one-sound-many-ears`.

## Output Structure

Return a router output with:

- `object_listened_to`
- `input_type`
- `user_intent`
- `available_evidence`
- `unavailable_evidence`
- `primary_mode`
- `secondary_mode`
- `corrective_mode`
- `route_reasoning`
- `risks`
- `must_not_assume`
- `recommended_command`
- `recommended_next_mode`

The router should also preserve the shared claim taxonomy when it makes claims:

- `heard`
- `measured`
- `inferred`
- `interpreted`
- `speculative`
- `undetermined`

> **Note to LLMs/Agents:** You MUST strictly follow the JSON schema provided in `references/router-output.schema.json`. Router output does not include `listening_claims`; use `available_evidence`, `unavailable_evidence`, `risks`, and `must_not_assume` to preserve the same epistemic discipline before any listening mode runs. When another app or agent needs an expanded handoff, use `references/routing-plan.schema.json` as the route-plan contract. Since v0.6 routing plans may also carry `budget` (`light`/`standard`/`deep`) and `preset_id` so receiving agents can reproduce the configuration; include them whenever the caller named them.

## Guardrails

- Do not analyze the sound as if the router were a full listening mode.
- Do not treat text descriptions, transcripts, and audio files as equivalent evidence.
- Do not route every prompt to the most poetic or theoretical mode.
- Do not route every audio file to technical analysis only.
- Do not ignore risk: evidence, testimony, surveillance, political violence, voice data, and archives require caution.
- Do not collapse the sound into source identification.
- Do not recommend a single mode when a corrective mode is needed.
- Do not conflate soundscape, acoustemology, and aurality; route ecology, situated knowledge, and historical listening regimes differently.
- Do not conflate machine listening, voice agents, ASR, neural codecs, and generative audio.
- Do not conflate voice, speech, transcript, identity, emotion, consent, and ASR output.
- Do not conflate audiovisual synchronization with real-world causality.
- Do not assume a normal hearing listener, complete caption access, or universal intelligibility.
- Do not treat material vibration, resonance, or process as measured fact without measurement.
- Do not route declared fiction to forensic certainty, or forensic evidence to symbolic speculation.
- Do not place cultural theory or affective readings in `inferred`. `inferred` is strictly for logical, forensic deduction. All theory, culture, and context belong in `interpreted`.

## Recommended Next Modes

Choose from:

- `signal-inspection-listening` for file, waveform, spectrogram, metadata, clipping, loudness, frequency, noise, or technical uncertainty
- `acoulogical-object-listening` for perceptual sound description before source or meaning claims
- `embodied-affective-listening` for pressure, mood, fatigue, pleasure, dread, propulsion, alarms, bass, drone, ASMR, or bodily force
- `transductive-media-listening` for sensors, microphones, codecs, compression, AI audio, ASR, machine listening, datasets, sonification, neural codecs, or model mediation
- `forensic-archival-listening` for evidence, testimony, archive, damage, authentication, protest recordings, or legal stakes
- `ecological-posthuman-listening` for field recording, more-than-human relations, habitat, weather, animals, acoustic ecology, acoustemology, hydrophones, contact mics, or soundwalks
- `critical-political-listening` for platform, labor, race, class, gender, coloniality, surveillance, market, policing, acoustic justice, accessibility, extraction, or infrastructure stakes
- `musical-aesthetic-listening` for music, rhythm, pulse, meter, tempo, pitch, interval, harmony, melody, contour, timbre, texture, form, production aesthetics, sound-design utility, poetic usefulness, and genre/cultural caution
- `symbolic-fictional-listening` for sonic fiction, myth, ritual, dream, alien voice, hauntology, hallucination-as-glitch, speculative worlds, and declared imaginative readings
- `audiovisual-scenic-listening` for video, film, games, UI sound, captions, subtitles, synchronization, offscreen sound, diegesis, audiovisual phrasing, or sound-image-text-scene relations
- `voice-speech-listening` for spoken sound, transcripts, ASR, TTS, voice agents, voice cloning, diarization, podcasts, radio, prosody, intelligibility, identity caution, or consent
- `accessibility-normative-listening` for captions, transcripts, haptics, deaf or hard-of-hearing access, assistive technology, sensory variation, fatigue, masking, alerts, or implied listener assumptions
- `material-event-listening` for vibration, resonance, feedback, duration, flux, rumble, low frequencies, installation sound, propagation, loudspeakers, room coupling, or sonic process
- `memory-lineage-listening` for stored sound-memories, akousma/akousmata records, recurrence, lineage, series over time, archive comparison, or registering a listening into a store

## Examples

### Distorted Protest Recording

- Primary: `forensic-archival-listening`
- Secondary: `critical-political-listening`
- Corrective: `signal-inspection-listening`
- Must not assume: exact location, speaker identities, sequence of events, or political meaning without context

### Sound Design Sample

- Primary: `musical-aesthetic-listening`
- Secondary: `acoulogical-object-listening`
- Corrective: `transductive-media-listening`
- Must not assume: real source, design intention, production chain, genre, or cultural tradition without evidence

### Music Fragment Or Beat Loop

- Primary: `musical-aesthetic-listening`
- Secondary: `signal-inspection-listening`
- Corrective: `critical-political-listening`
- Must not assume: exact tempo, tuning, instrument, genre, culture, geography, scene, or tradition without audio/metadata/contextual evidence

### Hydrophone Recording

- Primary: `ecological-posthuman-listening`
- Secondary: `transductive-media-listening`
- Corrective: `signal-inspection-listening`
- Must not assume: species identity, untouched nature, or direct access to an underwater world

### Fictional Sound Prompt

- Primary: `symbolic-fictional-listening`
- Secondary: `embodied-affective-listening`
- Corrective: `critical-political-listening`
- Must not assume: fictional imagery is evidence of real sonic content

### AI Voice Agent Demo

- Primary: `voice-speech-listening`
- Secondary: `transductive-media-listening`
- Corrective: `accessibility-normative-listening`
- Must not assume: ASR accuracy, speaker identity, voice-agent behavior, neural codec representation, consent, dataset provenance, disability, age, gender, ethnicity, or emotional truth without evidence

### Captioned Game Scene

- Primary: `audiovisual-scenic-listening`
- Secondary: `voice-speech-listening`
- Corrective: `accessibility-normative-listening`
- Must not assume: frame-accurate synchronization, source causality, caption accuracy, player hearing context, or interface intent without evidence

### Sonic Access Audit

- Primary: `accessibility-normative-listening`
- Secondary: `voice-speech-listening`
- Corrective: `critical-political-listening`
- Must not assume: normal hearing, adequate captions, universal intelligibility, assistive-technology behavior, or user comfort without testing

### Resonant Installation

- Primary: `material-event-listening`
- Secondary: `embodied-affective-listening`
- Corrective: `signal-inspection-listening`
- Must not assume: exact frequency, amplitude, tactile effect, room coupling, material composition, or listener response without measurement and context

### Recurring Harbor Recording With Store Access

- Primary: `memory-lineage-listening`
- Secondary: `acoulogical-object-listening`
- Corrective: `signal-inspection-listening`
- Must not assume: that store similarity proves same source or place, that absence from the store means a new sound, or that change across records reflects the site rather than the apparatus
