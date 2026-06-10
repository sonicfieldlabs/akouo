import { commandDefinitions } from './commands';
import { createRouteDraft, createRoutingPlan } from './router';
import {
  createClaim,
  createEmptyClaimTaxonomy,
  createListeningOutputDraft,
} from './outputFactory';
import { createReferenceClaimSummary, createReferenceMap, referenceSummary } from './referenceLayer';
import { commandNames, comparativeModeKeys, listeningModes } from './types';
import type {
  AudioInspection,
  ClaimTaxonomy,
  CommandName,
  CommandOutput,
  CommandResult,
  ComparativeListeningOutput,
  ListeningMode,
  ListeningOutput,
  ListeningRequest,
  ReferenceMap,
  RouterOutput,
  SkillId,
} from './types';

export function isCommandEnabled(command: CommandName): boolean {
  return commandNames.includes(command);
}

export function runListeningCommand(request: ListeningRequest): CommandResult {
  const command = request.command ?? '/listen';

  if (command === '/one-sound-many-ears') {
    return createComparativeOutput(request);
  }

  return createCommandOutput(command, request);
}

function createCommandOutput(command: Exclude<CommandName, '/one-sound-many-ears'>, request: ListeningRequest): CommandOutput {
  const routerOutput = createRouteDraft({ ...request, command });
  const routingPlan = command === '/route' || command === '/method' ? createRoutingPlan({ ...request, command }) : undefined;
  const modeChain = modesForCommand(command, routerOutput, request);
  const outputs = modeChain.map((mode) => createModeOutput(mode, request));
  const referenceMap = command === '/reference' || command === '/study' || command === '/method' ? createReferenceMap(request, outputs) : undefined;
  const claimSummary = outputs.length > 0
    ? summarizeClaims(outputs)
    : command === '/route'
      ? createRouteClaimSummary(request, routerOutput)
      : createReferenceClaimSummary(request, referenceMap);
  const risks = unique([
    ...routerOutput.risks,
    ...outputs.flatMap((output) => Object.values(output.risks).flat()),
    ...(referenceMap?.cautions ?? []),
  ]);
  const nextMode = referenceMap?.adjacent_modes[0] ?? outputs.at(-1)?.recommended_next_mode ?? routerOutput.recommended_next_mode;

  return {
    command,
    object_listened_to: objectNameForRequest(request),
    input_type: request.inputType,
    skills_called: skillsForCommand(command, modeChain),
    execution_order: executionOrderFor(command, modeChain),
    router_output: routerOutput,
    ...(routingPlan ? { routing_plan: routingPlan } : {}),
    outputs,
    synthesis: synthesize(command, outputs, request, referenceMap),
    claim_summary: claimSummary,
    ...(referenceMap ? { reference_map: referenceMap } : {}),
    risks,
    recommended_next_mode: nextMode,
  };
}

function createComparativeOutput(request: ListeningRequest): ComparativeListeningOutput {
  const outputs = listeningModes.map((mode) => createModeOutput(mode, request));
  const modeComparison = outputs.reduce<ComparativeListeningOutput['mode_comparison']>((comparison, output) => {
    comparison[comparativeModeKeys[output.listening_mode]] = output;
    return comparison;
  }, {} as ComparativeListeningOutput['mode_comparison']);

  return {
    command: '/one-sound-many-ears',
    sound_object: objectNameForRequest(request),
    input_type: request.inputType,
    mode_comparison: modeComparison,
    shared_claim_summary: summarizeClaims(outputs),
    contradictions: comparativeContradictions(request),
    productive_tensions: [
      'Signal inspection can limit source claims while acoulogical listening still describes the auditum.',
      'Musical-aesthetic listening can name rhythm, pitch, texture, and creative usefulness while critical-political listening prevents genre or cultural overreach.',
      'Voice-speech listening can separate vocal sound from transcript, identity, emotion, consent, and ASR output.',
      'Audiovisual-scenic listening can treat synchronization and captions as scene relations rather than direct proof.',
      'Accessibility-normative listening can correct reports that assume a single normal hearing listener.',
      'Material-event listening can shift from static sound object to vibration, duration, resonance, and process without abandoning evidence limits.',
      'Forensic caution may refuse narrative completion while symbolic-fictional listening can still generate declared speculation.',
      'Critical-political listening can correct ecological or affective readings that sound universal or innocent.',
    ],
    most_responsible_reading: 'The responsible reading is plural and partial: treat the sound as mediated, perceptual, embodied, accessible or inaccessible, material, scenic, and uncertain before making source, identity, cultural, evidentiary, or symbolic claims.',
    most_interesting_next_mode: nextModeForComparative(request),
  };
}

