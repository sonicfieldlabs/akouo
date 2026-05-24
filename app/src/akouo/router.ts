import { listeningModes } from './types';
import type { CommandName, ListeningMode, ListeningRequest, RouterOutput } from './types';

type RouteRole = Pick<RouterOutput, 'primary_mode' | 'secondary_mode' | 'corrective_mode'>;

interface RouteScore {
  mode: ListeningMode;
  score: number;
  reasons: string[];
}

interface RouteRule {
  mode: ListeningMode;
  weight: number;
  reason: string;
  commands?: CommandName[];
  inputTypes?: ListeningRequest['inputType'][];
  terms?: string[];
}

const routeRules: RouteRule[] = [
  { mode: 'signal-inspection-listening', weight: 5, reason: 'Signal-like input asks for technical inspection.', inputTypes: ['audio_file', 'spectrogram', 'waveform', 'metadata'] },
  { mode: 'signal-inspection-listening', weight: 3, reason: 'Technical terms require measurement caution.', terms: ['waveform', 'spectrogram', 'lufs', 'rms', 'dbfs', 'clipping', 'noise floor', 'frequency', 'sample rate', 'codec', 'phase'] },
  { mode: 'acoulogical-object-listening', weight: 3, reason: 'General listening should first describe the auditum before source claims.', inputTypes: ['audio_file', 'sound_prompt', 'mixed', 'unknown', 'other'] },
  { mode: 'acoulogical-object-listening', weight: 3, reason: 'Perceptual texture terms suggest auditum-first description.', terms: ['texture', 'timbre', 'grain', 'scrape', 'foley', 'object', 'acousmatic', 'source', 'ambiguous'] },
  { mode: 'musical-aesthetic-listening', weight: 5, reason: 'Musical or aesthetic terms require rhythm, pitch, timbre, form, and genre caution.', terms: ['music', 'song', 'beat', 'rhythm', 'pulse', 'tempo', 'meter', 'melody', 'harmony', 'chord', 'pitch', 'interval', 'drone', 'bass', 'mix', 'track', 'loop', 'aesthetic', 'sound design'] },
  { mode: 'embodied-affective-listening', weight: 4, reason: 'Body, pressure, attention, or affect terms require situated embodied listening.', terms: ['body', 'pressure', 'vibration', 'fatigue', 'dread', 'pleasure', 'alarm', 'siren', 'asmr', 'club', 'dance', 'attention', 'overload', 'haptic'] },
  { mode: 'transductive-media-listening', weight: 4, reason: 'Mediation, platform, sensor, codec, model, or dataset terms require transductive mapping.', inputTypes: ['dataset_description', 'model_output', 'metadata'] },
  { mode: 'transductive-media-listening', weight: 4, reason: 'Conversion and media-chain terms require transductive mapping.', terms: ['sensor', 'sonification', 'hydrophone', 'contact mic', 'microphone', 'compression', 'dataset', 'model', 'ai audio', 'voice clone', 'speech-to-text', 'asr', 'tts', 'platform', 'codec'] },
  { mode: 'forensic-archival-listening', weight: 5, reason: 'Archive, transcript, testimony, or evidence input requires evidentiary restraint.', inputTypes: ['archive_note', 'transcript'] },
  { mode: 'forensic-archival-listening', weight: 5, reason: 'Evidence and harm terms require forensic-archival caution.', terms: ['archive', 'testimony', 'evidence', 'violence', 'surveillance', 'protest', 'damaged tape', 'oral history', 'witness', 'legal', 'custody', 'court'] },
  { mode: 'ecological-posthuman-listening', weight: 5, reason: 'Field or environment input requires ecological and more-than-human listening.', inputTypes: ['field_note'] },
  { mode: 'ecological-posthuman-listening', weight: 4, reason: 'Place, habitat, soundscape, or nonhuman terms require ecological listening.', terms: ['field recording', 'forest', 'river', 'ocean', 'weather', 'animal', 'bird', 'insect', 'habitat', 'ecology', 'soundscape', 'geophony', 'biophony', 'soundwalk', 'acoustemology', 'aurality', 'place'] },
  { mode: 'critical-political-listening', weight: 4, reason: 'Power, access, identity, labor, platform, or institutional stakes require critique.', terms: ['platform', 'market', 'labor', 'race', 'gender', 'class', 'colonial', 'border', 'police', 'military', 'accessibility', 'dataset', 'consent', 'surveillance', 'extraction', 'sovereignty'] },
  { mode: 'symbolic-fictional-listening', weight: 5, reason: 'Declared fiction, myth, ritual, or impossible sound requires speculative boundaries.', terms: ['fiction', 'myth', 'ritual', 'dream', 'alien', 'ghost', 'cosmic', 'worldbuilding', 'hyperstition', 'impossible', 'hauntology'] },
  { mode: 'audiovisual-scenic-listening', weight: 6, reason: 'Video or visual-scene input requires sound-image routing.', inputTypes: ['video'] },
  { mode: 'audiovisual-scenic-listening', weight: 5, reason: 'Audiovisual, film, game, UI, subtitle, or scene terms require scenic listening.', terms: ['video', 'film', 'game', 'scene', 'image', 'screen', 'subtitle', 'caption', 'synchresis', 'audiovisual', 'diegetic', 'interface', 'ui sound', 'trailer'] },
  { mode: 'voice-speech-listening', weight: 5, reason: 'Speech, voice, transcript, ASR, TTS, or speaker terms require voice-specific caution.', inputTypes: ['transcript'] },
  { mode: 'voice-speech-listening', weight: 5, reason: 'Voice and speech terms require separation of vocal sound, transcript, identity, and model mediation.', terms: ['voice', 'speech', 'speaker', 'accent', 'transcript', 'asr', 'tts', 'prosody', 'diarization', 'spoken', 'vocal', 'podcast', 'radio', 'voice agent', 'dubbing'] },
  { mode: 'accessibility-normative-listening', weight: 5, reason: 'Accessibility, caption, haptic, disability, or hearing-norm terms require access audit.', terms: ['accessibility', 'caption', 'subtitle', 'transcript', 'deaf', 'hard of hearing', 'haptic', 'hearing', 'assistive', 'audism', 'sensory', 'universal design', 'intelligibility'] },
  { mode: 'material-event-listening', weight: 4, reason: 'Material, vibrational, resonant, or processual terms require material-event listening.', terms: ['material', 'event', 'flux', 'vibration', 'resonance', 'feedback', 'drone', 'hum', 'rumble', 'infrasound', 'ultrasound', 'unsound', 'microsound', 'duration', 'speaker', 'loudspeaker', 'installation'] },
  { mode: 'signal-inspection-listening', weight: 8, reason: 'The /tech command privileges technical signal inspection.', commands: ['/tech'] },
  { mode: 'transductive-media-listening', weight: 6, reason: 'The /tech command also maps media-chain limits.', commands: ['/tech'] },
  { mode: 'forensic-archival-listening', weight: 8, reason: 'The /forensic command privileges evidentiary restraint.', commands: ['/forensic'] },
  { mode: 'signal-inspection-listening', weight: 6, reason: 'The /forensic command needs technical grounding.', commands: ['/forensic'] },
  { mode: 'critical-political-listening', weight: 5, reason: 'The /forensic command needs institutional and harm-context caution.', commands: ['/forensic'] },
  { mode: 'symbolic-fictional-listening', weight: 8, reason: 'The /fiction command privileges declared speculation.', commands: ['/fiction'] },
  { mode: 'embodied-affective-listening', weight: 4, reason: 'The /fiction command often needs affective force mapping.', commands: ['/fiction'] },
  { mode: 'transductive-media-listening', weight: 8, reason: 'The /transduce command privileges mediation and conversion.', commands: ['/transduce'] },
  { mode: 'voice-speech-listening', weight: 8, reason: 'The /voice command privileges voice and speech analysis.', commands: ['/voice'] },
  { mode: 'audiovisual-scenic-listening', weight: 8, reason: 'The /audiovision command privileges sound-image-scene analysis.', commands: ['/audiovision'] },
  { mode: 'accessibility-normative-listening', weight: 8, reason: 'The /access command privileges access and hearing-norm audit.', commands: ['/access'] },
  { mode: 'ecological-posthuman-listening', weight: 8, reason: 'The /field command privileges ecological and field-recording analysis.', commands: ['/field'] },
  { mode: 'material-event-listening', weight: 4, reason: 'The /field command includes event, scale, vibration, and material context.', commands: ['/field'] },
  { mode: 'acoulogical-object-listening', weight: 5, reason: 'The /study and /method commands need perceptual grounding.', commands: ['/study', '/method'] },
  { mode: 'critical-political-listening', weight: 5, reason: 'The /study and /method commands need methodological critique.', commands: ['/study', '/method'] },
  { mode: 'accessibility-normative-listening', weight: 4, reason: 'The /method command audits implied listener and access path.', commands: ['/method'] },
  { mode: 'critical-political-listening', weight: 6, reason: 'The /litany command audits sound-versus-vision assumptions.', commands: ['/litany'] },
  { mode: 'audiovisual-scenic-listening', weight: 5, reason: 'The /litany command often concerns audiovisual claims.', commands: ['/litany'] },
];

