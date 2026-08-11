const CLAIM_CATEGORIES = [
  'heard',
  'measured',
  'inferred',
  'interpreted',
  'speculative',
  'undetermined',
];

/**
 * Validate cross-references and embodied-hearing boundaries that JSON Schema
 * cannot express. The function is intentionally pure so release validation and
 * integration fixtures can exercise the same rules without changing akouo/v0.9.
 */
export function validateListeningSemantics(value, path = 'listening_output') {
  const errors = [];
  const context = objectOrEmpty(value?.listening_context);
  const provenance = objectOrEmpty(value?.listening_provenance);

  const participants = indexUnique(
    arrayOrEmpty(context.participants),
    'id',
    `${path}.listening_context.participants`,
    errors,
  );
  const apertures = indexUnique(
    arrayOrEmpty(context.apertures),
    'id',
    `${path}.listening_context.apertures`,
    errors,
  );
  const sources = indexUnique(
    arrayOrEmpty(provenance.listening_sources),
    'id',
    `${path}.listening_provenance.listening_sources`,
    errors,
  );

  const passes = indexScopedUnique(
    [
      [arrayOrEmpty(context.listening_passes), `${path}.listening_context.listening_passes`],
      [arrayOrEmpty(value?.listening_passes), `${path}.listening_passes`],
    ],
    'id',
    errors,
  );
  const decisions = indexScopedUnique(
    [
      [arrayOrEmpty(context.route_decisions), `${path}.listening_context.route_decisions`],
      [arrayOrEmpty(value?.route_decisions), `${path}.route_decisions`],
    ],
    'id',
    errors,
  );

  const claims = new Map();
  const claimEntries = [];
  for (const category of CLAIM_CATEGORIES) {
    for (const [index, claim] of arrayOrEmpty(value?.listening_claims?.[category]).entries()) {
      const claimPath = `${path}.listening_claims.${category}[${index}]`;
      claimEntries.push({ category, claim, path: claimPath });
      if (typeof claim?.claim_id !== 'string' || claim.claim_id.length === 0) continue;
      if (claims.has(claim.claim_id)) {
        errors.push(`${claimPath}.claim_id: duplicate claim id ${JSON.stringify(claim.claim_id)}`);
      } else {
        claims.set(claim.claim_id, { value: claim, path: claimPath });
      }
    }
  }

  for (const { value: pass, path: passPath } of passes.values()) {
    const participant = participants.get(pass?.listener_id);
    if (!participant) {
      errors.push(`${passPath}.listener_id: unresolved participant ${JSON.stringify(pass?.listener_id)}`);
    }

    for (const [index, claimRef] of arrayOrEmpty(pass?.claim_refs).entries()) {
      if (!claims.has(claimRef)) {
        errors.push(`${passPath}.claim_refs[${index}]: unresolved claim ${JSON.stringify(claimRef)}`);
      }
    }
    for (const [index, decisionRef] of arrayOrEmpty(pass?.decision_refs).entries()) {
      if (!decisions.has(decisionRef)) {
        errors.push(`${passPath}.decision_refs[${index}]: unresolved route decision ${JSON.stringify(decisionRef)}`);
      }
    }
    for (const [index, influence] of arrayOrEmpty(pass?.influenced_by).entries()) {
      const influencePath = `${passPath}.influenced_by[${index}].pass_id`;
      if (!passes.has(influence?.pass_id)) {
        errors.push(`${influencePath}: unresolved listening pass ${JSON.stringify(influence?.pass_id)}`);
      } else if (influence.pass_id === pass.id) {
        errors.push(`${influencePath}: a listening pass cannot influence itself`);
      }
    }
    if (typeof pass?.revision_of === 'string' && !passes.has(pass.revision_of)) {
      errors.push(`${passPath}.revision_of: unresolved listening pass ${JSON.stringify(pass.revision_of)}`);
    }
  }

  for (const { category, claim, path: claimPath } of claimEntries) {
    const pass = typeof claim?.listening_pass_id === 'string'
      ? passes.get(claim.listening_pass_id)
      : undefined;
    if (typeof claim?.listening_pass_id === 'string' && !pass) {
      errors.push(`${claimPath}.listening_pass_id: unresolved listening pass ${JSON.stringify(claim.listening_pass_id)}`);
    }

    if (category !== 'heard') continue;

    if (claim?.source !== 'human') {
      errors.push(`${claimPath}.source: heard claims require source "human"`);
    }
    if (typeof claim?.listening_pass_id !== 'string') {
      errors.push(`${claimPath}.listening_pass_id: heard claims require an attributable listening pass`);
    } else if (pass) {
      const participant = participants.get(pass.value?.listener_id)?.value;
      if (participant?.type !== 'human' || participant?.standing !== 'listener') {
        errors.push(`${claimPath}.listening_pass_id: heard claims require a human participant with listener standing`);
      }
    }

    const evidenceRefs = arrayOrEmpty(claim?.evidence_refs);
    const hasHumanReport = evidenceRefs.some((ref) => sources.get(ref)?.value?.kind === 'human_report');
    if (!hasHumanReport) {
      errors.push(`${claimPath}.evidence_refs: heard claims require a human_report listening source`);
    }

    for (const [index, apertureRef] of arrayOrEmpty(claim?.aperture_refs).entries()) {
      if (!apertures.has(apertureRef)) {
        errors.push(`${claimPath}.aperture_refs[${index}]: unresolved aperture ${JSON.stringify(apertureRef)}`);
      }
    }
  }

  const ensemble = value?.ensemble;
  if (ensemble && typeof ensemble === 'object' && !Array.isArray(ensemble)) {
    for (const [index, participantId] of arrayOrEmpty(ensemble.participant_ids).entries()) {
      if (!participants.has(participantId)) {
        errors.push(`${path}.ensemble.participant_ids[${index}]: unresolved participant ${JSON.stringify(participantId)}`);
      }
    }
    for (const [index, passId] of arrayOrEmpty(ensemble.listening_pass_ids).entries()) {
      if (!passes.has(passId)) {
        errors.push(`${path}.ensemble.listening_pass_ids[${index}]: unresolved listening pass ${JSON.stringify(passId)}`);
      }
    }
    for (const [index, edge] of arrayOrEmpty(ensemble.influence_edges).entries()) {
      const edgePath = `${path}.ensemble.influence_edges[${index}]`;
      if (!passes.has(edge?.from_pass_id)) {
        errors.push(`${edgePath}.from_pass_id: unresolved listening pass ${JSON.stringify(edge?.from_pass_id)}`);
      }
      if (!passes.has(edge?.to_pass_id)) {
        errors.push(`${edgePath}.to_pass_id: unresolved listening pass ${JSON.stringify(edge?.to_pass_id)}`);
      }
      if (edge?.from_pass_id === edge?.to_pass_id) {
        errors.push(`${edgePath}: a listening pass cannot influence itself`);
      }
    }
  }

  if (context.ensemble_ref !== undefined && context.ensemble_ref !== null) {
    if (!ensemble || ensemble.id !== context.ensemble_ref) {
      errors.push(`${path}.listening_context.ensemble_ref: unresolved ensemble ${JSON.stringify(context.ensemble_ref)}`);
    }
  }

  return errors;
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function objectOrEmpty(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function indexUnique(items, key, path, errors) {
  const indexed = new Map();
  for (const [index, item] of items.entries()) {
    const id = item?.[key];
    if (typeof id !== 'string' || id.length === 0) continue;
    if (indexed.has(id)) {
      errors.push(`${path}[${index}].${key}: duplicate id ${JSON.stringify(id)}`);
    } else {
      indexed.set(id, { value: item, path: `${path}[${index}]` });
    }
  }
  return indexed;
}

function indexScopedUnique(scopes, key, errors) {
  const indexed = new Map();
  for (const [items, path] of scopes) {
    for (const [index, item] of items.entries()) {
      const id = item?.[key];
      if (typeof id !== 'string' || id.length === 0) continue;
      const itemPath = `${path}[${index}]`;
      const previous = indexed.get(id);
      if (!previous) {
        indexed.set(id, { value: item, path: itemPath });
      } else if (stableJson(previous.value) !== stableJson(item)) {
        errors.push(`${itemPath}.${key}: conflicts with ${previous.path}.${key} for id ${JSON.stringify(id)}`);
      }
    }
  }
  return indexed;
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}