function modesForCommand(command: Exclude<CommandName, '/one-sound-many-ears'>, routerOutput: RouterOutput, request: ListeningRequest): ListeningMode[] {
  switch (command) {
    case '/listen':
      return unique([routerOutput.primary_mode, routerOutput.secondary_mode, routerOutput.corrective_mode]);
    case '/full-ear':
      return fullEarModes(routerOutput.primary_mode, request);
    case '/study':
      return unique(['acoulogical-object-listening', studyContextMode(request), 'critical-political-listening']);
    case '/tech':
      return ['signal-inspection-listening', 'transductive-media-listening'];
    case '/reference':
      return [];
    case '/litany':
      return ['critical-political-listening', 'transductive-media-listening', 'audiovisual-scenic-listening', 'acoulogical-object-listening'];
    case '/fiction':
      return fictionModes(request);
    case '/forensic':
      return ['signal-inspection-listening', 'forensic-archival-listening', 'critical-political-listening'];
    case '/transduce':
      return transduceModes(request);
    case '/voice':
      return voiceModes(request);
    case '/audiovision':
      return audiovisionModes(request);
    case '/access':
      return accessModes(request);
    case '/field':
      return fieldModes(request);
    case '/method':
      return methodModes(request);
    case '/route':
      return [];
  }
}

function fullEarModes(contextualMode: ListeningMode, request: ListeningRequest): ListeningMode[] {
  const modes: ListeningMode[] = [
    'signal-inspection-listening',
    'acoulogical-object-listening',
    'musical-aesthetic-listening',
    'embodied-affective-listening',
    'transductive-media-listening',
    'material-event-listening',
    contextualMode,
  ];

  if (requiresCriticalCorrective(request)) {
    modes.push('critical-political-listening');
  }

  return unique(modes);
}

function fictionModes(request: ListeningRequest): ListeningMode[] {
  const modes: ListeningMode[] = ['symbolic-fictional-listening', 'embodied-affective-listening'];

  if (hasAny(request, ['animal', 'forest', 'river', 'ocean', 'weather', 'cosmic', 'planet', 'nonhuman', 'ecology'])) {
    modes.push('ecological-posthuman-listening');
  }

  if (requiresCriticalCorrective(request)) {
    modes.push('critical-political-listening');
  }

  return unique(modes);
}

function transduceModes(request: ListeningRequest): ListeningMode[] {
  const modes: ListeningMode[] = ['transductive-media-listening', 'signal-inspection-listening'];

  if (hasAny(request, ['voice', 'speech', 'asr', 'tts', 'agent', 'clone', 'diarization'])) {
    modes.push('voice-speech-listening');
  }

  if (hasAny(request, ['caption', 'transcript', 'accessibility', 'deaf', 'haptic', 'assistive', 'intelligibility'])) {
    modes.push('accessibility-normative-listening');
  }

  if (requiresCriticalCorrective(request)) {
    modes.push('critical-political-listening');
  }

  return unique(modes);
}

function voiceModes(request: ListeningRequest): ListeningMode[] {
  const modes: ListeningMode[] = ['voice-speech-listening', 'transductive-media-listening', 'accessibility-normative-listening'];

  if (requiresCriticalCorrective(request)) {
    modes.push('critical-political-listening');
  }

  return unique(modes);
}

function audiovisionModes(request: ListeningRequest): ListeningMode[] {
  const modes: ListeningMode[] = ['audiovisual-scenic-listening', 'acoulogical-object-listening'];

  if (hasAny(request, ['voice', 'speech', 'subtitle', 'caption', 'dialogue'])) {
    modes.push('voice-speech-listening');
  }

  if (requiresCriticalCorrective(request) || hasAny(request, ['presence', 'immersion', 'authentic', 'vision', 'image'])) {
    modes.push('critical-political-listening');
  }

  return unique(modes);
}

function accessModes(request: ListeningRequest): ListeningMode[] {
  const modes: ListeningMode[] = ['accessibility-normative-listening'];

  if (hasAny(request, ['voice', 'speech', 'caption', 'transcript', 'subtitle', 'asr'])) {
    modes.push('voice-speech-listening');
  }

  if (hasAny(request, ['volume', 'loud', 'alarm', 'siren', 'fatigue', 'overload', 'haptic', 'bass'])) {
    modes.push('embodied-affective-listening');
  }

  modes.push('critical-political-listening');
  return unique(modes);
}

function fieldModes(request: ListeningRequest): ListeningMode[] {
  const modes: ListeningMode[] = ['ecological-posthuman-listening', 'transductive-media-listening', 'critical-political-listening'];

  if (hasAny(request, ['vibration', 'resonance', 'weather', 'infrastructure', 'drone', 'hum', 'duration', 'material'])) {
    modes.push('material-event-listening');
  }

  return unique(modes);
}

function methodModes(request: ListeningRequest): ListeningMode[] {
  return unique([
    'acoulogical-object-listening',
    studyContextMode(request),
    'critical-political-listening',
    'accessibility-normative-listening',
  ]);
}

