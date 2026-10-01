import json
import unittest
from copy import deepcopy
from pathlib import Path
from unittest.mock import Mock
from akouo_contract.agent_routes import plan_agent_route, agent_route_report_errors, load_agent_routes
from akouo_contract.validation import contract_errors

ROOT = Path(__file__).resolve().parents[1]


class AgentRoutesTest(unittest.TestCase):
    def setUp(self):
        self.access = json.loads((ROOT / 'tests/fixtures/spectral-access.json').read_text())
        self.spectral = json.loads((ROOT / 'examples/extended-spectrum-request-example.json').read_text())
        self.request = json.loads((ROOT / 'examples/agent-route-request-example.json').read_text())
        self.validate = Mock(return_value=[])

    def plan(self, spectral=None):
        return plan_agent_route(self.request, self.access, validate_access=self.validate,
            spectral_request=spectral, schemas_dir=ROOT/'schemas', manifest_path=ROOT/'agent-routes.manifest.json')

    def report(self):
        req = self.request
        return dict(contract='akouo/agent-report/v0.1', **{k:deepcopy(req[k]) for k in ('report_id','listener_id','listening_pass_id','input_refs','apparatus_ref','recipients','report_of_refs')},
            subject_ref=req['relation']['ref'], report_format='structured', limitations=['Synthetic fixture only.'],
            features=[dict(feature_id='feature:unknown',namespace='fixture',name='unknown', category='undetermined',
                value=dict(status='unknown',reason='No measurement performed.'), claim=dict(claim_id='claim:unknown',statement='No measurement is established.',confidence='undetermined',source='model',evidence_refs=[req['input_refs'][0]],listening_pass_id=req['listening_pass_id']))])

    def test_default_agent_route_and_source_immutability(self):
        before = deepcopy((self.request,self.access))
        route=self.plan()
        self.assertEqual(route['decision']['outcome'],'proceed')
        self.assertFalse(route['claim_permissions']['heard_allowed'])
        self.assertFalse(route['claim_permissions']['measured_allowed'])
        self.assertEqual(route['execution'],'not_requested')
        self.assertEqual((self.request,self.access),before)
        self.assertEqual(agent_route_report_errors(self.report(),route,schemas_dir=ROOT/'schemas'),[])

    def test_missing_contract_rejected(self):
        self.request['supported_contracts']=[]
        with self.assertRaises(ValueError): self.plan()

    def test_unresolved_subject_recipient_or_input_abstains(self):
        for ref in [self.request['relation']['ref'],self.request['recipients'][0]['id'],self.request['input_refs'][0]]:
            original=deepcopy(self.request['resolved_refs'])
            self.request['resolved_refs'].remove(ref)
            self.assertEqual(self.plan()['decision']['outcome'],'abstain')
            self.request['resolved_refs']=original

    def test_apparatus_binding_and_invalid_validator(self):
        self.access['subject_ref']='wrong:subject'
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')
        self.validate.return_value=['Invalid declared aperture']
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')
        self.validate.return_value=True
        with self.assertRaises(TypeError): self.plan()

    def test_heard_and_unmeasured_requests_abstain(self):
        for category in ['heard','measured','speculative']:
            self.request['requested_categories']=[category]
            self.assertEqual(self.plan()['decision']['outcome'],'abstain')

    def test_overrides_only_narrow_permissions(self):
        perms=self.plan()['claim_permissions']
        self.request['permission_overrides']={**perms,'interpreted_allowed':False}
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')
        self.request['permission_overrides']={**perms,'heard_allowed':True}
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')
        self.request['permission_overrides']={**perms,'must_include_undetermined':False}
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')

    def test_second_report_requires_retained_record_and_separate_output(self):
        self.request['profile']='second_report'
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')
        self.request['relation']={'of':'record','ref':'record:retained'}
        self.access['subject_ref']='record:retained'
        self.request['input_refs']=['record:retained']
        self.request['resolved_refs'].append('record:retained')
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')
        self.request['report_of_refs']=['record:retained']
        route=self.plan()
        self.assertEqual(route['decision']['outcome'],'proceed')
        self.assertNotIn('influenced_by',route)
        self.assertEqual(agent_route_report_errors(self.report(),route,schemas_dir=ROOT/'schemas'),[])
        self.request['report_id']='record:retained'
        with self.assertRaises(ValueError): self.plan()

    def test_beyond_supported_attempt_requires_separate_measurement_result(self):
        self.request['profile']='beyond'
        self.request['requested_categories']=['measured']
        route=self.plan(self.spectral)
        self.assertEqual(route['decision']['outcome'],'proceed')
        self.assertEqual(route['spectral_assessment']['claim_status'],'undetermined')
        report=self.report()
        measured=deepcopy(report['features'][0]); measured.update(feature_id='f:measured',category='measured')
        measured['claim'].update(claim_id='c:measured',evidence_refs=['measurement:result'])
        measured['value']=dict(status='known',value=42,unit='Hz')
        report['features'].append(measured)
        self.assertTrue(agent_route_report_errors(report,route,schemas_dir=ROOT/'schemas'))
        self.assertEqual(agent_route_report_errors(report,route,measurement_refs=['measurement:result'],schemas_dir=ROOT/'schemas'),[])

    def test_beyond_missing_or_unsupported_input_abstains(self):
        self.request.update(profile='beyond',requested_categories=['measured'])
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')
        self.spectral['band_hz']['upper']=25000
        self.assertEqual(self.plan(self.spectral)['decision']['outcome'],'abstain')

    def test_beyond_can_route_attributed_interpretation_without_claiming_measurement(self):
        self.request.update(profile='beyond',requested_categories=['interpreted'])
        self.spectral['band_hz']['upper']=25000
        self.assertEqual(self.plan(self.spectral)['decision']['outcome'],'abstain')
        self.request['report_of_refs']=['report:retained']
        self.request['input_refs'].append('report:retained')
        self.request['resolved_refs'].append('report:retained')
        route=self.plan(self.spectral)
        self.assertEqual(route['decision']['outcome'],'proceed')
        self.assertFalse(route['claim_permissions']['measured_allowed'])
        self.assertEqual(route['spectral_assessment']['support'],'unsupported')

    def test_spectral_scope_cannot_be_widened(self):
        self.request.update(profile='beyond',requested_categories=['measured'])
        self.spectral['resolved_refs'].append('unresolved:extra')
        self.assertEqual(self.plan(self.spectral)['decision']['outcome'],'abstain')

    def test_wrong_effective_input_and_unknown_input(self):
        self.request['input_refs']=['wrong:input']; self.request['resolved_refs'].append('wrong:input')
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')
        self.access['model_input']={'status':'unknown','reason':'No effective model representation.'}
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')
        self.request['requested_categories']=['undetermined']
        self.assertEqual(self.plan()['decision']['outcome'],'proceed')

    def test_report_cannot_change_pass_category_or_omit_unknowns(self):
        route=self.plan()
        for field in ['listener_id','listening_pass_id','report_id','subject_ref']:
            report=self.report(); report[field]='wrong:identity'
            self.assertTrue(agent_route_report_errors(report,route,schemas_dir=ROOT/'schemas'))
        report=self.report(); report['features'][0]['category']='measured'
        self.assertTrue(agent_route_report_errors(report,route,schemas_dir=ROOT/'schemas'))
        report=self.report(); report['features']=[]
        self.assertTrue(agent_route_report_errors(report,route,schemas_dir=ROOT/'schemas'))

    def test_manifest_reuses_released_modes_and_installed_bundle(self):
        manifest=load_agent_routes()
        self.assertEqual(manifest,load_agent_routes(manifest_path=ROOT/'agent-routes.manifest.json'))
        legacy=json.loads((ROOT/'akouo.manifest.json').read_text())
        modes={item['id'] for item in legacy['skills']}
        for profile in manifest['profiles'].values(): self.assertTrue(set(profile['chain'])<=modes)
        self.assertEqual(manifest['profiles']['beyond']['chain'][0],'agent-native-listening')
        presets=json.loads((ROOT/'presets/presets.json').read_text())
        self.assertIn('extended-spectrum',{item['id'] for item in presets['presets']})
        self.assertEqual(contract_errors('agent-route-request',self.request),[])

    def test_unsupported_band_cannot_enable_inference_from_an_agent_recipient(self):
        self.request.update(profile='beyond',requested_categories=['inferred'])
        self.spectral['band_hz']['upper']=25000
        self.assertEqual(self.plan(self.spectral)['decision']['outcome'],'abstain')

    def test_schema_documents_are_valid_offline(self):
        from jsonschema import Draft202012Validator
        for path in (ROOT/'schemas').glob('*.schema.json'):
            Draft202012Validator.check_schema(json.loads(path.read_text()))

    def test_second_report_accepts_resolved_pointer_inside_retained_input(self):
        self.request.update(profile='second_report',relation={'of':'record','ref':'record:retained'},input_refs=['record:retained'],report_of_refs=['record:retained#/listening/human.note'])
        self.access['subject_ref']='record:retained'
        self.request['resolved_refs']+=['record:retained','record:retained#/listening/human.note']
        self.assertEqual(self.plan()['decision']['outcome'],'proceed')
        self.request['resolved_refs'].remove('record:retained#/listening/human.note')
        self.assertEqual(self.plan()['decision']['outcome'],'abstain')

    def test_receiving_pass_cannot_reuse_retained_input_identity(self):
        self.request['listening_pass_id']=self.request['input_refs'][0]
        with self.assertRaises(ValueError): self.plan()
