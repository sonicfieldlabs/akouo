import json
import unittest
from copy import deepcopy
from pathlib import Path
from unittest.mock import Mock

from akouo_contract.companions import (
    COMPANION_CONTRACT, companion_bundle_errors, plan_second_report,
    plan_ear_route, route_tags, tags_from_matter_context,
)

ROOT = Path(__file__).resolve().parents[1]


class CompanionTest(unittest.TestCase):
    def setUp(self):
        self.request = json.loads((ROOT/'examples/agent-route-request-example.json').read_text())
        self.request['supported_contracts'].append(COMPANION_CONTRACT)
        self.access = json.loads((ROOT/'tests/fixtures/spectral-access.json').read_text())
        self.validate = Mock(return_value=[])
        self.tags = dict(contract=COMPANION_CONTRACT, vocabulary='masa/0.2.0',
            relation=deepcopy(self.request['relation']), registers=['physical-event'],
            scales=['microtemporal','fixture:future'], source_modality=dict(status='unknown',reason='Not established.'),
            access_declaration_ref=self.request['apparatus_ref'], declared_by='agent:fixture',
            basis_refs=[self.request['relation']['ref']])
        self.selection = dict(contract=COMPANION_CONTRACT, ear='radio', retention=dict(mode='none'))
        self.records = {'record:source': dict(akousma_id='record:source',listening={
            'human.note':dict(payload=dict(listening_pass_id='pass:source', report_id='report:source', text='A source account.'))},
            extensions={'fixture:opaque':[False, 0, {'retain':'exact'}]})}

    def ear(self, **kwargs):
        return plan_ear_route(self.selection,self.request,self.access,validate_access=self.validate,data_root=ROOT,**kwargs)

    def tag(self):
        return route_tags(self.tags,self.request,self.access,validate_access=self.validate,data_root=ROOT)

    def prepare_second(self):
        ref='record:source#/listening/human.note'
        self.request.update(profile='second_report',relation=dict(of='record',ref='record:source'),
            report_of_refs=[ref],input_refs=['record:source'])
        self.request['resolved_refs'] += ['record:source',ref]
        self.access['subject_ref']='record:source'

    def second(self):
        return plan_second_report(self.request,self.access,records=self.records,
            validate_record=self.validate,validate_access=self.validate,data_root=ROOT)

    def test_bundle_reuses_existing_assets(self):
        self.assertEqual(companion_bundle_errors(data_root=ROOT),[])

    def test_installed_bundle_matches_canonical_assets(self):
        from akouo_contract import root
        self.assertEqual(companion_bundle_errors(),[])
        for folder in ('companions','schemas'):
            for path in (ROOT/folder).rglob('*'):
                if path.is_file() and path.name != ".DS_Store":
                    self.assertEqual((root()/path.relative_to(ROOT)).read_bytes(),path.read_bytes())

    def test_radio_composes_without_permission_upgrade(self):
        before=deepcopy((self.selection,self.request,self.access))
        result=self.ear()
        self.assertEqual(result['route']['decision']['outcome'],'proceed')
        self.assertEqual(result['route']['mode_chain'][0],'musical-aesthetic-listening')
        self.assertIn('signal-inspection-listening',result['route']['mode_chain'])
        self.assertFalse(result['route']['claim_permissions']['heard_allowed'])
        self.assertFalse(result['route']['claim_permissions']['measured_allowed'])
        self.assertEqual(result['execution'],'not_requested')
        self.assertEqual((self.selection,self.request,self.access),before)

    def test_room_without_human_does_not_fabricate_account(self):
        self.selection['ear']='room'
        result=self.ear()
        self.assertEqual(result['source_snapshots'],{})
        self.assertNotIn('human_account_ref',result['selection'])
        self.assertEqual(result['route']['mode_chain'][0],'material-event-listening')

    def test_room_human_account_is_retained_and_requires_scoped_validator(self):
        self.selection.update(ear='room',human_account_ref='record:source#/listening/human.note')
        self.request['report_of_refs']=[self.selection['human_account_ref']]
        self.request['input_refs'].append('record:source')
        self.request['resolved_refs']+=['record:source',self.selection['human_account_ref']]
        with self.assertRaises(TypeError): self.ear(records=self.records,validate_record=self.validate)
        human=Mock(return_value=['Account is not human or belongs to another subject'])
        with self.assertRaises(ValueError): self.ear(records=self.records,validate_record=self.validate,validate_human_account=human)
        human.return_value=[]
        result=self.ear(records=self.records,validate_record=self.validate,validate_human_account=human)
        human.assert_called_with(self.records['record:source'],self.selection['human_account_ref'],self.request['relation']['ref'])
        self.assertEqual(result['source_snapshots'],self.records)
        self.assertFalse(result['route']['claim_permissions']['heard_allowed'])

    def test_unsupported_ear_subject_and_profiles_rejected(self):
        for ear in ['radio','room','beyond_band']:
            with self.subTest(ear=ear):
                self.selection['ear']=ear
                self.request['relation']['of']='observation'
                with self.assertRaises(ValueError): self.ear()
        self.selection['ear']='sky'
        self.request['relation']['of']='representation'
        with self.assertRaises(ValueError): self.ear()

    def test_sky_observation_no_synthetic_hearing(self):
        self.selection['ear']='sky'; self.request['relation']['of']='observation'
        result=self.ear()
        self.assertEqual(result['route']['decision']['outcome'],'proceed')
        self.assertEqual(result['preset_refs'],[])
        self.request['requested_categories']=['heard']
        self.assertEqual(self.ear()['route']['decision']['outcome'],'abstain')

    def test_beyond_existing_spectral_gate_is_mandatory(self):
        self.selection['ear']='beyond_band'
        self.request.update(profile='beyond',requested_categories=['measured'])
        self.assertEqual(self.ear()['route']['decision']['outcome'],'abstain')
        spectral=json.loads((ROOT/'examples/extended-spectrum-request-example.json').read_text())
        self.assertEqual(self.ear(spectral_request=spectral)['route']['decision']['outcome'],'proceed')
        spectral['band_hz']['upper']=25000
        self.assertEqual(self.ear(spectral_request=spectral)['route']['decision']['outcome'],'abstain')

    def test_beyond_manifest_uses_promoted_preset_and_native_lead(self):
        manifest=json.loads((ROOT/'companions/manifest.json').read_text())
        beyond=manifest['ears']['beyond_band']
        self.assertIn('beyond-band',beyond['presets'])
        self.assertIn('extended-spectrum',beyond['presets'])
        self.assertEqual(beyond['leading_modes'][0],'agent-native-listening')

    def test_sent_sound_requires_explicit_selection_and_retention(self):
        self.selection['ear']='sent_sound'
        with self.assertRaises(ValueError): self.ear()
        self.selection['selected_preset']='music'
        self.assertEqual(self.ear()['preset_refs'],['music'])
        self.selection.pop('retention')
        with self.assertRaises(ValueError): self.ear()

    def test_sent_sound_cannot_bypass_spectral_gate(self):
        self.selection.update(ear='sent_sound',selected_preset='extended-spectrum')
        with self.assertRaises(ValueError): self.ear()

    def test_retention_uses_host_policy_does_not_write(self):
        self.selection['retention']=dict(mode='policy',policy_ref='policy:host')
        with self.assertRaises(ValueError): self.ear()
        self.request['resolved_refs'].append('policy:host')
        with self.assertRaises(TypeError): self.ear()
        validate=Mock(return_value=['Policy does not cover this subject'])
        with self.assertRaises(ValueError): self.ear(validate_retention=validate)
        validate.return_value=[]
        self.assertEqual(self.ear(validate_retention=validate)['execution'],'not_requested')
        validate.assert_called_with('policy:host',self.request['relation']['ref'])

    def test_missing_negotiation_and_unknown_selection_rejected(self):
        self.selection['selected_preset']='music'
        with self.assertRaises(ValueError): self.ear()
        self.selection.pop('selected_preset')
        self.request['supported_contracts'].remove(COMPANION_CONTRACT)
        with self.assertRaises(ValueError): self.ear()
        with self.assertRaises(ValueError): self.tag()

    def test_tag_axes_remain_separate_and_namespaced_labels_survive(self):
        before=deepcopy((self.tags,self.access,self.request))
        result=self.tag()
        self.assertEqual(result['unmapped'],[dict(axis='scales',label='fixture:future')])
        self.assertEqual(result['access_snapshot'],self.access)
        self.assertEqual(result['tags']['source_modality']['status'],'unknown')
        self.assertEqual(result['authority'],'selection_only')
        self.assertEqual((self.tags,self.access,self.request),before)
        result['access_snapshot']['model_input']['status']='unknown'
        self.assertEqual(self.access,before[1])

    def test_cosmic_and_microtemporal_labels_grant_no_claim_permissions(self):
        base=self.ear()
        self.tags.update(registers=['cosmological-speculative'],scales=['cosmic','microtemporal'])
        result=self.ear(tags=self.tags)
        self.assertEqual(result['route']['claim_permissions'],base['route']['claim_permissions'])
        self.assertNotIn('symbolic-fictional-listening',result['route']['mode_chain'])

    def test_tag_subject_access_basis_and_core_label_mismatch(self):
        for field,value in [('relation',dict(of='record',ref='wrong')),('access_declaration_ref','wrong'),
            ('basis_refs',['unresolved']),('declared_by','unknown:actor'),('registers',['imaginary']),('scales',['smaller-than-anything'])]:
            with self.subTest(field=field):
                before=deepcopy(self.tags);self.tags[field]=value
                with self.assertRaises(ValueError):self.tag()
                self.tags=before
        self.tags['source_modality']=dict(status='known',value='acoustic',evidence_refs=['unresolved'])
        with self.assertRaises(ValueError):self.tag()

    def test_invalid_tag_shapes_and_host_validator_return(self):
        self.tags['scales']=['microtemporal','microtemporal']
        with self.assertRaises(ValueError):self.tag()
        self.tags['scales']=['microtemporal']
        self.validate.return_value=True
        with self.assertRaises(TypeError):self.tag()

    def test_matter_context_adapter_uses_existing_validation_and_retains_labels(self):
        context=dict(vocabulary='masa/0.2.0',subject_ref='obs:source',registers=['physical-event'],scales=['cosmic'],
            source_modality=dict(status='unknown',reason='Source not established'),access_declaration_ref='access:obs',
            source_record_ref='record:source',context_id='context:source')
        result=tags_from_matter_context(context,self.records,self.access,validate_context=self.validate,declared_by='agent:fixture')
        self.validate.assert_called_with(context,self.records,self.access)
        self.assertEqual(result['scales'],context['scales'])
        self.validate.return_value=['Source labels changed']
        with self.assertRaises(ValueError):tags_from_matter_context(context,self.records,self.access,validate_context=self.validate,declared_by='agent:fixture')

    def test_second_report_keeps_source_and_separate_identity(self):
        self.prepare_second();before=deepcopy((self.records,self.request,self.access))
        result=self.second()
        self.assertEqual(result['route']['decision']['outcome'],'proceed')
        self.assertEqual(result['source_snapshots'],self.records)
        self.assertNotIn('influenced_by',json.dumps(result))
        result['source_snapshots']['record:source']['extensions'].clear()
        self.assertEqual((self.records,self.request,self.access),before)

    def test_second_report_rejects_missing_sources_wrong_identity_and_unresolved_pointer(self):
        self.prepare_second()
        original=deepcopy(self.records)
        for records in [{},{'record:source':{'akousma_id':'wrong'}}, {'record:source':dict(akousma_id='record:source',listening={})}]:
            self.records=records
            with self.assertRaises(ValueError):self.second()
        self.records=original
        for suffix in ['/missing','/listening/human.note/payload/text','/listening/~2','/listening/%68uman.note']:
            self.request['report_of_refs']=['record:source#'+suffix]
            with self.assertRaises(ValueError):self.second()

    def test_second_report_rejects_reused_nested_identity_and_invalid_source(self):
        self.prepare_second();self.request['listening_pass_id']='pass:source'
        with self.assertRaises(ValueError):self.second()
        self.request['listening_pass_id']='pass:new'
        self.validate.return_value=['Invalid source contract']
        with self.assertRaises(ValueError):self.second()

    def test_host_validation_cannot_mutate_inputs(self):
        self.prepare_second();before=deepcopy(self.records)
        def mutating(record): record.clear();return []
        result=plan_second_report(self.request,self.access,records=self.records,
            validate_record=mutating,validate_access=self.validate,data_root=ROOT)
        self.assertEqual(self.records,before)
        self.assertEqual(result['source_snapshots'],before)

    def test_sent_sound_second_report_uses_same_retained_source_checks(self):
        self.prepare_second();self.selection.update(ear='sent_sound',selected_preset='recall')
        result=self.ear(records=self.records,validate_record=self.validate)
        self.assertEqual(result['source_snapshots'],self.records)
        with self.assertRaises(ValueError):self.ear(records=self.records,validate_record=self.validate,spectral_request={})