const correctiveModes: ListeningMode[] = [
  'critical-political-listening',
  'signal-inspection-listening',
  'transductive-media-listening',
  'accessibility-normative-listening',
  'forensic-archival-listening',
  'acoulogical-object-listening',
];

export function createRouteDraft(request: ListeningRequest): RouterOutput {
  const scores = scoreRoutes(request);
  const route = routeForScores(scores);
  const availableEvidence = availableEvidenceForInput(request);

  return {
    object_listened_to: request.objectName || 'unnamed sonic object',
    input_type: request.inputType,
    user_intent: request.command ? `User selected ${request.command}` : 'Auto-route listening request',
    available_evidence: availableEvidence,
    unavailable_evidence: unavailableEvidenceForInput(request),
    primary_mode: route.primary_mode,
    secondary_mode: route.secondary_mode,
    corrective_mode: route.corrective_mode,
    route_reasoning: routeReasoning(scores, route),
    risks: risksForRoute(route, request),
    must_not_assume: mustNotAssume(request, route),
    recommended_command: request.command ?? inferRecommendedCommand(scores, request),
    recommended_next_mode: route.secondary_mode,
  };
}

function scoreRoutes(request: ListeningRequest): RouteScore[] {
  const scores = listeningModes.map<RouteScore>((mode) => ({ mode, score: 0, reasons: [] }));

  for (const rule of routeRules) {
    if (!ruleMatches(rule, request)) continue;
    const score = scores.find((item) => item.mode === rule.mode);
    if (!score) continue;
    score.score += rule.weight;
    score.reasons.push(rule.reason);
  }

  if (request.audioInspection) {
    addScore(scores, 'signal-inspection-listening', 3, 'Decoded audio metadata is available.');
    addScore(scores, 'transductive-media-listening', 1, 'Uploaded audio still has an unknown capture and encoding chain.');
  }

  if (!request.prompt?.trim() && !request.audioInspection) {
    addScore(scores, 'acoulogical-object-listening', 1, 'No input was supplied; default to minimal perceptual caution.');
  }

  return scores.sort((a, b) => b.score - a.score);
}

