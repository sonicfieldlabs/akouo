import type {
  Claim,
  ClaimTaxonomy,
  InputType,
  ListeningMode,
  ListeningContext,
  ListeningOutput,
  ListeningRequest,
  Mediations,
  Risks,
} from './types';
import { claimCategories } from './types';

export function createEmptyClaimTaxonomy(): ClaimTaxonomy {
  return claimCategories.reduce<ClaimTaxonomy>((claims, category) => {
    claims[category] = [];
    return claims;
  }, {} as ClaimTaxonomy);
}

function createEmptyMediations(): Mediations {
  return {
    technical: [],
    cultural: [],
    spatial: [],
    bodily: [],
    archival: [],
    computational: [],
  };
}

function createEmptyRisks(): Risks {
  return {
    hallucination: [],
    over_identification: [],
    cultural_flattening: [],
    forensic_overreach: [],
    source_confusion: [],
    aesthetic_overstatement: [],
  };
}

export function createClaim(statement: string, confidence: Claim['confidence'], basis?: string): Claim {
  return { statement, confidence, ...(basis ? { basis } : {}) };
}

export function createListeningOutputDraft(params: {
  objectListenedTo: string;
  inputType: InputType;
  mode: ListeningMode;
}): ListeningOutput {
  return {
    object_listened_to: params.objectListenedTo,
    input_type: params.inputType,
    listening_mode: params.mode,
    listening_claims: createEmptyClaimTaxonomy(),
    what_appears: [],
    what_remains_hidden: [],
    mediations: createEmptyMediations(),
    risks: createEmptyRisks(),
    main_reading: '',
    alternative_reading: '',
    recommended_next_mode: 'undetermined',
  };
}

export function createReferenceListeningContext(request: ListeningRequest): ListeningContext {
  const hasAudio = Boolean(request.audioInspection);
  const hasText = Boolean(request.prompt?.trim());
  const sources: ListeningContext['sources_of_listening'] = [];

  if (hasAudio) sources.push('audio', 'dsp', 'metadata');
  if (request.inputType === 'transcript') sources.push('transcript');
  else if (request.inputType === 'video') sources.push('audiovisual');
  else if (hasText) sources.push('context');
  if (sources.length === 0) sources.push('none');

  const scales: ListeningContext['auditory_scales'] = hasAudio
    ? ['frame', 'event', 'scene']
    : request.inputType === 'archive_note'
      ? ['archive']
      : request.inputType === 'field_note' || request.inputType === 'video'
        ? ['scene']
        : ['unknown'];

  return {
    contract: 'akouo/listening-context/v1',
    position: {
      relation_to_object: hasAudio
        ? 'local browser-side signal inspection and routed interpretation'
        : 'remote text-side reading of supplied description or metadata',
      limitations: [
        'No calibrated playback level or embodied listening context is available.',
        'The browser reference app cannot verify an originating source from signal resemblance alone.',
      ],
    },
    apertures: [
      {
        id: 'browser-audio-decode',
        kind: 'direct_audio',
        status: hasAudio ? 'degraded' : 'unavailable',
        description: hasAudio
          ? 'The browser decoded local audio for bounded DSP; no audio-native semantic model was used.'
          : 'No audio file was supplied to the reference app.',
        limits: ['No calibrated SPL.', 'No verified capture chain.'],
      },
      {
        id: 'browser-signal-measurement',
        kind: 'signal_measurement',
        status: hasAudio ? 'available' : 'unavailable',
        description: 'Local Web Audio measurements within the limits reported by signal inspection.',
      },
      {
        id: 'supplied-text',
        kind: request.inputType === 'transcript' ? 'transcript' : 'contextual_note',
        status: hasText ? 'available' : 'unavailable',
        description: 'User-supplied text is treated as attributed context, not as direct acoustic measurement.',
      },
      {
        id: 'stored-memory',
        kind: 'memory',
        status: 'unavailable',
        description: 'The standalone browser reference app has no Akousmata store attached.',
      },
    ],
    auditory_scales: scales,
    sources_of_listening: [...new Set(sources)],
    participants: [
      {
        id: 'akouo-browser-reference',
        type: 'agent',
        role: 'routed reference listener',
      },
    ],
    action_authority: {
      mode: 'observe_only',
      scopes: ['describe', 'measure_local_signal', 'recommend_next_listening'],
      granted_by: 'current user request',
      requires_confirmation: true,
      reversible: true,
    },
    honest_absences: [
      ...(!hasAudio
        ? [{
            kind: 'unavailable' as const,
            subject: 'audio signal',
            attributed_to: 'input boundary',
            count: 1,
          }]
        : [{
            kind: 'not_retained' as const,
            subject: 'raw audio',
            attributed_to: 'local browser reference app',
            count: 1,
          }]),
    ],
  };
}
