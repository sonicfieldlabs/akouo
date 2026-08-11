import assert from 'node:assert/strict';
import test from 'node:test';

import { validateListeningSemantics } from './listening-semantics.mjs';

function validHumanHearing() {
  return {
    listening_claims: {
      heard: [{
        claim_id: 'claim-human',
        statement: 'A short pulse was present to the listener.',
        confidence: 'medium',
        source: 'human',
        evidence_refs: ['source-human'],
        aperture_refs: ['aperture-human'],
        listening_pass_id: 'pass-human',
      }],
      measured: [],
      inferred: [],
      interpreted: [],
      speculative: [],
      undetermined: [],
    },
    listening_context: {
      participants: [{ id: 'listener-human', type: 'human', standing: 'listener' }],
      apertures: [{ id: 'aperture-human', kind: 'direct_audio' }],
      listening_passes: [{
        id: 'pass-human',
        listener_id: 'listener-human',
        claim_refs: ['claim-human'],
        decision_refs: [],
        influenced_by: [],
      }],
      route_decisions: [],
    },
    listening_provenance: {
      listening_sources: [{ id: 'source-human', kind: 'human_report' }],
    },
  };
}

test('accepts an attributable human heard claim', () => {
  assert.deepEqual(validateListeningSemantics(validHumanHearing()), []);
});

test('rejects heard claims attributed to an agent or sensor pass', () => {
  for (const type of ['agent', 'sensor']) {
    const output = validHumanHearing();
    output.listening_context.participants[0].type = type;
    assert.ok(
      validateListeningSemantics(output).some((error) => error.includes('human participant with listener standing')),
      `expected ${type} heard attribution to fail`,
    );
  }
});

test('rejects non-human heard sources', () => {
  const output = validHumanHearing();
  output.listening_claims.heard[0].source = 'model';
  output.listening_provenance.listening_sources[0].kind = 'model';
  const errors = validateListeningSemantics(output);
  assert.ok(errors.some((error) => error.includes('require source "human"')));
  assert.ok(errors.some((error) => error.includes('human_report listening source')));
});

test('rejects unresolved participant, claim, pass, decision, revision, and influence references', () => {
  const output = validHumanHearing();
  output.listening_context.listening_passes[0].listener_id = 'missing-listener';
  output.listening_context.listening_passes[0].claim_refs.push('missing-claim');
  output.listening_context.listening_passes[0].decision_refs.push('missing-decision');
  output.listening_context.listening_passes[0].revision_of = 'missing-revision-pass';
  output.listening_claims.heard[0].listening_pass_id = 'missing-pass';
  output.listening_context.listening_passes[0].influenced_by = [{ pass_id: 'missing-pass' }];
  const errors = validateListeningSemantics(output);
  assert.ok(errors.some((error) => error.includes('unresolved participant')));
  assert.ok(errors.some((error) => error.includes('unresolved claim')));
  assert.ok(errors.some((error) => error.includes('unresolved route decision')));
  assert.ok(errors.some((error) => error.includes('unresolved listening pass')));
});

test('rejects unresolved ensemble influence endpoints', () => {
  const output = validHumanHearing();
  output.ensemble = {
    id: 'invalid-swarm',
    kind: 'ear_swarm',
    participant_ids: ['listener-human'],
    listening_pass_ids: ['pass-human'],
    influence_edges: [{ from_pass_id: 'pass-human', to_pass_id: 'missing-pass' }],
  };
  assert.ok(
    validateListeningSemantics(output).some((error) => error.includes('to_pass_id: unresolved listening pass')),
  );
});

test('does not infer influence or a swarm from plural or linked records', () => {
  const output = validHumanHearing();
  output.listening_claims.inferred.push({
    claim_id: 'claim-agent',
    listening_pass_id: 'pass-agent',
  });
  output.listening_context.participants.push({ id: 'listener-agent', type: 'agent', standing: 'listener' });
  output.listening_context.listening_passes.push({
    id: 'pass-agent',
    listener_id: 'listener-agent',
    claim_refs: ['claim-agent'],
    decision_refs: [],
    influenced_by: [],
  });
  output.memory = { akousmata_refs: ['linked-agent-record'] };
  output.ensemble = {
    id: 'plural-reports',
    kind: 'plural_listening',
    participant_ids: ['listener-human', 'listener-agent'],
    listening_pass_ids: ['pass-human', 'pass-agent'],
    influence_edges: [],
  };
  assert.deepEqual(validateListeningSemantics(output), []);
});
