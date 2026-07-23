import { createClaim, createEmptyClaimTaxonomy } from './outputFactory';
import { listeningModes } from './types';
import type {
  ClaimTaxonomy,
  ListeningMode,
  ListeningOutput,
  ListeningRequest,
  ReferenceMap,
} from './types';

interface ReferenceEntry {
  concept: string;
  triggers: string[];
  modes: ListeningMode[];
  methodologies: string[];
  authorsOrTraditions: string[];
  researchRoutes: string[];
  researchQuestions: string[];
  cautions: string[];
  adjacentModes: ListeningMode[];
}

const referenceEntries: ReferenceEntry[] = [
  {
    concept: 'auditum and acoulogical object',
    triggers: ['auditum', 'object', 'texture', 'timbre', 'grain', 'sample', 'foley', 'acousmatic', 'source', 'ambiguous'],
    modes: ['acoulogical-object-listening'],
    methodologies: ['auditum-first description', 'reduced listening as temporary bracketing', 'causal-semantic-figurative separation'],
    authorsOrTraditions: ['Pierre Schaeffer / Michel Chion', 'acoulogy', 'sound object analysis'],
    researchRoutes: ['describe sonic shape before source identity', 'compare apparent source with heard object', 'separate perceptual qualities from symbolic reading'],
    researchQuestions: ['What is the heard object before it becomes a source claim?', 'Which details belong to perception, and which belong to inference?'],
    cautions: ['Do not treat reduced listening as a pure ear.', 'Do not collapse the auditum into the presumed cause.'],
    adjacentModes: ['signal-inspection-listening', 'transductive-media-listening', 'symbolic-fictional-listening'],
  },
  {
    concept: 'signal evidence and technical restraint',
    triggers: ['spectrogram', 'waveform', 'clipping', 'loudness', 'frequency', 'codec', 'sample rate', 'metadata', 'distortion', 'noise'],
    modes: ['signal-inspection-listening'],
    methodologies: ['metadata inspection', 'waveform and spectrogram reading', 'technical claims before interpretation'],
    authorsOrTraditions: ['audio engineering practice', 'digital signal analysis', 'technical listening'],
    researchRoutes: ['measure file and signal traits before interpretation', 'identify where measurement stops', 'use signal evidence as support rather than meaning'],
    researchQuestions: ['What can be technically measured from the available input?', 'Which claims remain impossible without waveform or spectrogram analysis?'],
    cautions: ['Signal data cannot prove intention, identity, politics, or affect.', 'Do not turn spectrogram patterns into cultural proof.'],
    adjacentModes: ['acoulogical-object-listening', 'transductive-media-listening', 'forensic-archival-listening'],
  },
  {
    concept: 'embodied and affective listening',
    triggers: ['bass', 'pressure', 'vibration', 'fatigue', 'dread', 'pleasure', 'alarm', 'siren', 'drone', 'asmr', 'club'],
    modes: ['embodied-affective-listening'],
    methodologies: ['situated body listening', 'psychoacoustic caution', 'attention and fatigue mapping'],
    authorsOrTraditions: ['Steve Goodman', 'embodied sound studies', 'psychoacoustic listening'],
    researchRoutes: ['map pressure, attention capture, and fatigue', 'compare bodily claims with playback conditions', 'separate possible affect from universal response'],
    researchQuestions: ['What does the sound ask of bodies?', 'Which bodies, rooms, volumes, and histories condition the response?'],
    cautions: ['Do not universalize bodily response.', 'Do not aestheticize coercive sound without naming risk.'],
    adjacentModes: ['signal-inspection-listening', 'critical-political-listening', 'acoulogical-object-listening'],
  },
  {
    concept: 'transduction and media conversion',
    triggers: ['sensor', 'sonification', 'hydrophone', 'contact mic', 'microphone', 'compression', 'dataset', 'model', 'ai audio', 'voice clone', 'speech-to-text', 'asr', 'tts', 'voice agent'],
    modes: ['transductive-media-listening'],
    methodologies: ['source-domain to target-domain mapping', 'capture-chain analysis', 'model and platform mediation audit'],
    authorsOrTraditions: ['Jonathan Sterne', 'digital sound studies', 'media archaeology', 'AI audio critique'],
    researchRoutes: ['map what is transformed, lost, invented, and compressed', 'distinguish trace from representation and model output', 'track capture, encoding, and playback conditions'],
    researchQuestions: ['What becomes audible through conversion?', 'What does the mediation chain hide, smooth, or invent?'],
    cautions: ['Do not treat mediated sound as direct access to source.', 'Do not invent hidden datasets, devices, or models.'],
    adjacentModes: ['signal-inspection-listening', 'critical-political-listening', 'ecological-posthuman-listening'],
  },
  {
    concept: 'forensic testimony and archival silence',
    triggers: ['archive', 'testimony', 'evidence', 'violence', 'surveillance', 'protest', 'damaged tape', 'oral history', 'witness'],
    modes: ['forensic-archival-listening'],
    methodologies: ['evidentiary restraint', 'chain-of-mediation review', 'silence and damage inventory'],
    authorsOrTraditions: ['Lawrence Abu Hamdan', 'forensic listening', 'oral history and archive studies'],
    researchRoutes: ['separate audible evidence from inference', 'identify missing evidence and damaged sections', 'map archival and political stakes'],
    researchQuestions: ['What can the sound testify?', 'Where does testimony break down or require corroboration?'],
    cautions: ['Never invent evidence.', 'Do not identify speakers, places, weapons, or sequences without support.'],
    adjacentModes: ['signal-inspection-listening', 'critical-political-listening', 'transductive-media-listening'],
  },
  {
    concept: 'ecological and more-than-human listening',
    triggers: ['field recording', 'forest', 'river', 'ocean', 'weather', 'animal', 'habitat', 'ecology', 'geophony', 'biophony', 'soundwalk'],
    modes: ['ecological-posthuman-listening'],
    methodologies: ['more-than-human layer mapping', 'habitat relation listening', 'field recording ethics'],
    authorsOrTraditions: ['Pauline Oliveros', 'acoustic ecology', 'Steven Feld / acoustemology', 'posthuman sound studies'],
    researchRoutes: ['map human, nonhuman, technical, and environmental layers', 'attend to scale and seasonal time', 'include fieldwork and sensor ethics'],
    researchQuestions: ['What appears when the human listener is decentered?', 'What technical system grants access to the environment?'],
    cautions: ['Do not romanticize nature.', 'Do not identify species, sites, or ecological conditions without evidence.'],
    adjacentModes: ['transductive-media-listening', 'signal-inspection-listening', 'critical-political-listening'],
  },
  {
    concept: 'critical-political and decolonial listening',
    triggers: ['platform', 'market', 'labor', 'race', 'gender', 'class', 'colonial', 'border', 'police', 'military', 'accessibility', 'dataset', 'consent', 'surveillance'],
    modes: ['critical-political-listening'],
    methodologies: ['mediation and infrastructure critique', 'platform and dataset provenance audit', 'anti-universalist listening'],
    authorsOrTraditions: ['critical sound studies', 'Ana María Ochoa Gautier', 'decolonial listening', 'feminist and queer sound studies'],
    researchRoutes: ['name concrete mediations and asymmetries', 'ask what the listening frame erases', 'track labor, access, extraction, and infrastructure'],
    researchQuestions: ['Who or what becomes inaudible in this frame?', 'Which infrastructures and histories make the sound available?'],
    cautions: ['Critique must not become automatic accusation.', 'Do not flatten local contexts into imported theory.'],
    adjacentModes: ['transductive-media-listening', 'forensic-archival-listening', 'acoulogical-object-listening'],
  },
  {
    concept: 'musical and aesthetic listening',
    triggers: ['music', 'song', 'beat', 'rhythm', 'pulse', 'tempo', 'meter', 'melody', 'harmony', 'chord', 'pitch', 'interval', 'drone', 'bass', 'timbre', 'texture', 'sound design', 'mix', 'track', 'loop', 'aesthetic'],
    modes: ['musical-aesthetic-listening'],
    methodologies: ['musical specificity before genre naming', 'aesthetic interpretation with evidence boundaries', 'sound-design utility description'],
    authorsOrTraditions: ['music analysis', 'sound design practice', 'critical music listening', 'sound studies'],
    researchRoutes: ['describe rhythm, pitch, harmony, timbre, texture, form, and production gesture', 'separate aesthetic language from evidence', 'audit cultural and genre claims for overreach'],
    researchQuestions: ['What is the sound doing musically before it becomes a genre label?', 'Which aesthetic claims are grounded, and which are speculative or cultural overreach?'],
    cautions: ['Do not infer culture, geography, ethnicity, sacredness, instrument, or genre from sparse musical cues.', 'Do not let poetic language replace musical detail.'],
    adjacentModes: ['signal-inspection-listening', 'acoulogical-object-listening', 'critical-political-listening'],
  },
  {
    concept: 'audiovisual litany and anti-litany',
    triggers: ['audiovisual', 'image', 'vision', 'film', 'installation', 'presence', 'immersion', 'authentic', 'visuality', 'video', 'caption', 'subtitle', 'scene', 'game', 'screen'],
    modes: ['critical-political-listening', 'transductive-media-listening', 'audiovisual-scenic-listening'],
    methodologies: ['binary audit', 'media apparatus comparison', 'anti-mystification critique', 'sound-image-text-scene mapping'],
    authorsOrTraditions: ['Jonathan Sterne', 'Michel Chion', 'media theory', 'critical sound studies'],
    researchRoutes: ['test claims that sound is presence, body, authenticity, or immersion', 'map audiovisual apparatus and interface', 'return critique to the sonic object'],
    researchQuestions: ['Which sound-versus-vision binary is being repeated?', 'What mediation complicates that binary?'],
    cautions: ['Do not replace sonic mysticism with automatic anti-sound claims.', 'Do not treat useful distinctions as simplistic binaries.'],
    adjacentModes: ['audiovisual-scenic-listening', 'acoulogical-object-listening', 'transductive-media-listening', 'critical-political-listening'],
  },
  {
    concept: 'audiovisual scene and phrasing',
    triggers: ['sync', 'synchronization', 'synchresis', 'diegetic', 'offscreen', 'subtitle', 'caption', 'trailer', 'cutscene', 'ui sound', 'interface sound'],
    modes: ['audiovisual-scenic-listening'],
    methodologies: ['audiovisual contract mapping', 'caption and subtitle mediation audit', 'scene-level sound-image-text timing analysis'],
    authorsOrTraditions: ['Michel Chion', 'audiovisual theory', 'game audio studies', 'interface sound design'],
    researchRoutes: ['map how sound, image, text, interface, and timing co-produce a scene', 'separate synchronization from proof of source', 'identify caption, subtitle, and UI-sound access paths'],
    researchQuestions: ['What does the sound do to the scene that neither image nor caption does alone?', 'Which audiovisual claims depend on missing visual, caption, or timing evidence?'],
    cautions: ['Do not treat synchronization as real-world causality.', 'Do not invent visual content from audio-only input or sonic content from visual-only input.'],
    adjacentModes: ['acoulogical-object-listening', 'voice-speech-listening', 'accessibility-normative-listening', 'critical-political-listening'],
  },
  {
    concept: 'voice, speech, and transcript',
    triggers: ['voice', 'speech', 'spoken', 'speaker', 'accent', 'prosody', 'diarization', 'podcast', 'radio', 'interview', 'transcript', 'asr', 'tts', 'dubbing'],
    modes: ['voice-speech-listening'],
    methodologies: ['voice/transcript separation', 'identity overreach audit', 'ASR/TTS mediation analysis'],
    authorsOrTraditions: ['voice studies', 'speech technology critique', 'radio and podcast studies', 'acousmatic voice theory'],
    researchRoutes: ['distinguish vocal sound, speech content, transcript, model output, and identity claims', 'map consent, dataset, interface, and caption conditions', 'compare voice as body, data, text, and agentic interface'],
    researchQuestions: ['What is available as vocal evidence, and what is only transcript or model evidence?', 'Which identity or emotion claims are being smuggled into voice analysis?'],
    cautions: ['Do not infer identity, protected traits, sincerity, consent, or emotion from voice.', 'A transcript is not the whole voice.'],
    adjacentModes: ['transductive-media-listening', 'accessibility-normative-listening', 'forensic-archival-listening', 'critical-political-listening'],
  },
  {
    concept: 'accessibility and hearing normativity',
    triggers: ['access', 'accessibility', 'caption', 'subtitle', 'transcript', 'deaf', 'hard of hearing', 'haptic', 'assistive', 'intelligibility', 'audism', 'sensory', 'fatigue', 'masking'],
    modes: ['accessibility-normative-listening'],
    methodologies: ['implied-listener audit', 'alternate sensory path mapping', 'caption/transcript/haptic quality review'],
    authorsOrTraditions: ['disability studies', 'Deaf studies', 'accessible media practice', 'universal design critique'],
    researchRoutes: ['identify who the workflow expects to hear', 'map captions, transcripts, haptics, visuals, timing, language, and assistive technology paths', 'separate access claims from untested assumptions'],
    researchQuestions: ['Who is excluded by the current listening path?', 'What non-audio path carries equivalent or complementary information?'],
    cautions: ['Do not reduce accessibility to captions only.', 'Do not claim user experience or compliance without testing and standards.'],
    adjacentModes: ['voice-speech-listening', 'embodied-affective-listening', 'critical-political-listening', 'audiovisual-scenic-listening'],
  },
  {
    concept: 'material sound event',
    triggers: ['material', 'vibration', 'resonance', 'feedback', 'duration', 'flux', 'rumble', 'infrasound', 'ultrasound', 'unsound', 'low frequency', 'loudspeaker', 'room', 'surface', 'installation'],
    modes: ['material-event-listening'],
    methodologies: ['vibration and propagation mapping', 'duration and process listening', 'material support and room-coupling analysis'],
    authorsOrTraditions: ['sonic materialism', 'sound art and installation practice', 'low-frequency and vibration studies'],
    researchRoutes: ['track sound as event across material supports, bodies, devices, and time', 'separate material ontology from measured signal evidence', 'map surfaces, rooms, loudspeakers, resonance, and propagation when context exists'],
    researchQuestions: ['What material process lets this sound happen?', 'Which claims require frequency, amplitude, room, speaker, or tactile evidence?'],
    cautions: ['Do not treat vibration or resonance as measured fact without measurement.', 'Do not universalize tactile or bodily effects.'],
    adjacentModes: ['signal-inspection-listening', 'embodied-affective-listening', 'transductive-media-listening', 'ecological-posthuman-listening'],
  },
  {
    concept: 'sonic fiction and possible worlds',
    triggers: ['fiction', 'myth', 'ritual', 'dream', 'alien', 'ghost', 'cosmic', 'worldbuilding', 'hyperstition', 'impossible'],
    modes: ['symbolic-fictional-listening'],
    methodologies: ['declared speculative listening', 'possible-world mapping', 'symbolic register analysis'],
    authorsOrTraditions: ['Kodwo Eshun', 'Salomé Voegelin', 'sonic fiction', 'speculative sound studies'],
    researchRoutes: ['build a world while preserving evidence boundaries', 'map agents, forces, atmosphere, and temporal logic', 'track where fiction touches real histories or sacred forms'],
    researchQuestions: ['What world does the sound imply or invent?', 'Which parts are perceptual anchors and which are declared speculation?'],
    cautions: ['Speculation must stay labeled.', 'Do not turn testimony, archive, or sacred material into casual fantasy.'],
    adjacentModes: ['acoulogical-object-listening', 'embodied-affective-listening', 'critical-political-listening'],
  },
  {
    concept: 'urban acoustic territory',
    triggers: ['city', 'street', 'traffic', 'metro', 'public space', 'neighborhood', 'infrastructure', 'territory'],
    modes: ['critical-political-listening', 'ecological-posthuman-listening', 'embodied-affective-listening'],
    methodologies: ['acoustic territory mapping', 'public-space listening', 'infrastructure and access audit'],
    authorsOrTraditions: ['Brandon LaBelle', 'urban sound studies', 'acoustic ecology'],
    researchRoutes: ['map how sound organizes territory and access', 'compare infrastructure, body, and public space', 'separate ambience from governance or exclusion'],
    researchQuestions: ['How does the sound organize access, movement, or attention?', 'Which public or infrastructural relations become audible?'],
    cautions: ['Do not reduce urban sound to mood.', 'Do not infer location or social context without evidence.'],
    adjacentModes: ['critical-political-listening', 'embodied-affective-listening', 'forensic-archival-listening'],
  },
];

