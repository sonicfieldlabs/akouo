#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.argv[2] ?? new URL('..', import.meta.url).pathname;
const schemasDir = join(repoRoot, 'schemas');
const examplesDir = join(repoRoot, 'examples');

const listeningSchema = readJson(join(schemasDir, 'listening-output.schema.json'));
const claimSchema = readJson(join(schemasDir, 'claim-taxonomy.schema.json'));
const routerSchema = readJson(join(schemasDir, 'router-output.schema.json'));
const routingPlanSchema = readJson(join(schemasDir, 'routing-plan.schema.json'));

const inputTypes = new Set(listeningSchema.$defs.input_type.enum);
const listeningModes = new Set(listeningSchema.$defs.listening_mode.enum);
const confidenceValues = new Set(claimSchema.$defs.confidence.enum);
const commandValues = new Set(routerSchema.$defs.command.enum);
const evidenceLevels = new Set(routingPlanSchema.properties.evidence_level.enum);
const routeConfidenceValues = new Set(routingPlanSchema.properties.route_confidence.enum);
const modeRoles = new Set(routingPlanSchema.properties.mode_chain.items.properties.role.enum);
const claimCategories = claimSchema.required;
const mediationKeys = listeningSchema.$defs.mediations.required;
const riskKeys = listeningSchema.$defs.risks.required;

const errors = [];

validateReferenceMap(readJson(join(examplesDir, 'reference-map-example.json')), 'examples/reference-map-example.json');
validateRoutingPlan(readJson(join(examplesDir, 'routing-plan-example.json')), 'examples/routing-plan-example.json');

const listeningExamples = readJson(join(examplesDir, 'v0.4-expanded-listening-examples.json'));
if (!Array.isArray(listeningExamples.examples) || listeningExamples.examples.length === 0) {
  errors.push('examples/v0.4-expanded-listening-examples.json: expected non-empty examples array');
} else {
  listeningExamples.examples.forEach((example, index) => validateListeningOutput(example, `examples/v0.4-expanded-listening-examples.json#/examples/${index}`));
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`  ERROR: ${error}`);
  }
  process.exit(1);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function validateReferenceMap(value, path) {
  expectExactKeys(value, ['concepts_triggered', 'sonic_methodologies', 'authors_or_traditions', 'possible_research_routes', 'research_questions', 'cautions', 'adjacent_modes'], path);
  for (const key of ['concepts_triggered', 'sonic_methodologies', 'authors_or_traditions', 'possible_research_routes', 'research_questions', 'cautions']) {
    expectTextArray(value[key], `${path}.${key}`);
  }
  expectArray(value.adjacent_modes, `${path}.adjacent_modes`);
  for (const [index, mode] of value.adjacent_modes.entries()) {
    expectEnum(mode, listeningModes, `${path}.adjacent_modes[${index}]`);
  }
}

function validateRoutingPlan(value, path) {
  expectExactKeys(value, ['object_listened_to', 'input_type', 'route_confidence', 'evidence_level', 'mode_chain', 'claim_permissions', 'agent_handoff', 'stop_conditions'], path);
  expectNonEmptyString(value.object_listened_to, `${path}.object_listened_to`);
  expectEnum(value.input_type, inputTypes, `${path}.input_type`);
  expectEnum(value.route_confidence, routeConfidenceValues, `${path}.route_confidence`);
  expectEnum(value.evidence_level, evidenceLevels, `${path}.evidence_level`);
  expectArray(value.mode_chain, `${path}.mode_chain`, 1);
  value.mode_chain.forEach((item, index) => {
    const itemPath = `${path}.mode_chain[${index}]`;
    expectExactKeys(item, ['mode', 'role', 'reason'], itemPath);
    expectEnum(item.mode, listeningModes, `${itemPath}.mode`);
    expectEnum(item.role, modeRoles, `${itemPath}.role`);
    expectNonEmptyString(item.reason, `${itemPath}.reason`);
  });
  expectExactKeys(value.claim_permissions, ['heard_allowed', 'measured_allowed', 'inferred_allowed', 'interpreted_allowed', 'speculative_allowed', 'must_include_undetermined'], `${path}.claim_permissions`);
  for (const key of Object.keys(value.claim_permissions ?? {})) {
    if (typeof value.claim_permissions[key] !== 'boolean') errors.push(`${path}.claim_permissions.${key}: expected boolean`);
  }
  expectExactKeys(value.agent_handoff, ['summary', 'required_inputs', 'forbidden_assumptions', 'recommended_command'], `${path}.agent_handoff`);
  expectNonEmptyString(value.agent_handoff?.summary, `${path}.agent_handoff.summary`);
  expectTextArray(value.agent_handoff?.required_inputs, `${path}.agent_handoff.required_inputs`);
  expectTextArray(value.agent_handoff?.forbidden_assumptions, `${path}.agent_handoff.forbidden_assumptions`);
  expectEnum(value.agent_handoff?.recommended_command, commandValues, `${path}.agent_handoff.recommended_command`);
  expectTextArray(value.stop_conditions, `${path}.stop_conditions`);
}