function studyContextMode(request: ListeningRequest): ListeningMode {
  if (isMusicalRequest(request)) {
    return 'musical-aesthetic-listening';
  }

  if (hasAny(request, ['fiction', 'myth', 'ritual', 'dream', 'alien', 'ghost', 'cosmic', 'worldbuilding'])) {
    return 'symbolic-fictional-listening';
  }

  if (hasAny(request, ['video', 'film', 'game', 'scene', 'image', 'subtitle', 'caption'])) {
    return 'audiovisual-scenic-listening';
  }

  if (hasAny(request, ['voice', 'speech', 'asr', 'tts', 'speaker', 'transcript'])) {
    return 'voice-speech-listening';
  }

  return 'ecological-posthuman-listening';
}

function createModeOutput(mode: ListeningMode, request: ListeningRequest): ListeningOutput {
  const output = createListeningOutputDraft({
    objectListenedTo: objectNameForRequest(request),
    inputType: request.inputType,
    mode,
  });
  const prompt = request.prompt?.trim();
  const inspection = request.audioInspection;

  addSharedInputClaims(output, request);

  switch (mode) {
    case 'signal-inspection-listening':
      fillSignalInspection(output, inspection, prompt);
      break;
    case 'acoulogical-object-listening':
      fillAcoulogicalObject(output, prompt, inspection);
      break;
    case 'embodied-affective-listening':
      fillEmbodiedAffective(output, prompt);
      break;
    case 'transductive-media-listening':
      fillTransductiveMedia(output, request);
      break;
    case 'forensic-archival-listening':
      fillForensicArchival(output, request);
      break;
    case 'ecological-posthuman-listening':
      fillEcologicalPosthuman(output, prompt);
      break;
    case 'critical-political-listening':
      fillCriticalPolitical(output, prompt);
      break;
    case 'musical-aesthetic-listening':
      fillMusicalAesthetic(output, request);
      break;
    case 'symbolic-fictional-listening':
      fillSymbolicFictional(output, prompt);
      break;
    case 'audiovisual-scenic-listening':
      fillAudiovisualScenic(output, request);
      break;
    case 'voice-speech-listening':
      fillVoiceSpeech(output, request);
      break;
    case 'accessibility-normative-listening':
      fillAccessibilityNormative(output, request);
      break;
    case 'material-event-listening':
      fillMaterialEvent(output, request);
      break;
  }

  ensureBaselineLimits(output, request);
  return output;
}

function addSharedInputClaims(output: ListeningOutput, request: ListeningRequest) {
  if (request.prompt?.trim()) {
    output.listening_claims.heard.push(
      createClaim(`Prompt supplied: ${clip(request.prompt.trim())}`, 'high', 'User-provided text'),
    );
  }

  if (request.audioInspection) {
    output.listening_claims.heard.push(
      createClaim(`Audio file supplied: ${request.audioInspection.fileName}.`, 'high', 'Browser File input'),
    );
    output.what_appears.push('An audio file is available for basic browser-side inspection.');
  }

  if (!request.prompt?.trim() && !request.audioInspection) {
    output.listening_claims.undetermined.push(
      createClaim('No prompt or audio file has been supplied yet.', 'high', 'Empty request'),
    );
  }
}

function fillSignalInspection(output: ListeningOutput, inspection?: AudioInspection, prompt?: string) {
  output.what_appears.push('This mode can separate browser-measured file metadata from interpretation.');
  output.mediations.technical.push('Browser File API and Web Audio API are the current inspection boundary.');
  output.risks.source_confusion.push('File metadata cannot identify source, intention, place, or cultural meaning.');
  output.recommended_next_mode = 'acoulogical-object-listening';

  if (inspection) {
    output.listening_claims.measured.push(...inspection.measuredClaims);

    if (inspection.warnings.length > 0) {
      output.what_remains_hidden.push(...inspection.warnings);
    }

    output.listening_claims.undetermined.push(
      createClaim('Sample-accurate waveform review, full spectrogram rendering, true-peak metering, and certified loudness verification remain deferred; browser-side loudness, band-energy, onset, stereo, and clipping estimates carry the limits stated in their basis notes.', 'high'),
    );
    output.main_reading = 'The file is accepted; metadata, amplitude, BS.1770-style loudness, band energy, onset density, and stereo estimates are measured locally within browser limits, while certified metering remains deferred.';
    output.alternative_reading = 'If the browser cannot decode the file, the app still treats it as a supplied object but refuses signal-level claims.';
    return;
  }

  if (prompt) {
    output.listening_claims.undetermined.push(
      createClaim('No signal measurements are available from a text-only prompt.', 'undetermined', 'No audio file supplied'),
    );
    output.listening_claims.undetermined.push(
      createClaim('Duration, sample rate, channels, spectral profile, loudness, and clipping cannot be measured from prompt text.', 'high'),
    );
    output.main_reading = 'The prompt can guide listening, but signal inspection must remain empty until audio or measured data is supplied.';
    output.alternative_reading = 'A future signal backend could convert uploaded audio into waveform, spectrogram, loudness, and artifact claims.';
    return;
  }

  output.main_reading = 'No measurable object has been supplied.';
  output.alternative_reading = 'Add an audio file to activate browser-side metadata inspection.';
}