export function createReferenceMap(request: ListeningRequest, outputs: ListeningOutput[]): ReferenceMap {
  const activeModes = outputs.map((output) => output.listening_mode);
  const matchedEntries = entriesForRequest(request, activeModes);
  const fallbackEntries = activeModes.length > 0 ? entriesForModes(activeModes) : [referenceEntries[0], referenceEntries[3], referenceEntries[6]];
  const entries = matchedEntries.length > 0 ? matchedEntries : fallbackEntries;
  const fallbackMode: ListeningMode = request.audioInspection ? 'signal-inspection-listening' : 'transductive-media-listening';
  const adjacentModes = unique<ListeningMode>([
    ...outputs.map((output) => output.recommended_next_mode).filter(isListeningMode),
    ...entries.flatMap((entry) => entry.adjacentModes),
    fallbackMode,
  ]);

  return {
    concepts_triggered: unique(['agentic listening', 'claim taxonomy', ...entries.map((entry) => entry.concept)]),
    sonic_methodologies: unique([
      'mode selection before answer',
      'claim taxonomy audit',
      ...entries.flatMap((entry) => entry.methodologies),
    ]),
    authors_or_traditions: unique(entries.flatMap((entry) => entry.authorsOrTraditions)),
    possible_research_routes: unique([
      'sound as multidimensional event rather than single source',
      ...entries.flatMap((entry) => entry.researchRoutes),
      ...activeModes.map(researchRouteForMode),
    ]),
    research_questions: unique([
      'Which claims are heard, measured, inferred, interpreted, speculative, or undetermined?',
      ...entries.flatMap((entry) => entry.researchQuestions),
    ]),
    cautions: unique([
      'Do not use references as decoration when the input is thin.',
      'Do not let theory override claim discipline.',
      ...entries.flatMap((entry) => entry.cautions),
    ]),
    adjacent_modes: adjacentModes,
  };
}

