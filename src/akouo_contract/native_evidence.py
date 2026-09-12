"""Offline native evidence validation plus mandatory host reference/access admission."""
from .validation import contract_errors


def native_evidence_errors(value, *, resolve_reference=None, admit_access=None, schemas_dir=None):
    errors = contract_errors('agent-native-evidence', value, schemas_dir=schemas_dir)
    if errors: return errors
    groups = {k: {x['id']: x for x in value[k]} for k in ('clocks','evidence_objects','apertures','observations','relations','human_projections')}
    ids = [x['id'] for k in groups for x in value[k]]
    if len(ids) != len(set(ids)): errors.append('Duplicate identity')
    native = {**groups['evidence_objects'], **groups['observations']}
    def ref(identifier, allowed):
        if identifier not in allowed: errors.append('Unresolved reference: '+identifier)
    def external(identifier):
        if not callable(resolve_reference) or resolve_reference(identifier) is not True:
            errors.append('Host reference unvalidated: '+identifier)
    for e in value['evidence_objects']:
        ref(e['clock_id'], groups['clocks']); external(e['artifact_ref'])
        for p in e['parent_ids']:
            ref(p, groups['evidence_objects'])
            if p == e['id']: errors.append('Self parent')
    for a in value['apertures']:
        ref(a['evidence_id'], groups['evidence_objects']); external(a['observer_ref'])
    for o in value['observations']:
        ref(o['evidence_id'], groups['evidence_objects']); ref(o['clock_id'], groups['clocks']); ref(o['aperture_id'], groups['apertures'])
        a = groups['apertures'].get(o['aperture_id'], {})
        if a.get('evidence_id') != o['evidence_id']: errors.append('Aperture/evidence mismatch')
        e = groups['evidence_objects'].get(o['evidence_id'], {})
        if e.get('clock_id') != o['clock_id']: errors.append('Observation clock differs from source clock')
        if o['source_interval_s'][0] >= o['source_interval_s'][1]: errors.append('Invalid observation interval')
        observers = [x['observer_ref'] for x in o['access']]
        if len(observers) != len(set(observers)): errors.append('Duplicate observer access')
        for entry in o['access']:
            external(entry['observer_ref'])
            if not callable(admit_access) or admit_access(o, entry) is not True: errors.append('Observer access unvalidated')
        for key in ('external_claim_ref','external_pass_ref'):
            if key in o: external(o[key])
    for r in value['relations']:
        ref(r['from_ref'], native); ref(r['to_ref'], native)
        for e in r['evidence_refs']: ref(e, native)
        if 'external_claim_ref' in r: external(r['external_claim_ref'])
    for p in value['human_projections']:
        for r in p['source_refs']: ref(r, native)
        for key in ('artifact_ref','authorization_ref'):
            if key in p: external(p[key])
    # Parent cycles cannot establish independent evidence.
    def visit(identifier, trail):
        if identifier in trail: return True
        return any(visit(parent, trail | {identifier}) for parent in groups['evidence_objects'].get(identifier, {}).get('parent_ids', []) if parent in groups['evidence_objects'])
    if any(visit(identifier, set()) for identifier in groups['evidence_objects']): errors.append('Cyclic evidence ancestry')
    return errors
