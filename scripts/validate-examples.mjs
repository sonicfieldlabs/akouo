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
const manifestSchema = readJson(join(schemasDir, 'manifest.schema.json'));

const inputTypes = new Set(listeningSchema.$defs.input_type.enum);
const listeningModes = new Set(listeningSchema.$defs.listening_mode.enum);
const confidenceValues = new Set(claimSchema.$defs.confidence.enum);
const claimSources = new Set(claimSchema.$defs.claim_source.enum);
const commandValues = new Set(routerSchema.$defs.command.enum);
const evidenceLevels = new Set(routingPlanSchema.properties.evidence_level.enum);
const routeConfidenceValues = new Set(routingPlanSchema.properties.route_confidence.enum);
const modeRoles = new Set(routingPlanSchema.properties.mode_chain.items.properties.role.enum);
const budgetValues = new Set(routingPlanSchema.properties.budget.enum);
const substrateValues = new Set(listeningSchema.$defs.apparatus.properties.substrate.enum);
const listenerTypes = new Set(listeningSchema.$defs.listener.properties.type.enum);
const skillFacets = new Set(manifestSchema.properties.skills.items.properties.facets.items.enum);
const costTiers = new Set(['light', 'standard', 'deep']);
const memoryPolicies = new Set(['none', 'read', 'write', 'read_write']);
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

const memoryExample = readJson(join(examplesDir, 'v0.6-memory-lineage-example.json'));
validateListeningOutput(memoryExample.listening_output, 'examples/v0.6-memory-lineage-example.json#/listening_output');
validateRoutingPlan(memoryExample.routing_plan, 'examples/v0.6-memory-lineage-example.json#/routing_plan');

validatePresets(readJson(join(repoRoot, 'presets', 'presets.json')), 'presets/presets.json');
validateManifest(readJson(join(repoRoot, 'akouo.manifest.json')), 'akouo.manifest.json');

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
  expectRequiredAndOptionalKeys(value, ['object_listened_to', 'input_type', 'route_confidence', 'evidence_level', 'mode_chain', 'claim_permissions', 'agent_handoff', 'stop_conditions'], ['budget', 'preset_id'], path);
  if ('budget' in (value ?? {})) expectEnum(value.budget, budgetValues, `${path}.budget`);
  if ('preset_id' in (value ?? {})) expectNonEmptyString(value.preset_id, `${path}.preset_id`);
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
  expectRequiredAndOptionalKeys(value, ['object_listened_to', 'input_type', 'listening_mode', 'listening_claims', 'what_appears', 'what_remains_hidden', 'mediations', 'risks', 'main_reading', 'alternative_reading', 'recommended_next_mode'], ['akouo_version', 'apparatus', 'listener', 'memory'], path);
  if ('akouo_version' in (value ?? {})) expectNonEmptyString(value.akouo_version, `${path}.akouo_version`);
  if ('apparatus' in (value ?? {})) validateApparatus(value.apparatus, `${path}.apparatus`);
  if ('listener' in (value ?? {})) validateListener(value.listener, `${path}.listener`);
  if ('memory' in (value ?? {})) validateMemoryLinks(value.memory, `${path}.memory`);
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
      expectAllowedKeys(claim, ['statement', 'confidence', 'basis', 'source', 'time_range'], claimPath);
      expectNonEmptyString(claim.statement, `${claimPath}.statement`);
      expectEnum(claim.confidence, confidenceValues, `${claimPath}.confidence`);
      if ('basis' in claim) expectString(claim.basis, `${claimPath}.basis`);
      if ('source' in claim) expectEnum(claim.source, claimSources, `${claimPath}.source`);
      if ('time_range' in claim) {
        expectExactKeys(claim.time_range, ['start_s', 'end_s'], `${claimPath}.time_range`);
        for (const bound of ['start_s', 'end_s']) {
          if (typeof claim.time_range?.[bound] !== 'number' || claim.time_range[bound] < 0) {
            errors.push(`${claimPath}.time_range.${bound}: expected non-negative number`);
          }
        }
      }
    });
  }
}