function fillAcoulogicalObject(output: ListeningOutput, prompt?: string, inspection?: AudioInspection) {
  output.mediations.cultural.push('Perceptual description is shaped by language, listening training, and available description.');
  output.risks.over_identification.push('The apparent source must stay separate from the heard object.');
  output.recommended_next_mode = 'signal-inspection-listening';

  if (prompt) {
    output.what_appears.push('A described auditum can be approached before source certainty.');
    output.listening_claims.inferred.push(
      createClaim('The prompt offers perceptual anchors, but they remain descriptions rather than verified acoustic traits.', 'medium'),
    );
    output.listening_claims.interpreted.push(
      createClaim('The first responsible pass is to treat the sound as a perceptual object before assigning cause or meaning.', 'high'),
    );
    output.main_reading = 'The sound should first be heard as a shaped object: texture, movement, density, rhythm, space, and contour before source identification.';
    output.alternative_reading = 'The same prompt could instead be routed toward fiction, evidence, ecology, or transduction depending on the user goal.';
    return;
  }

  if (inspection) {
    output.what_appears.push('An audio object is present, but the app has not produced perceptual feature extraction.');
    output.listening_claims.undetermined.push(
      createClaim('Timbre, grain, texture, movement, rhythm, spatial image, and perceived source are not described without a listening model or user notes.', 'high'),
    );
    output.main_reading = 'The object is available, but acoulogical description needs either human notes or a future audio captioning/listening backend.';
    output.alternative_reading = 'For now, the app can pair file metadata with user-provided perceptual notes.';
    return;
  }

  output.main_reading = 'No perceptual object has been supplied yet.';
  output.alternative_reading = 'Add a sound prompt or audio file to begin acoulogical listening.';
}

function fillEmbodiedAffective(output: ListeningOutput, prompt?: string) {
  output.mediations.bodily.push('Embodied effects depend on volume, playback system, room, hearing ability, fatigue, memory, and expectation.');
  output.risks.aesthetic_overstatement.push('Do not universalize affective response from limited input.');
  output.recommended_next_mode = 'signal-inspection-listening';

  if (prompt) {
    output.what_appears.push('The prompt can indicate possible pressure, pace, intensity, or atmosphere.');
    output.listening_claims.inferred.push(
      createClaim('Possible bodily force can be inferred only from the description, not confirmed as listener response.', 'low'),
    );
    output.listening_claims.interpreted.push(
      createClaim('Affective reading should remain conditional until playback and listener context are known.', 'high'),
    );
    output.main_reading = 'The sound can be read for possible bodily orientation, but affect remains conditional rather than universal.';
    output.alternative_reading = 'Measured loudness, frequency, repetition, and room data could later strengthen or correct this body reading.';
    return;
  }

  output.listening_claims.undetermined.push(
    createClaim('Volume, playback system, room, listener body, and affective response are unknown.', 'high'),
  );
  output.main_reading = 'Embodied claims remain undetermined without prompt, listening notes, or playback context.';
  output.alternative_reading = 'A future workflow could collect listener notes alongside technical loudness and spectral data.';
}

function fillTransductiveMedia(output: ListeningOutput, request: ListeningRequest) {
  output.what_appears.push('The sound reaches the app through an explicit mediation chain.');
  output.mediations.computational.push('The app structures claims locally in the browser and does not require a model provider.');
  output.risks.hallucination.push('Unknown capture chains, codecs, platforms, datasets, or models must not be invented.');
  output.recommended_next_mode = 'critical-political-listening';

  if (request.audioInspection) {
    output.mediations.technical.push('The uploaded file is mediated by its container, MIME type, browser decoding, and any unknown recording chain.');
    output.listening_claims.inferred.push(
      createClaim('The supplied file is a mediated trace rather than direct access to the original acoustic event.', 'high'),
    );
  }

  if (request.prompt?.trim()) {
    output.mediations.computational.push('Prompted sound is mediated by language and by the app taxonomy before any acoustic measurement exists.');
    output.listening_claims.interpreted.push(
      createClaim('The prompt functions as a sonic premise, not as verified recorded sound.', 'high'),
    );
  }

  output.listening_claims.undetermined.push(
    createClaim('Microphone, sensor, codec history, editing chain, platform compression, and dataset/model provenance are unknown unless supplied.', 'high'),
  );
  output.main_reading = 'The central fact is mediation: the app can organize what is known, but the capture and conversion chain remains partly hidden.';
  output.alternative_reading = 'Supplying device notes, platform context, or model provenance would shift this from general mediation caution to a specific transductive map.';
}

function fillForensicArchival(output: ListeningOutput, request: ListeningRequest) {
  output.risks.forensic_overreach.push('Evidence claims require restraint and corroboration.');
  output.mediations.archival.push('Archive, custody, editing, restoration, and upload context are unknown unless provided.');
  output.recommended_next_mode = 'signal-inspection-listening';
  output.what_remains_hidden.push('Forensic mode intentionally leaves speculative claims empty.');
  output.listening_claims.undetermined.push(
    createClaim('Identity, event sequence, location, source, intent, authenticity, and chain of custody are undetermined.', 'high'),
  );

  if (request.audioInspection) {
    output.listening_claims.measured.push(...request.audioInspection.measuredClaims);
  }

  output.main_reading = 'The object may be treated as a trace only within strict limits; forensic mode refuses evidentiary narrative completion.';
  output.alternative_reading = 'A fuller forensic workflow would require original files, metadata, provenance, and corroborating context.';
}

