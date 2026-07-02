import type { ListeningMode, SkillId } from './types';

export interface SkillDefinition {
  id: SkillId;
  label: string;
  mode?: ListeningMode;
  purpose: string;
  guardrail: string;
}

export const skillDefinitions: SkillDefinition[] = [
  {
    id: 'akouo-router',
    label: 'Router',
    purpose: 'Selects primary, secondary, and corrective listening modes before analysis begins.',
    guardrail: 'The router analyzes the listening situation, not the sound itself.',
  },
  {
    id: 'signal-inspection-listening',
    label: 'Signal inspection',
    mode: 'signal-inspection-listening',
    purpose: 'Inspects file, waveform, spectrogram, dynamics, frequency, stereo, and artifacts.',
    guardrail: 'Signal evidence can support interpretation, but it cannot prove meaning by itself.',
  },
  {
    id: 'acoulogical-object-listening',
    label: 'Acoulogical object',
    mode: 'acoulogical-object-listening',
    purpose: 'Describes the auditum before collapsing it into source, meaning, or mood.',
    guardrail: 'Reduced listening brackets source and meaning temporarily. It is not a pure ear.',
  },
  {
    id: 'embodied-affective-listening',
    label: 'Embodied affective',
    mode: 'embodied-affective-listening',
    purpose: 'Listens for pressure, vibration, fatigue, pleasure, dread, propulsion, and bodily force.',
    guardrail: 'Never universalize bodily response across listeners, rooms, volumes, and histories.',
  },
  {
    id: 'transductive-media-listening',
    label: 'Transductive media',
    mode: 'transductive-media-listening',
    purpose: 'Maps how sound is transformed through capture, encoding, sensors, platforms, or models.',
    guardrail: 'Mediated sound is not direct access to its source domain.',
  },
  {
    id: 'forensic-archival-listening',
    label: 'Forensic archival',
    mode: 'forensic-archival-listening',
    purpose: 'Treats sound as trace, testimony, archive, damage, silence, or reconstruction.',
    guardrail: 'Never invent evidence. Leave speculative claims empty unless explicitly separated.',
  },
  {
    id: 'ecological-posthuman-listening',
    label: 'Ecological posthuman',
    mode: 'ecological-posthuman-listening',
    purpose: 'Decenters the human listener across habitat, nonhuman agency, weather, sensors, and scale.',
    guardrail: 'Do not romanticize nature or erase infrastructure, extraction, and fieldwork ethics.',
  },
  {
    id: 'critical-political-listening',
    label: 'Critical political',
    mode: 'critical-political-listening',
    purpose: 'Names concrete mediations, exclusions, infrastructures, markets, labor, and power stakes.',
    guardrail: 'Critique must not become automatic accusation or generic theoretical decoration.',
  },
  {
    id: 'musical-aesthetic-listening',
    label: 'Musical aesthetic',
    mode: 'musical-aesthetic-listening',
    purpose: 'Describes rhythm, pitch, harmony, timbre, texture, form, production aesthetics, and creative usefulness.',
    guardrail: 'Do not replace musical detail with genre labels, cultural overreach, or ungrounded poetry.',
  },
  {
    id: 'symbolic-fictional-listening',
    label: 'Symbolic fictional',
    mode: 'symbolic-fictional-listening',
    purpose: 'Builds declared sonic fiction, myth, ritual, cosmology, dream, and possible worlds.',
    guardrail: 'Speculation must stay labeled as speculation and never become evidence.',
  },
  {
    id: 'audiovisual-scenic-listening',
    label: 'Audiovisual scenic',
    mode: 'audiovisual-scenic-listening',
    purpose: 'Maps sound-image-text-scene relations, synchronization, added value, audiovisual phrasing, and interface sound.',
    guardrail: 'Do not invent visuals from audio-only input or invent sound from visual-only input.',
  },
  {
    id: 'voice-speech-listening',
    label: 'Voice speech',
    mode: 'voice-speech-listening',
    purpose: 'Separates vocal sound, transcript content, ASR/TTS mediation, prosody, identity caution, and consent.',
    guardrail: 'A transcript is not the whole voice, and a voice is not proof of identity.',
  },
  {
    id: 'accessibility-normative-listening',
    label: 'Accessibility normative',
    mode: 'accessibility-normative-listening',
    purpose: 'Audits captions, transcripts, haptic and visual alternatives, hearing norms, sensory access, and implied listener assumptions.',
    guardrail: 'Do not assume a single normal listener, body, device, room, or language.',
  },
  {
    id: 'material-event-listening',
    label: 'Material event',
    mode: 'material-event-listening',
    purpose: 'Listens for vibration, duration, flux, resonance, material supports, propagation, pressure, and event behavior.',
    guardrail: 'Do not replace measurement with ontology or treat vibration as universally shared.',
  },
  {
    id: 'reference-layer',
    label: 'Reference layer',
    purpose: 'Maps concepts, methods, traditions, authors, cautions, and adjacent listening routes.',
    guardrail: 'Reference mapping is not bibliography dumping.',
  },
];
