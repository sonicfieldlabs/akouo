"""Claim-specific, observe-only admission. Resolution is a host callback, never payload text."""
from .validation import contract_errors


def aperture_decision(request, *, resolve_route, schemas_dir=None):
    errors = contract_errors('aperture-request', request, schemas_dir=schemas_dir)
    if errors:
        raise ValueError('; '.join(errors))
    bands = request['bands_hz']
    if any(a >= b for a, b in bands) or any(bands[i][1] > bands[i+1][0] for i in range(len(bands)-1)):
        raise ValueError('Bands must be increasing, sorted and non-overlapping')
    if request['window_s'][0] >= request['window_s'][1]:
        raise ValueError('Window must increase')
    if not callable(resolve_route):
        raise TypeError('A host route resolver is required')
    # The host resolves byte identity, scope and evidence before returning bounds.
    route = resolve_route(request['route_ref'])
    identity = isinstance(route, dict) and all(route.get(k) == request[k] for k in ('subject_ref', 'representation_ref', 'route_ref'))
    kind = request['claim_kind']
    required = ['sampled_representation', 'analysis']
    if kind == 'physical_capture': required += ['capture']
    if kind == 'model_input': required += ['model_input']
    results = []
    for band in bands:
        missing, unsupported = [], []
        if not identity:
            missing.append('Unresolved or mismatched host route identity')
        else:
            for name in required:
                block = route.get(name, {})
                if block.get('status') != 'known' or block.get('validated') is not True:
                    missing.append(name + ' evidence is unresolved')
                    continue
                support = block.get('bands_hz', [])
                if not any(a <= band[0] and band[1] <= b for a, b in support):
                    unsupported.append(name + ' does not cover requested band')
                window = block.get('window_s')
                if not window or not window[0] <= request['window_s'][0] < request['window_s'][1] <= window[1]:
                    unsupported.append(name + ' does not cover requested window')
            if kind == 'model_input' and route.get('model_input', {}).get('prepared_input_validated') is not True:
                missing.append('Prepared model input and admitted scope required')
            if kind == 'human_projection':
                missing.append('Projection cannot establish human audibility or native evidence')
        if request['mode'] == 'beyond' and band[0] < 20000 and band[1] > 20:
            unsupported.append('Beyond cannot fall back to Human reference')
        if request['mode'] == 'human_reference' and (band[0] < 20 or band[1] > 20000):
            unsupported.append('Outside Human reference preset')
        support = 'unsupported' if unsupported else 'undetermined' if missing else 'supported'
        results.append(dict(band_hz=band, support=support, reasons=unsupported+missing))
    decision = dict(contract='akouo/aperture-decision/v1', request_id=request['request_id'], route_ref=request['route_ref'], subject_ref=request['subject_ref'], representation_ref=request['representation_ref'], claim_status='undetermined', outcome='permitted' if all(r['support']=='supported' for r in results) else 'refused', bands=results)
    errors = contract_errors('aperture-decision', decision, schemas_dir=schemas_dir)
    if errors: raise ValueError('; '.join(errors))
    return decision