function fillEcologicalPosthuman(output: ListeningOutput, prompt?: string) {
  output.mediations.spatial.push('Place, habitat, sensor position, season, and distance remain conditioning factors.');
  output.risks.over_identification.push('Species, habitat, and environmental cause cannot be identified without evidence.');
  output.recommended_next_mode = 'transductive-media-listening';

  if (prompt) {
    output.listening_claims.interpreted.push(
      createClaim('The prompt can be read for relations among human, nonhuman, technical, and environmental layers.', 'medium'),
    );
  }

  output.listening_claims.undetermined.push(
    createClaim('Species, site, season, weather, microphone position, and ecological condition are unknown unless supplied.', 'high'),
  );
  output.main_reading = 'Ecological listening should ask what relations are staged or recorded without romanticizing nature as pure presence.';
  output.alternative_reading = 'A field note with place, season, recorder, and habitat context would make this mode more precise.';
}

function fillCriticalPolitical(output: ListeningOutput, prompt?: string) {
  output.mediations.cultural.push('Listening frames may involve race, gender, class, coloniality, labor, platform, market, access, or institutional context.');
  output.risks.cultural_flattening.push('Critique must name concrete mediations rather than generic accusation.');
  output.recommended_next_mode = 'transductive-media-listening';

  if (prompt) {
    output.listening_claims.interpreted.push(
      createClaim('The prompt should be checked for what it centers, erases, normalizes, or turns into aesthetic material.', 'medium'),
    );
  }

  output.listening_claims.undetermined.push(
    createClaim('Specific cultural, institutional, labor, dataset, or political stakes are unknown unless context is supplied.', 'high'),
  );
  output.main_reading = 'The corrective task is to prevent the listening report from sounding neutral when mediation, access, or power may be involved.';
  output.alternative_reading = 'If no concrete political mediation is present, this mode should stay cautious instead of accusing by default.';
}

function fillMusicalAesthetic(output: ListeningOutput, request: ListeningRequest) {
  const prompt = request.prompt?.trim();
  output.mediations.cultural.push('Musical description is shaped by listening training, genre language, platform context, and cultural assumptions.');
  output.risks.cultural_flattening.push('Do not infer genre, tradition, geography, ethnicity, sacredness, or scene from thin musical cues.');
  output.risks.aesthetic_overstatement.push('Aesthetic or poetic language must remain grounded in musical and sonic traits.');
  output.recommended_next_mode = request.audioInspection ? 'signal-inspection-listening' : 'acoulogical-object-listening';

  if (prompt) {
    output.what_appears.push('The prompt can be analyzed for described musical organization, texture, and aesthetic function.');
    output.listening_claims.inferred.push(
      createClaim('The supplied description may indicate musical relations such as rhythm, pitch, timbre, texture, or form, but these remain prompt-based until heard or measured.', 'medium', 'Prompt text rather than verified audio'),
    );
    output.listening_claims.interpreted.push(
      createClaim('Aesthetic force should be described through grounded traits such as density, motion, repetition, tension, release, brightness, roughness, or spatial image.', 'medium', 'Musical-aesthetic listening frame'),
    );
  }

  if (request.audioInspection) {
    output.what_appears.push('An audio file is available, but this local prototype only exposes basic metadata unless a direct model runner or signal backend is used.');
    output.listening_claims.measured.push(...request.audioInspection.measuredClaims);
  }

  output.listening_claims.undetermined.push(
    createClaim('Exact BPM, tuning, key, interval, instrument, source, production chain, genre, cultural context, and listener response remain undetermined unless supplied by audio, metadata, or context.', 'high', 'Missing musical evidence or context'),
  );
  output.main_reading = 'The musical-aesthetic ear should name rhythm, pitch, timbre, texture, form, and creative usefulness while keeping genre, culture, and poetic meaning cautious.';
  output.alternative_reading = 'A signal pass could test tempo, tuning, loudness, and spectral claims; a critical pass could audit genre and cultural assumptions.';
}

function fillSymbolicFictional(output: ListeningOutput, prompt?: string) {
  output.risks.hallucination.push('Speculation must stay inside the speculative category.');
  output.recommended_next_mode = 'acoulogical-object-listening';

  if (prompt) {
    output.what_appears.push('The prompt can be treated as a sonic premise for declared fiction or symbolic reading.');
    output.listening_claims.speculative.push(
      createClaim('A possible sonic world can be imagined from the prompt, but it is not evidence of real audio.', 'high'),
    );
    output.listening_claims.interpreted.push(
      createClaim('The prompt may imply atmosphere, agents, setting, or ritual force depending on its language.', 'medium'),
    );
    output.main_reading = 'The fictional ear may generate a possible world, but that world remains explicitly marked as speculation.';
    output.alternative_reading = 'A non-fictional pass should route first through acoulogical and signal modes.';
    return;
  }

  output.listening_claims.undetermined.push(
    createClaim('No symbolic or fictional premise is available without a prompt, title, narrative, or user instruction.', 'high'),
  );
  output.main_reading = 'Speculative reading is available, but no fiction should be invented from an empty input.';
  output.alternative_reading = 'Add a sound prompt or choose /listen to let the router decide whether fiction is appropriate.';
}