function validateListeningOutput(value, path) {
  expectExactKeys(value, ['object_listened_to', 'input_type', 'listening_mode', 'listening_claims', 'what_appears', 'what_remains_hidden', 'mediations', 'risks', 'main_reading', 'alternative_reading', 'recommended_next_mode'], path);
  expectNonEmptyString(value.object_listened_to, `${path}.object_listened_to`);
  expectEnum(value.input_type, inputTypes, `${path}.input_type`);
  expectEnum(value.listening_mode, listeningModes, `${path}.listening_mode`);
  validateClaimTaxonomy(value.listening_claims, `${path}.listening_claims`);
  expectTextArray(value.what_appears, `${path}.what_appears`);
  expectTextArray(value.what_remains_hidden, `${path}.what_remains_hidden`);
  expectExactKeys(value.mediations, mediationKeys, `${path}.mediations`);
  for (const key of mediationKeys) expectTextArray(value.mediations?.[key], `${path}.mediations.${key}`);
  expectExactKeys(value.risks, riskKeys, `${path}.risks`);
  for (const key of riskKeys) expectTextArray(value.risks?.[key], `${path}.risks.${key}`);
  expectString(value.main_reading, `${path}.main_reading`);
  expectString(value.alternative_reading, `${path}.alternative_reading`);
  if (value.recommended_next_mode !== 'none' && value.recommended_next_mode !== 'undetermined') {
    expectEnum(value.recommended_next_mode, listeningModes, `${path}.recommended_next_mode`);
  }
}

function validateClaimTaxonomy(value, path) {
  expectExactKeys(value, claimCategories, path);
  for (const category of claimCategories) {
    expectArray(value?.[category], `${path}.${category}`);
    value?.[category]?.forEach((claim, index) => {
      const claimPath = `${path}.${category}[${index}]`;
      expectAllowedKeys(claim, ['statement', 'confidence', 'basis'], claimPath);
      expectNonEmptyString(claim.statement, `${claimPath}.statement`);
      expectEnum(claim.confidence, confidenceValues, `${claimPath}.confidence`);
      if ('basis' in claim) expectString(claim.basis, `${claimPath}.basis`);
    });
  }
}

function expectExactKeys(value, keys, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${path}: expected object`);
    return;
  }
  expectAllowedKeys(value, keys, path);
  for (const key of keys) {
    if (!(key in value)) errors.push(`${path}: missing ${key}`);
  }
}

function expectAllowedKeys(value, keys, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${path}: expected object`);
    return;
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) errors.push(`${path}: unexpected ${key}`);
  }
}

function expectTextArray(value, path) {
  expectArray(value, path);
  value?.forEach((item, index) => expectNonEmptyString(item, `${path}[${index}]`));
}

function expectArray(value, path, minItems = 0) {
  if (!Array.isArray(value)) {
    errors.push(`${path}: expected array`);
    return;
  }
  if (value.length < minItems) errors.push(`${path}: expected at least ${minItems} item(s)`);
}

function expectEnum(value, allowed, path) {
  if (typeof value !== 'string' || !allowed.has(value)) {
    errors.push(`${path}: unexpected value ${JSON.stringify(value)}`);
  }
}

function expectNonEmptyString(value, path) {
  if (typeof value !== 'string' || value.length === 0) {
    errors.push(`${path}: expected non-empty string`);
  }
}

function expectString(value, path) {
  if (typeof value !== 'string') {
    errors.push(`${path}: expected string`);
  }
}