export function createReferenceClaimSummary(request: ListeningRequest, referenceMap?: ReferenceMap): ClaimTaxonomy {
  const claims = createEmptyClaimTaxonomy();

  if (request.prompt?.trim()) {
    claims.heard.push(createClaim(`Prompt supplied: ${clip(request.prompt.trim())}`, 'high', 'User-provided text'));
  }

  if (request.audioInspection) {
    claims.heard.push(createClaim(`Audio file supplied: ${request.audioInspection.fileName}.`, 'high', 'Browser File input'));
    claims.measured.push(...request.audioInspection.measuredClaims);
  }

  claims.interpreted.push(
    createClaim('The reference layer maps concepts, methodologies, traditions, research routes, cautions, and adjacent modes rather than proving an interpretation.', 'high'),
  );

  if (referenceMap) {
    claims.inferred.push(
      createClaim(`Conceptual routes suggested: ${referenceMap.concepts_triggered.slice(0, 5).join(', ')}.`, 'medium'),
    );
  }

  claims.undetermined.push(
    createClaim('Exact bibliography, formal citations, archival provenance, and site-specific theoretical context remain deferred to later research workflows.', 'high'),
  );

  return claims;
}

export function referenceSummary(referenceMap?: ReferenceMap): string {
  return `Reference mapping generated ${referenceMap?.concepts_triggered.length ?? 0} concept route(s), ${referenceMap?.sonic_methodologies.length ?? 0} methodology route(s), and ${referenceMap?.cautions.length ?? 0} caution(s). It does not prove an interpretation or generate a bibliography dump.`;
}