function validateApparatus(value, path) {
  expectRequiredAndOptionalKeys(value, ['substrate', 'known_blind_spots'], ['perception_sources', 'model_ids', 'sample_rate_hz', 'channels', 'bandwidth_limit_hz', 'capture_notes'], path);
  expectEnum(value?.substrate, substrateValues, `${path}.substrate`);
  expectTextArray(value?.known_blind_spots, `${path}.known_blind_spots`);
  for (const key of ['perception_sources', 'model_ids', 'capture_notes']) {
    if (key in (value ?? {})) expectTextArray(value[key], `${path}.${key}`);
  }
  for (const key of ['sample_rate_hz', 'channels', 'bandwidth_limit_hz']) {
    if (key in (value ?? {}) && value[key] !== null && typeof value[key] !== 'number') {
      errors.push(`${path}.${key}: expected number or null`);
    }
  }
}

function validateListener(value, path) {
  expectRequiredAndOptionalKeys(value, ['type'], ['process'], path);
  expectEnum(value?.type, listenerTypes, `${path}.type`);
  if ('process' in (value ?? {})) expectNonEmptyString(value.process, `${path}.process`);
}

function validateMemoryLinks(value, path) {
  expectRequiredAndOptionalKeys(value, [], ['akousma_id', 'akousmata_refs', 'lineage_note'], path);
  if ('akousma_id' in (value ?? {}) && value.akousma_id !== null) expectNonEmptyString(value.akousma_id, `${path}.akousma_id`);
  if ('akousmata_refs' in (value ?? {})) expectTextArray(value.akousmata_refs, `${path}.akousmata_refs`);
  if ('lineage_note' in (value ?? {}) && value.lineage_note !== null) expectNonEmptyString(value.lineage_note, `${path}.lineage_note`);
}

function validatePresets(value, path) {
  expectRequiredAndOptionalKeys(value, ['akouo_version', 'description', 'presets'], [], path);
  expectArray(value?.presets, `${path}.presets`, 1);
  const seen = new Set();
  value?.presets?.forEach((preset, index) => {
    const presetPath = `${path}.presets[${index}]`;
    expectRequiredAndOptionalKeys(preset, ['id', 'name', 'description', 'command', 'mode_chain', 'cost_tier', 'memory_policy', 'enabled_by_default'], ['perception_passes'], presetPath);
    expectNonEmptyString(preset?.id, `${presetPath}.id`);
    if (seen.has(preset?.id)) errors.push(`${presetPath}.id: duplicate preset id ${preset.id}`);
    seen.add(preset?.id);
    expectNonEmptyString(preset?.name, `${presetPath}.name`);
    expectNonEmptyString(preset?.description, `${presetPath}.description`);
    expectEnum(preset?.command, commandValues, `${presetPath}.command`);
    expectArray(preset?.mode_chain, `${presetPath}.mode_chain`, 1);
    preset?.mode_chain?.forEach((item, itemIndex) => {
      const itemPath = `${presetPath}.mode_chain[${itemIndex}]`;
      expectExactKeys(item, ['mode', 'role'], itemPath);
      expectEnum(item?.mode, listeningModes, `${itemPath}.mode`);
      expectEnum(item?.role, modeRoles, `${itemPath}.role`);
    });
    expectEnum(preset?.cost_tier, costTiers, `${presetPath}.cost_tier`);
    expectEnum(preset?.memory_policy, memoryPolicies, `${presetPath}.memory_policy`);
    if ('perception_passes' in (preset ?? {})) expectTextArray(preset.perception_passes, `${presetPath}.perception_passes`);
    if (typeof preset?.enabled_by_default !== 'boolean') errors.push(`${presetPath}.enabled_by_default: expected boolean`);
  });
}

