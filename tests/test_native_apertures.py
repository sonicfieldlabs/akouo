import copy
import json
from pathlib import Path
import pytest
from akouo_contract.native_evidence import native_evidence_errors
from akouo_contract.apertures import aperture_decision

ROOT=Path(__file__).resolve().parents[1]

def evidence(): return json.loads((ROOT/'tests/fixtures/agent-native.json').read_text())

def test_native_structure_and_host_admission():
    v=evidence()
    assert native_evidence_errors(v,schemas_dir=ROOT/'schemas')
    assert native_evidence_errors(v,resolve_reference=lambda r:True,admit_access=lambda o,a:True,schemas_dir=ROOT/'schemas')==[]
    assert native_evidence_errors(v,resolve_reference=lambda r:True,admit_access=lambda o,a:False,schemas_dir=ROOT/'schemas')

@pytest.mark.parametrize('mutation',[
    lambda v:v['clocks'].append(copy.deepcopy(v['clocks'][0])),
    lambda v:v['observations'][0].update(clock_id='missing'),
    lambda v:v['observations'][0].update(evidence_id='missing'),
    lambda v:v['observations'][0]['metrics'][0].update(value=float('nan')),
    lambda v:v['relations'][0].update(from_ref='projection:40k'),
    lambda v:v['observations'][0]['access'].append(copy.deepcopy(v['observations'][0]['access'][0])),
])
def test_native_negative(mutation):
    v=evidence();mutation(v)
    assert native_evidence_errors(v,resolve_reference=lambda r:True,admit_access=lambda o,a:True,schemas_dir=ROOT/'schemas')

def route():
    block=dict(status='known',validated=True,bands_hz=[[0,80000]],window_s=[0,1])
    return dict(subject_ref='source:hash',representation_ref='rep:hash',route_ref='route:dsp',sampled_representation=block,analysis=block,capture=dict(status='not_applicable',reason='born digital'),model_input=dict(status='not_applicable',reason='DSP only'))

def request(kind='digital_dsp'):
    return dict(contract='akouo/aperture-request/v1',request_id='req:1',mode='beyond',bands_hz=[[30000,40000]],subject_ref='source:hash',representation_ref='rep:hash',route_ref='route:dsp',claim_kind=kind,window_s=[0,1])

def decide(q,r=None): return aperture_decision(q,resolve_route=lambda ref:route() if r is None else r,schemas_dir=ROOT/'schemas')

def test_digital_and_claim_specific_refusals():
    assert decide(request())['outcome']=='permitted'
    for kind in ('physical_capture','model_input','human_projection'):
        d=decide(request(kind));assert d['outcome']=='refused' and d['claim_status']=='undetermined'
    r=route();r['model_input']=dict(r['analysis'],prepared_input_validated=True)
    assert decide(request('model_input'),r)['outcome']=='permitted'
    r['capture']=dict(r['analysis']);assert decide(request('physical_capture'),r)['outcome']=='permitted'

def test_missing_bounds_and_caller_resolution_cannot_grant_access():
    assert decide(request(),{})['outcome']=='refused'
    q=request();q['bands_hz']=[[1000,2000]];assert decide(q)['outcome']=='refused'
    q=request();q['bands_hz']=[[90000,95000]];assert decide(q)['bands'][0]['support']=='unsupported'
    q=request();q['resolved_refs']=['anything']
    with pytest.raises(ValueError): decide(q)
    for bands in ([],[[4,3]],[[10,15],[5,6]],[[5,10],[9,11]]):
        q=request();q['bands_hz']=bands
        with pytest.raises(ValueError):decide(q)