function fillAudiovisualScenic(output: ListeningOutput, request: ListeningRequest) {
  const prompt = request.prompt?.trim();
  output.mediations.cultural.push('Sound-image relations are shaped by editing, framing, subtitles, interface conventions, and viewing context.');
  output.mediations.technical.push('Audiovisual claims require access to both audio and visual evidence or a supplied scene description.');
  output.risks.source_confusion.push('Synchronization can imply a source without proving real-world causality.');
  output.risks.aesthetic_overstatement.push('Do not claim sound is inherently more embodied, immersive, authentic, or present than image.');
  output.recommended_next_mode = hasAny(request, ['voice', 'speech', 'caption', 'subtitle']) ? 'voice-speech-listening' : 'acoulogical-object-listening';

  if (prompt) {
    output.what_appears.push('The prompt can be read for sound-image-scene relations if it describes visual or interface context.');
    output.listening_claims.interpreted.push(
      createClaim('Any sound-image relation should be treated as a scene relation, not as transparent proof of source or intention.', 'high', 'Audiovisual-scenic listening frame'),
    );
  }

  if (request.inputType !== 'video' && !hasAny(request, ['video', 'film', 'game', 'scene', 'image', 'screen', 'subtitle', 'caption'])) {
    output.listening_claims.undetermined.push(
      createClaim('Visual content, edit timing, subtitles, captions, and sound-image synchronization are unavailable from the current input.', 'high', 'No audiovisual evidence supplied'),
    );
  }

  output.listening_claims.undetermined.push(
    createClaim('Frame-accurate timing, mix, visual content, caption accuracy, production chain, and playback context remain undetermined unless supplied.', 'high', 'Missing audiovisual context'),
  );
  output.main_reading = 'The audiovisual ear asks how sound, image, text, interface, and time co-produce the scene while preserving evidence limits.';
  output.alternative_reading = 'A litany pass can audit sound-versus-vision claims; an acoulogical pass can reground the sound object itself.';
}

function fillVoiceSpeech(output: ListeningOutput, request: ListeningRequest) {
  const prompt = request.prompt?.trim();
  output.mediations.bodily.push('Voice emerges through breath, body, habit, technique, microphone position, and playback conditions.');
  output.mediations.computational.push('ASR, diarization, TTS, and voice agents represent or generate speech without preserving the whole voice.');
  output.risks.over_identification.push('Voice must not be used to infer identity, age, gender, ethnicity, disability, emotion, sincerity, or consent without evidence.');
  output.recommended_next_mode = hasAny(request, ['asr', 'tts', 'agent', 'clone', 'model']) ? 'transductive-media-listening' : 'accessibility-normative-listening';

  if (prompt) {
    output.what_appears.push('The supplied text can indicate voice, speech, transcript, or interface stakes.');
    output.listening_claims.interpreted.push(
      createClaim('Voice analysis should separate vocal sound, linguistic content, transcript, model output, and identity claims.', 'high', 'Voice-speech listening frame'),
    );
  }

  if (request.inputType === 'transcript') {
    output.listening_claims.heard.push(
      createClaim('A transcript is available as text evidence, not as complete vocal evidence.', 'high', 'Transcript input type'),
    );
  }

  output.listening_claims.undetermined.push(
    createClaim('Speaker identity, consent, vocal timbre, prosody, accent, emotion, body, recording chain, transcript accuracy, and diarization reliability remain unknown unless supplied.', 'high', 'Missing voice and provenance evidence'),
  );
  output.main_reading = 'The voice-speech ear treats voice as sound, speech, body, interface, trace, and data without converting it into identity or emotional truth.';
  output.alternative_reading = 'A forensic pass is required for testimony or legal stakes; a transductive pass is required for ASR, TTS, cloning, or voice-agent architecture.';
}