function validateManifest(value, path) {
  expectRequiredAndOptionalKeys(value, ['akouo_version', 'contract', 'description', 'skills', 'commands', 'evidence_ladder', 'command_permission_overrides', 'presets_file', 'schemas'], [], path);
  expectArray(value?.skills, `${path}.skills`, 1);
  const skillIds = new Set();
  value?.skills?.forEach((skill, index) => {
    const skillPath = `${path}.skills[${index}]`;
    expectRequiredAndOptionalKeys(skill, ['id', 'kind', 'label', 'summary', 'facets', 'cost_tier', 'memory_policy', 'corrective'], [], skillPath);
    expectNonEmptyString(skill?.id, `${skillPath}.id`);
    skillIds.add(skill?.id);
    expectEnum(skill?.kind, new Set(['router', 'mode', 'reference']), `${skillPath}.kind`);
    expectArray(skill?.facets, `${skillPath}.facets`, 1);
    skill?.facets?.forEach((facet, facetIndex) => expectEnum(facet, skillFacets, `${skillPath}.facets[${facetIndex}]`));
    expectEnum(skill?.cost_tier, costTiers, `${skillPath}.cost_tier`);
    expectEnum(skill?.memory_policy, memoryPolicies, `${skillPath}.memory_policy`);
    if (typeof skill?.corrective !== 'boolean') errors.push(`${skillPath}.corrective: expected boolean`);
    if (skill?.kind === 'mode' && !listeningModes.has(skill?.id)) errors.push(`${skillPath}.id: mode skill ${skill?.id} missing from listening_mode enum`);
  });
  for (const mode of listeningModes) {
    if (!skillIds.has(mode)) errors.push(`${path}.skills: listening mode ${mode} missing from manifest`);
  }
  const sentinelSkills = new Set(['router-selected', 'all-listening-modes']);
  const manifestCommands = new Set();
  value?.commands?.forEach((command, index) => {
    const commandPath = `${path}.commands[${index}]`;
    expectRequiredAndOptionalKeys(command, ['name', 'label', 'summary', 'chain', 'recommended_next_mode'], [], commandPath);
    expectEnum(command?.name, commandValues, `${commandPath}.name`);
    manifestCommands.add(command?.name);
    expectArray(command?.chain, `${commandPath}.chain`, 1);
    command?.chain?.forEach((item, itemIndex) => {
      const itemPath = `${commandPath}.chain[${itemIndex}]`;
      expectExactKeys(item, ['skill', 'role'], itemPath);
      if (!skillIds.has(item?.skill) && !sentinelSkills.has(item?.skill)) {
        errors.push(`${itemPath}.skill: unknown skill ${item?.skill}`);
      }
    });
    if (command?.recommended_next_mode !== 'none' && command?.recommended_next_mode !== 'undetermined') {
      expectEnum(command?.recommended_next_mode, listeningModes, `${commandPath}.recommended_next_mode`);
    }
  });
  for (const command of commandValues) {
    if (!manifestCommands.has(command)) errors.push(`${path}.commands: command ${command} missing from manifest`);
  }
  expectArray(value?.evidence_ladder, `${path}.evidence_ladder`, 1);
  const ladderLevels = new Set();
  value?.evidence_ladder?.forEach((rung, index) => {
    const rungPath = `${path}.evidence_ladder[${index}]`;
    expectRequiredAndOptionalKeys(rung, ['level', 'heard_allowed', 'measured_allowed', 'inferred_allowed', 'interpreted_allowed', 'speculative_allowed', 'must_include_undetermined', 'notes'], [], rungPath);
    expectEnum(rung?.level, evidenceLevels, `${rungPath}.level`);
    ladderLevels.add(rung?.level);
  });
  for (const level of evidenceLevels) {
    if (!ladderLevels.has(level)) errors.push(`${path}.evidence_ladder: level ${level} missing`);
  }
  for (const overrideCommand of Object.keys(value?.command_permission_overrides ?? {})) {
    expectEnum(overrideCommand, commandValues, `${path}.command_permission_overrides.${overrideCommand}`);
  }
}

function expectRequiredAndOptionalKeys(value, requiredKeys, optionalKeys, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${path}: expected object`);
    return;
  }
  expectAllowedKeys(value, [...requiredKeys, ...optionalKeys], path);
  for (const key of requiredKeys) {
    if (!(key in value)) errors.push(`${path}: missing ${key}`);
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