function entriesForRequest(request: ListeningRequest, activeModes: ListeningMode[]): ReferenceEntry[] {
  const text = `${request.prompt ?? ''} ${request.objectName} ${request.inputType}`.toLowerCase();

  return referenceEntries.filter((entry) => {
    const modeMatch = entry.modes.some((mode) => activeModes.includes(mode));
    const triggerMatch = entry.triggers.some((trigger) => text.includes(trigger));
    return modeMatch || triggerMatch;
  });
}

function entriesForModes(activeModes: ListeningMode[]): ReferenceEntry[] {
  return referenceEntries.filter((entry) => entry.modes.some((mode) => activeModes.includes(mode)));
}

function researchRouteForMode(mode: ListeningMode): string {
  switch (mode) {
    case 'signal-inspection-listening':
      return 'technical signal inspection with strict limits on meaning claims';
    case 'acoulogical-object-listening':
      return 'auditum-first description before source identification';
    case 'embodied-affective-listening':
      return 'body, pressure, fatigue, and attention as situated listening conditions';
    case 'transductive-media-listening':
      return 'sound as transformation across devices, codecs, sensors, models, and interfaces';
    case 'forensic-archival-listening':
      return 'sound as testimony with missing evidence and chain-of-mediation caution';
    case 'ecological-posthuman-listening':
      return 'sound as relation among human, nonhuman, environmental, and technical agencies';
    case 'critical-political-listening':
      return 'listening as critique of mediation, platform, labor, access, and power';
    case 'musical-aesthetic-listening':
      return 'music and sound design as rhythm, pitch, timbre, texture, form, aesthetic force, and cultural caution';
    case 'symbolic-fictional-listening':
      return 'declared sonic fiction and possible-world construction';
    case 'audiovisual-scenic-listening':
      return 'sound-image-text-scene analysis with synchronization, caption, and interface caution';
    case 'voice-speech-listening':
      return 'voice and speech analysis that separates vocal sound, transcript, model output, identity, and consent';
    case 'accessibility-normative-listening':
      return 'accessibility and hearing-norm audit across captions, transcripts, haptics, devices, bodies, and environments';
    case 'material-event-listening':
      return 'sound as material event across vibration, resonance, propagation, duration, and process';
    case 'memory-lineage-listening':
      return 'listening with stored sound-memories: recurrence, kinship, lineage, and change over time without treating memory as evidence';
    case 'sovereign-listening':
      return 'covenant-aware listening that keeps consent, withholding, opacity, retention, precision, and refusal inspectable';
  }
}

function clip(value: string): string {
  return value.length > 180 ? `${value.slice(0, 177)}...` : value;
}

function isListeningMode(value: ListeningMode | 'none' | 'undetermined'): value is ListeningMode {
  return listeningModes.includes(value as ListeningMode);
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