function fillAccessibilityNormative(output: ListeningOutput, request: ListeningRequest) {
  const prompt = request.prompt?.trim();
  output.mediations.bodily.push('Access depends on hearing variation, attention, fatigue, trauma, neurodivergence, assistive technology, device, and environment.');
  output.mediations.cultural.push('The report must identify the implied listener instead of assuming a default normal hearing subject.');
  output.risks.cultural_flattening.push('Accessibility should not be reduced to captions only or treated as an afterthought.');
  output.risks.aesthetic_overstatement.push('Do not universalize immersion, clarity, intelligibility, or comfort.');
  output.recommended_next_mode = hasAny(request, ['voice', 'speech', 'caption', 'transcript', 'subtitle']) ? 'voice-speech-listening' : 'critical-political-listening';

  if (prompt) {
    output.what_appears.push('The prompt can be audited for implied listener, access path, caption/transcript path, and sensory assumptions.');
    output.listening_claims.interpreted.push(
      createClaim('The sonic workflow should provide alternate pathways where sound carries critical information.', 'high', 'Accessibility-normative listening frame'),
    );
  }

  output.listening_claims.undetermined.push(
    createClaim('User testing, assistive technology behavior, caption quality, transcript completeness, visual alternatives, haptic alternatives, volume safety, and environmental masking remain unknown unless supplied.', 'high', 'Missing access evidence'),
  );
  output.main_reading = 'The accessibility ear asks who the system expects to hear, how non-audio access is provided, and which bodies or environments are excluded.';
  output.alternative_reading = 'A voice pass can audit speech and transcripts; a signal or embodied pass can assess loudness, masking, fatigue, and overload when data exists.';
}

function fillMaterialEvent(output: ListeningOutput, request: ListeningRequest) {
  const prompt = request.prompt?.trim();
  output.mediations.spatial.push('Material sound depends on propagation, surfaces, room coupling, distance, loudspeakers, air, water, bodies, or other media.');
  output.mediations.technical.push('Material-event claims often require signal, playback, device, and spatial evidence.');
  output.risks.hallucination.push('Do not turn vibration, resonance, or flux into measured fact without measurements.');
  output.recommended_next_mode = request.audioInspection ? 'signal-inspection-listening' : 'embodied-affective-listening';

  if (prompt) {
    output.what_appears.push('The prompt can be read for duration, resonance, vibration, feedback, material supports, and event behavior.');
    output.listening_claims.interpreted.push(
      createClaim('The sound can be approached as an event unfolding through materials, bodies, devices, and time.', 'medium', 'Material-event listening frame'),
    );
  }

  if (request.audioInspection) {
    output.listening_claims.measured.push(...request.audioInspection.measuredClaims);
  }

  output.listening_claims.undetermined.push(
    createClaim('Exact frequency, amplitude, spectral profile, material composition, room dimensions, speaker position, tactile effect, source chain, and listener body remain unknown unless supplied.', 'high', 'Missing material and signal evidence'),
  );
  output.main_reading = 'The material-event ear shifts from static sound object to vibration, duration, propagation, resonance, pressure, and process while keeping measurement limits visible.';
  output.alternative_reading = 'A signal pass can test extensive traits; an embodied pass can test bodily force only when playback and listener context are known.';
}

function ensureBaselineLimits(output: ListeningOutput, request: ListeningRequest) {
  output.what_remains_hidden.push('Exact source, intention, listener experience, and full recording context remain limited unless supplied.');

  if (!request.audioInspection) {
    output.mediations.technical.push('No uploaded audio file is available for browser-side inspection.');
  }

  if (!output.main_reading) {
    output.main_reading = 'The mode has no responsible reading until more input is supplied.';
  }

  if (!output.alternative_reading) {
    output.alternative_reading = 'A different ear may become more appropriate after prompt, file, metadata, or context is added.';
  }
}

// Modes share input claims (prompt, file), so the summary dedupes by
// category + statement to keep the merged taxonomy readable.
function summarizeClaims(outputs: ListeningOutput[]): ClaimTaxonomy {
  const summary = createEmptyClaimTaxonomy();
  const seen = new Set<string>();

  for (const output of outputs) {
    for (const category of Object.keys(summary) as Array<keyof ClaimTaxonomy>) {
      for (const claim of output.listening_claims[category]) {
        const key = `${category}::${claim.statement}`;
        if (seen.has(key)) continue;
        seen.add(key);
        summary[category].push(claim);
      }
    }
  }

  return summary;
}

function executionOrderFor(command: CommandName, modes: ListeningMode[]): string[] {
  if (command === '/one-sound-many-ears') {
    return ['Run all listening modes', 'Compare contradictions', 'Name productive tensions', 'Recommend the next ear'];
  }

  if (command === '/listen') {
    return ['Run akouo-router', ...modes.map((mode) => `Run ${mode}`), 'Synthesize routed listening report'];
  }

  if (command === '/full-ear') {
    return ['Run akouo-router', ...modes.map((mode) => `Run ${mode}`), 'Synthesize full-ear listening report'];
  }

  const definition = commandDefinitions.find((item) => item.name === command);
  const order = definition?.executionOrder ?? modes.map((mode) => `Run ${mode}`);
  const startsWithRouter = /\bakouo-router\b|\brouter\b/i.test(order[0] ?? '');
  return startsWithRouter ? order : ['Run akouo-router', ...order];
}

// Every non-comparative command runs a router planning pass and embeds its
// router_output, so akouo-router must always appear in skills_called.
function skillsForCommand(command: CommandName, modes: ListeningMode[]): SkillId[] {
  if (command === '/one-sound-many-ears') {
    return [...listeningModes];
  }

  if (command === '/reference' || command === '/study' || command === '/method') {
    return unique(['akouo-router', ...modes, 'reference-layer']);
  }

  return unique(['akouo-router', ...modes]);
}

