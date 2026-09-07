import json
import unittest
from copy import deepcopy
from pathlib import Path
from unittest.mock import Mock
from akouo_contract.masa_observations import map_masa_observation, masa_observation_report_errors, MASA_OBSERVATION_REPORT_CONTRACT
from akouo_contract.agent_report import agent_report_errors

ROOT = Path(__file__).resolve().parents[1]


class ObservationMappingTest(unittest.TestCase):
    def setUp(self):
        self.source=json.loads((ROOT/'tests/fixtures/masa-observation-source.json').read_text())
        self.observation=self.source['observations'][0]
        # Unit boundary only; the cross-package smoke supplies actual MASA validation.
        self.validate=Mock(return_value=[])
        self.options=dict(mapping_id='mapping:fixture',report_id='report:received',listener_id='agent:receiver',
            listening_pass_id='pass:received',apparatus_ref='access:observation',recipients=[dict(id='agent:reviewer',type='agent')],
            supported_contracts=[MASA_OBSERVATION_REPORT_CONTRACT,'masa/0.2.0','akouo/agent-report/v0.1'],
            validate_masa=self.validate,schemas_dir=ROOT/'schemas')

    def mapped(self):
        return map_masa_observation(self.source,self.observation['id'],**self.options)

    def test_reported_stale_value_preserved_without_measurement_upgrade(self):
        source=deepcopy(self.source)
        mapped=self.mapped()
        self.assertEqual(self.source,source)
        self.assertEqual(mapped['source_snapshot'],source)
        feature=mapped['report']['features'][0]
        self.assertEqual(feature['category'],'undetermined')
        self.assertEqual(feature['claim']['source'],'provider')
        self.assertEqual(feature['claim']['confidence'],'undetermined')
        self.assertEqual(feature['value']['value'],72.4)
        self.assertEqual(mapped['source_snapshot']['observations'][0]['freshness']['status'],'stale')
        self.assertEqual(masa_observation_report_errors(mapped,validate_masa=self.validate,schemas_dir=ROOT/'schemas'),[])
        mapped['source_snapshot']['extensions']['new:opaque']={'field':'changed'}
        self.assertEqual(self.source,source)

    def test_every_source_epistemic_kind_is_independent_of_receiving_category(self):
        for kind in ['measured','reported','derived','inferred','interpreted','speculative','undetermined']:
            self.observation['epistemicStatus']=kind
            self.observation['temporalCharacter']='forecast'
            self.observation['signalKind']='generator'
            mapped=self.mapped()
            self.assertEqual(mapped['source_snapshot']['observations'][0],self.observation)
            self.assertEqual(mapped['report']['features'][0]['category'],'undetermined')
            self.assertIn(kind,mapped['report']['features'][0]['claim']['statement'])

    def test_absences_never_become_zero(self):
        for state in ['unknown','withheld','unavailable','not_applicable']:
            self.observation['value']={'state':state,'reason':'Fixture absence'} if state!='not_applicable' else {'state':state}
            if state=='withheld': self.observation['value']['policyRefs']=self.source['sources'][0]['policyRefs']
            mapped=self.mapped()
            self.assertEqual(mapped['value_projection'],'qualified_absence')
            self.assertEqual(mapped['report']['features'][0]['value']['status'],state)
            self.assertNotIn('value',mapped['report']['features'][0]['value'])
            self.assertEqual(mapped['source_snapshot']['observations'][0]['value'],self.observation['value'])

    def test_deleted_value_and_unknown_units_are_retained_without_fabrication(self):
        self.observation['value']={'state':'deleted','reason':'Erased locally','receiptRefs':['urn:fixture:receipt']}
        mapped=self.mapped()
        self.assertEqual(mapped['value_projection'],'omitted_deleted')
        self.assertEqual(mapped['report']['features'],[])
        self.observation['value']={'state':'known','value':42}
        self.observation['unit']={'state':'unknown','reason':'Not supplied'}
        mapped=self.mapped()
        self.assertEqual(mapped['value_projection'],'omitted_unknown_unit')
        self.assertEqual(mapped['report']['features'],[])

    def test_unknown_source_extensions_and_nonacoustic_identity_survive(self):
        self.observation['extensions']['example:future']={'original':['keep',False,0]}
        mapped=self.mapped()
        self.assertEqual(mapped['source_snapshot'],self.source)
        self.assertNotIn('capture',mapped)
        self.assertEqual(mapped['source_snapshot']['sources'][0]['sourceKind'],'astronomical-api-field')
        self.assertEqual(mapped['report']['report_of_refs'],[self.source['id']])

    def test_invalid_source_and_validator_rejected(self):
        self.validate.return_value=['Invalid MASA profile']
        with self.assertRaises(ValueError): self.mapped()
        self.validate.return_value=False
        with self.assertRaises(TypeError): self.mapped()

    def test_unsupported_profile_version_and_unresolved_observation(self):
        self.source['masaVersion']='0.1.0'
        with self.assertRaises(ValueError): self.mapped()
        self.source['masaVersion']='0.2.0'; self.source['profiles'].remove('observation')
        with self.assertRaises(ValueError): self.mapped()
        self.source['profiles'].append('observation'); self.source['observations']=[]
        with self.assertRaises(ValueError): self.mapped()

    def test_negotiation_and_new_pass_identity(self):
        self.options['supported_contracts']=[]
        with self.assertRaises(ValueError): self.mapped()
        self.options['supported_contracts']=[MASA_OBSERVATION_REPORT_CONTRACT,'masa/0.2.0','akouo/agent-report/v0.1']
        self.options['listening_pass_id']=self.source['id']
        with self.assertRaises(ValueError): self.mapped()

    def test_changed_projection_or_attribution_rejected(self):
        for target in ['value','category','pass','source']:
            mapped=self.mapped(); feature=mapped['report']['features'][0]
            if target=='value': feature['value']['value']=0
            elif target=='category': feature['category']='measured'
            elif target=='pass': feature['claim']['listening_pass_id']='other:pass'
            else: feature['claim']['source']='model'
            self.assertTrue(masa_observation_report_errors(mapped,validate_masa=self.validate,schemas_dir=ROOT/'schemas'))

    def test_false_does_not_equal_zero_and_nonfinite_rejected(self):
        self.observation['value']['value']=0
        mapped=self.mapped(); mapped['report']['features'][0]['value']['value']=False
        self.assertTrue(masa_observation_report_errors(mapped,validate_masa=self.validate,schemas_dir=ROOT/'schemas'))
        self.observation['value']['value']=float('nan')
        with self.assertRaises(ValueError): self.mapped()

    def test_installed_bundle_validates_mapping_and_report(self):
        self.options.pop('schemas_dir')
        mapped=self.mapped()
        self.assertEqual(masa_observation_report_errors(mapped,validate_masa=self.validate),[])
        self.assertEqual(agent_report_errors(mapped['report']),[])

    def test_original_source_comparison_detects_snapshot_rewriting(self):
        mapped=self.mapped()
        mapped['source_snapshot']['observations'][0]['health']['reason']='Rewritten source condition'
        self.assertTrue(masa_observation_report_errors(mapped,validate_masa=self.validate,schemas_dir=ROOT/'schemas',source_record=self.source))