function routeForScores(scores: RouteScore[]): RouteRole {
  const primary = firstScored(scores) ?? 'acoulogical-object-listening';
  const secondary = firstScored(scores, [primary]) ?? fallbackSecondary(primary);
  const corrective = firstCorrective(scores, [primary, secondary]) ?? fallbackCorrective(primary, secondary);

  return {
    primary_mode: primary,
    secondary_mode: secondary,
    corrective_mode: corrective,
  };
}

function ruleMatches(rule: RouteRule, request: ListeningRequest): boolean {
  const commandMatch = rule.commands?.includes(request.command as CommandName) ?? false;
  const inputMatch = rule.inputTypes?.includes(request.inputType) ?? false;
  const termMatch = rule.terms ? hasAny(request, rule.terms) : false;
  return commandMatch || inputMatch || termMatch;
}

function addScore(scores: RouteScore[], mode: ListeningMode, weight: number, reason: string) {
  const score = scores.find((item) => item.mode === mode);
  if (!score) return;
  score.score += weight;
  score.reasons.push(reason);
}

function firstScored(scores: RouteScore[], excluded: ListeningMode[] = []): ListeningMode | null {
  return scores.find((score) => score.score > 0 && !excluded.includes(score.mode))?.mode ?? null;
}

function firstCorrective(scores: RouteScore[], excluded: ListeningMode[]): ListeningMode | null {
  return scores.find((score) => score.score > 0 && correctiveModes.includes(score.mode) && !excluded.includes(score.mode))?.mode ?? null;
}

function fallbackSecondary(primary: ListeningMode): ListeningMode {
  if (primary === 'signal-inspection-listening') return 'transductive-media-listening';
  if (primary === 'audiovisual-scenic-listening') return 'acoulogical-object-listening';
  if (primary === 'voice-speech-listening') return 'transductive-media-listening';
  if (primary === 'accessibility-normative-listening') return 'voice-speech-listening';
  if (primary === 'material-event-listening') return 'signal-inspection-listening';
  if (primary === 'ecological-posthuman-listening') return 'transductive-media-listening';
  if (primary === 'forensic-archival-listening') return 'signal-inspection-listening';
  if (primary === 'symbolic-fictional-listening') return 'embodied-affective-listening';
  if (primary === 'musical-aesthetic-listening') return 'acoulogical-object-listening';
  return 'signal-inspection-listening';
}

function fallbackCorrective(primary: ListeningMode, secondary: ListeningMode): ListeningMode {
  const preferred: ListeningMode[] = ['critical-political-listening', 'accessibility-normative-listening', 'transductive-media-listening', 'signal-inspection-listening', 'acoulogical-object-listening'];
  return preferred.find((mode) => mode !== primary && mode !== secondary) ?? 'critical-political-listening';
}

