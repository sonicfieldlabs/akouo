#!/usr/bin/env node
// Run the reference app's router (router.ts, its types stripped by Node) over shared cases and keep its
// roles and confidence as the fixture akouo_contract.router must match. --check fails on drift.
import { mkdtempSync, readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Strip the types from the three modules the router needs with Node's own type stripping; no
// bundler. TypeScript 7's package no longer offers the JavaScript transpile API.
const root = new URL('..', import.meta.url).pathname;
const out = mkdtempSync(join(tmpdir(), 'akouo-router-'));
for (const name of ['router', 'textMatch', 'types']) {
  const source = readFileSync(join(root, `app/src/akouo/${name}.ts`), 'utf8');
  const outputText = stripTypeScriptTypes(source);
  writeFileSync(join(out, `${name}.mjs`), outputText
    .replace(/from '\.\/routerRules\.json';/, "from './routerRules.json' with { type: 'json' };")
    .replace(/from '\.\/(types|textMatch)'/g, "from './$1.mjs'"));
}
copyFileSync(join(root, 'app/src/akouo/routerRules.json'), join(out, 'routerRules.json'));
const { createRouteDraft, createRoutingPlan } = await import(join(out, 'router.mjs'));
const cases = JSON.parse(readFileSync(join(root, 'tests/fixtures/router-cases.json'), 'utf8'));
const results = cases.map((c) => {
  const request = { objectName: c.object_name ?? '', prompt: c.prompt ?? '', inputType: c.input_type ?? 'unknown', command: c.command ?? undefined,
    audioInspection: c.audio_inspection ? { fileName: 'x.wav', durationSeconds: 10, features: null } : undefined };
  const draft = createRouteDraft(request);
  const plan = createRoutingPlan(request);
  return { name: c.name, primary: draft.primary_mode, secondary: draft.secondary_mode, corrective: draft.corrective_mode, confidence: plan.route_confidence, route_reasoning: draft.route_reasoning };
});
const path = join(root, 'tests/fixtures/router-parity.json');
const text = JSON.stringify(results, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (!existsSync(path) || readFileSync(path, 'utf8') !== text) { console.error('router parity fixture is stale; run node scripts/router-parity.mjs'); process.exit(1); }
  console.log(`router parity: ${results.length} cases match the reference app`);
} else { writeFileSync(path, text); console.log(`wrote ${results.length} reference routes`); }
