export const claimCategories = [
  'heard',
  'measured',
  'inferred',
  'interpreted',
  'speculative',
  'undetermined',
] as const;

export type ClaimCategory = (typeof claimCategories)[number];

export type Confidence = 'high' | 'medium' | 'low' | 'undetermined';

export interface Claim {
  statement: string;
  confidence: Confidence;
  basis?: string;
}

export type ClaimTaxonomy = Record<ClaimCategory, Claim[]>;

export const inputTypes = [
  'audio_file',
  'sound_prompt',
  'transcript',
  'field_note',
  'archive_note',
  'dataset_description',
  'spectrogram',
  'waveform',
  'video',
  'metadata',
  'model_output',
  'mixed',
  'unknown',
  'other',
] as const;

export type InputType = (typeof inputTypes)[number];

export const listeningModes = [
  'signal-inspection-listening',
  'acoulogical-object-listening',
  'embodied-affective-listening',
  'transductive-media-listening',
  'forensic-archival-listening',
  'ecological-posthuman-listening',
  'critical-political-listening',
  'musical-aesthetic-listening',
  'symbolic-fictional-listening',
  'audiovisual-scenic-listening',
  'voice-speech-listening',
  'accessibility-normative-listening',
  'material-event-listening',
] as const;

export type ListeningMode = (typeof listeningModes)[number];

export const comparativeModeKeys = {
  'signal-inspection-listening': 'signal_inspection',
  'acoulogical-object-listening': 'acoulogical_object',
  'embodied-affective-listening': 'embodied_affective',
  'transductive-media-listening': 'transductive_media',
  'forensic-archival-listening': 'forensic_archival',
  'ecological-posthuman-listening': 'ecological_posthuman',
  'critical-political-listening': 'critical_political',
  'musical-aesthetic-listening': 'musical_aesthetic',
  'symbolic-fictional-listening': 'symbolic_fictional',
  'audiovisual-scenic-listening': 'audiovisual_scenic',
  'voice-speech-listening': 'voice_speech',
  'accessibility-normative-listening': 'accessibility_normative',
  'material-event-listening': 'material_event',
} as const;

export type ComparativeModeKey = (typeof comparativeModeKeys)[ListeningMode];

export type ComparativeModeComparison = Record<ComparativeModeKey, ListeningOutput>;

export const skillIds = ['akouo-router', ...listeningModes, 'reference-layer'] as const;

export type SkillId = (typeof skillIds)[number];

export const commandNames = [
  '/listen',
  '/full-ear',
  '/study',
  '/tech',
  '/reference',
  '/litany',
  '/fiction',
  '/forensic',
  '/transduce',
  '/one-sound-many-ears',
  '/voice',
  '/audiovision',
  '/access',
  '/field',
  '/method',
  '/route',
] as const;

export type CommandName = (typeof commandNames)[number];

export interface Mediations {
  technical: string[];
  cultural: string[];
  spatial: string[];
  bodily: string[];
  archival: string[];
  computational: string[];
}

export interface Risks {
  hallucination: string[];
  over_identification: string[];
  cultural_flattening: string[];
  forensic_overreach: string[];
  source_confusion: string[];
  aesthetic_overstatement: string[];
}

export interface ListeningOutput {
  object_listened_to: string;
  input_type: InputType;
  listening_mode: ListeningMode;
  listening_claims: ClaimTaxonomy;
  what_appears: string[];
  what_remains_hidden: string[];
  mediations: Mediations;
  risks: Risks;
  main_reading: string;
  alternative_reading: string;
  recommended_next_mode: ListeningMode | 'none' | 'undetermined';
}

export interface RouterOutput {
  object_listened_to: string;
  input_type: InputType;
  user_intent: string;
  available_evidence: string[];
  unavailable_evidence: string[];
  primary_mode: ListeningMode;
  secondary_mode: ListeningMode;
  corrective_mode: ListeningMode;
  route_reasoning: string[];
  risks: string[];
  must_not_assume: string[];
  recommended_command: CommandName;
  recommended_next_mode: ListeningMode;
}

export interface CommandDefinition {
  name: CommandName;
  label: string;
  description: string;
  skillsCalled: SkillId[];
  executionOrder: string[];
  outputSchema: string;
}

export interface CommandOutput {
  command: CommandName;
  object_listened_to: string;
  input_type: InputType;
  skills_called: SkillId[];
  execution_order: string[];
  router_output?: RouterOutput;
  outputs: ListeningOutput[];
  synthesis: string;
  claim_summary: ClaimTaxonomy;
  reference_map?: ReferenceMap;
  risks: string[];
  recommended_next_mode: ListeningMode | 'none' | 'undetermined';
}

export interface ReferenceMap {
  concepts_triggered: string[];
  sonic_methodologies: string[];
  authors_or_traditions: string[];
  possible_research_routes: string[];
  research_questions: string[];
  cautions: string[];
  adjacent_modes: ListeningMode[];
}

export interface ComparativeListeningOutput {
  command: '/one-sound-many-ears';
  sound_object: string;
  input_type: InputType;
  mode_comparison: ComparativeModeComparison;
  shared_claim_summary: ClaimTaxonomy;
  contradictions: string[];
  productive_tensions: string[];
  most_responsible_reading: string;
  most_interesting_next_mode: ListeningMode | 'none' | 'undetermined';
}

export type CommandResult = CommandOutput | ComparativeListeningOutput;

export interface ListeningRequest {
  objectName: string;
  inputType: InputType;
  prompt?: string;
  command?: CommandName;
  metadata?: Record<string, string>;
  audioInspection?: AudioInspection;
}

export interface AudioInspection {
  fileName: string;
  fileType: string;
  fileSize: number;
  durationSeconds: number | null;
  sampleRate: number | null;
  channelCount: number | null;
  features?: AudioFeatures;
  measuredClaims: Claim[];
  warnings: string[];
}

export interface AudioFeatures {
  peakDbfs: number | null;
  rmsDbfs: number | null;
  crestFactorDb: number | null;
  silenceRatio: number | null;
  zeroCrossingRate: number | null;
  dcOffset: number | null;
  spectralCentroidHz: number | null;
  spectralRolloffHz: number | null;
  spectralFlatness: number | null;
}