function routeReasoning(scores: RouteScore[], route: RouteRole): string[] {
  return [route.primary_mode, route.secondary_mode, route.corrective_mode].map((mode) => {
    const score = scores.find((item) => item.mode === mode);
    const reason = score?.reasons[0] ?? 'Selected as a balancing listening mode.';
    return `${mode}: ${reason}`;
  });
}

function availableEvidenceForInput(request: ListeningRequest): string[] {
  const evidence = [`input type: ${request.inputType}`];

  if (request.prompt?.trim()) {
    evidence.push('user supplied text prompt or description');
  }

  if (request.metadata) {
    evidence.push('user supplied metadata fields');
  }

  if (request.audioInspection) {
    evidence.push('browser decoded audio metadata, basic amplitude features, and limited spectral summary');
  }

  return evidence;
}

function unavailableEvidenceForInput(request: ListeningRequest): string[] {
  const unavailable = ['full recording chain', 'playback conditions', 'listener context'];

  if (!request.audioInspection) {
    unavailable.push('verified waveform data', 'verified spectrogram data', 'measured loudness or frequency distribution');
  }

  if (request.inputType === 'video') {
    unavailable.push('frame-accurate sound-image synchronization unless video inspection is supplied');
  }

  if (request.inputType === 'transcript') {
    unavailable.push('vocal timbre, prosody, accent, timing, and nonverbal sound unless audio is supplied');
  }

  return unavailable;
}

function risksForRoute(route: RouteRole, request: ListeningRequest): string[] {
  const risks = new Set<string>([
    'Prompt, transcript, metadata, decoded audio, and measured signal support different claim types.',
  ]);

  if (route.primary_mode === 'voice-speech-listening' || route.secondary_mode === 'voice-speech-listening') {
    risks.add('Voice must not be treated as proof of identity, emotion, consent, disability, age, gender, ethnicity, or geography.');
  }

  if (route.primary_mode === 'audiovisual-scenic-listening' || route.secondary_mode === 'audiovisual-scenic-listening') {
    risks.add('Sound-image synchronization must not be treated as proof of real-world causality.');
  }

  if (route.corrective_mode === 'accessibility-normative-listening' || hasAny(request, ['caption', 'accessibility', 'deaf', 'hearing'])) {
    risks.add('The report may assume a normative hearing listener unless access paths are named.');
  }

  if (route.corrective_mode === 'critical-political-listening') {
    risks.add('Cultural, archival, institutional, or platform stakes may be flattened if context is missing.');
  }

  if (route.corrective_mode === 'signal-inspection-listening') {
    risks.add('Technical uncertainty must be stated before source, event, or production claims.');
  }

  return Array.from(risks);
}

function mustNotAssume(request: ListeningRequest, route: RouteRole): string[] {
  const assumptions = [
    'Do not identify source, intention, identity, culture, or event sequence without evidence.',
    'Do not move theory, affect, or culture into inferred claims.',
    'Do not move speculation outside the speculative category.',
  ];

  if (!request.audioInspection) {
    assumptions.push('Do not claim measured audio traits from text-only input.');
  }

  if (route.primary_mode === 'voice-speech-listening' || route.secondary_mode === 'voice-speech-listening') {
    assumptions.push('Do not treat transcript text as the whole voice.');
  }

  if (route.primary_mode === 'audiovisual-scenic-listening') {
    assumptions.push('Do not invent missing visual or audio content.');
  }

  return assumptions;
}

function inferRecommendedCommand(scores: RouteScore[], request: ListeningRequest): CommandName {
  if (request.command && request.command !== '/route') return request.command;

  const top = firstScored(scores);
  if (top === 'voice-speech-listening') return '/voice';
  if (top === 'audiovisual-scenic-listening') return '/audiovision';
  if (top === 'accessibility-normative-listening') return '/access';
  if (top === 'ecological-posthuman-listening') return '/field';
  if (top === 'forensic-archival-listening') return '/forensic';
  if (top === 'transductive-media-listening') return '/transduce';
  if (top === 'signal-inspection-listening') return '/tech';
  if (top === 'symbolic-fictional-listening') return '/fiction';

  if (hasAny(request, ['research', 'method', 'methodology', 'essay', 'study', 'thesis'])) {
    return '/method';
  }

  return '/listen';
}

function hasAny(request: ListeningRequest, terms: string[]): boolean {
  const text = `${request.prompt ?? ''} ${request.objectName} ${request.inputType} ${request.command ?? ''}`.toLowerCase();
  return terms.some((term) => text.includes(term));
}
