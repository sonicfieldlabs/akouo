import type {
  Claim,
  ClaimTaxonomy,
  InputType,
  ListeningMode,
  ListeningOutput,
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