function synthesize(command: CommandName, outputs: ListeningOutput[], request: ListeningRequest, referenceMap?: ReferenceMap): string {
  if (command === '/route') {
    return 'Router-only handoff produced a mode chain, evidence inventory, claim permissions, forbidden assumptions, and stop conditions. No listening mode was executed.';
  }

  if (command === '/reference') {
    return referenceSummary(referenceMap);
  }

  const modeList = outputs.map((output) => output.listening_mode).join(', ');
  const inputNote = request.audioInspection
    ? 'The app included browser-measured file metadata.'
    : 'No audio measurements were available beyond the supplied text.';
  const referenceNote = referenceMap ? ` A reference map adds ${referenceMap.possible_research_routes.length} research route(s).` : '';

  return `${command} ran ${outputs.length} listening mode(s): ${modeList}. ${inputNote} Claims are separated by heard, measured, inferred, interpreted, speculative, and undetermined categories.${referenceNote}`;
}

function createRouteClaimSummary(request: ListeningRequest, routerOutput: RouterOutput): ClaimTaxonomy {
  const claims = createEmptyClaimTaxonomy();

  if (request.prompt?.trim()) {
    claims.heard.push(createClaim(`Prompt supplied: ${clip(request.prompt.trim())}`, 'high', 'User-provided text'));
  }

  if (request.audioInspection) {
    claims.heard.push(createClaim(`Audio file supplied: ${request.audioInspection.fileName}.`, 'high', 'Browser File input'));
    claims.measured.push(...request.audioInspection.measuredClaims);
  }

  claims.inferred.push(
    createClaim(
      `Router selected ${routerOutput.primary_mode} as primary, ${routerOutput.secondary_mode} as secondary, and ${routerOutput.corrective_mode} as corrective.`,
      'medium',
      'Heuristic route scoring from supplied input type, command, and prompt terms',
    ),
  );
  claims.undetermined.push(
    createClaim('No listening-mode content claims were produced because /route only plans the workflow.', 'high', 'Router-only command'),
  );

  return claims;
}

function comparativeContradictions(request: ListeningRequest): string[] {
  const contradictions = [
    'A mode may infer possible source or affect while forensic mode leaves source, identity, and event sequence undetermined.',
    'Symbolic-fictional listening can generate a world, but signal inspection and forensic listening cannot treat that world as evidence.',
  ];

  if (!request.audioInspection) {
    contradictions.push('Prompt-based readings can be rich while measured signal claims remain unavailable.');
  }

  return contradictions;
}

function nextModeForComparative(request: ListeningRequest): ListeningMode {
  if (request.audioInspection) {
    return 'signal-inspection-listening';
  }

  if (hasAny(request, ['video', 'film', 'game', 'caption', 'subtitle', 'scene', 'image'])) {
    return 'audiovisual-scenic-listening';
  }

  if (hasAny(request, ['voice', 'speech', 'transcript', 'asr', 'tts', 'speaker', 'podcast'])) {
    return 'voice-speech-listening';
  }

  if (hasAny(request, ['accessibility', 'deaf', 'hard of hearing', 'haptic', 'assistive', 'intelligibility'])) {
    return 'accessibility-normative-listening';
  }

  if (hasAny(request, ['vibration', 'resonance', 'feedback', 'duration', 'material', 'rumble'])) {
    return 'material-event-listening';
  }

  if (requiresCriticalCorrective(request)) {
    return 'critical-political-listening';
  }

  return 'acoulogical-object-listening';
}

function requiresCriticalCorrective(request: ListeningRequest): boolean {
  return hasAny(request, ['archive', 'voice', 'dataset', 'surveillance', 'protest', 'border', 'police', 'military', 'colonial', 'platform', 'consent', 'accessibility', 'caption', 'deaf', 'identity', 'race', 'gender', 'labor']);
}

function isMusicalRequest(request: ListeningRequest): boolean {
  return hasAny(request, ['music', 'song', 'beat', 'rhythm', 'pulse', 'tempo', 'meter', 'melody', 'harmony', 'chord', 'pitch', 'interval', 'drone', 'bass', 'timbre', 'texture', 'sound design', 'sound-design', 'mix', 'track', 'loop', 'aesthetic']);
}

function hasAny(request: ListeningRequest, terms: string[]): boolean {
  const text = `${request.prompt ?? ''} ${request.objectName}`.toLowerCase();
  return terms.some((term) => text.includes(term));
}

function objectNameForRequest(request: ListeningRequest): string {
  if (request.objectName.trim()) {
    return request.objectName.trim();
  }

  if (request.audioInspection) {
    return request.audioInspection.fileName;
  }

  if (request.prompt?.trim()) {
    return 'sound prompt';
  }

  return 'unnamed sonic object';
}

function clip(value: string): string {
  return value.length > 180 ? `${value.slice(0, 177)}...` : value;
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
