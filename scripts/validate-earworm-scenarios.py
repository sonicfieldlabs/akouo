"""Optional offline integration suite; install local akousma and akouo-contract.

Usage: python -I scripts/validate-earworm-scenarios.py /path/to/scenarios/matrix.json
The matrix is exported by @earworm/core/fixtures/scenarios/matrix.json. This
checks installed Python APIs, not a reference-app or model dispatch runtime.
"""
import json
import sys
from copy import deepcopy
from pathlib import Path

import akousma
from akousma.listening_contracts import listening_access_errors
from akousma.record_evolution import next_record_reference_errors
from akouo_contract.agent_routes import plan_agent_route, agent_route_report_errors
from akouo_contract.companions import plan_second_report


def check_scenarios(matrix):
    if matrix.get('contract')!='earworm/listening-scenarios/v1' or matrix.get('evidence_class')!='synthetic_contract_fixture':
        raise ValueError('Unsupported synthetic scenario bundle')
    before=deepcopy(matrix)
    assert matrix.get('execution')=='not_requested'
    assert [row['id'] for row in matrix['rows']]==[
        'agent_only','human_agent','influenced_ensemble','second_report','beyond_band','generation_lineage']
    routes=[]
    checks=[]
    for row in matrix['rows']:
        record=row['record']
        assert not akousma.validation_errors(record),row['id']
        if record['schema_version']=='1.7.0':
            assert not next_record_reference_errors(record,row['scope']),row['id']
        if 'route' not in row:
            assert row['id']=='generation_lineage'
            assert record['extensions']['earworm_generation_decision']['execution']=='not_requested'
            continue
        scenario=row['route'];request=scenario['request'];access=record['extensions']['earworm_listening_access']
        report=record['listening']['agent.report']['payload']
        if request['profile']=='second_report':
            planned=plan_second_report(request,access,records={r['akousma_id']:r for r in row['scope']},
                validate_record=akousma.validation_errors,validate_access=listening_access_errors)
            route=planned['route']
            assert set(planned['source_snapshots'])=={ref.split('#',1)[0] for ref in request['report_of_refs']}
        else:
            route=plan_agent_route(request,access,validate_access=listening_access_errors,
                spectral_request=scenario.get('spectral_request'))
        assert route['decision']['outcome']==scenario['expected_outcome'],row['id']
        assert route['claim_permissions']['measured_allowed']==scenario['expected_measured_allowed']
        assert not route['claim_permissions']['heard_allowed']
        assert not agent_route_report_errors(report,route),(row['id'],agent_route_report_errors(report,route))
        if 'expected_spectral_support' in scenario:
            assert route['spectral_assessment']['support']==scenario['expected_spectral_support']
        bad=deepcopy(request);bad['requested_categories']=['heard']
        assert plan_agent_route(bad,access,validate_access=listening_access_errors,
            spectral_request=scenario.get('spectral_request'))['decision']['outcome']=='abstain'
        checks.append(row['id']+': heard request abstains')
        bad_report=deepcopy(report);bad_report['listening_pass_id']='pass:borrowed'
        assert agent_route_report_errors(bad_report,route)
        checks.append(row['id']+': borrowed output pass rejected')
        if row['id']=='beyond_band':
            bad['requested_categories']=['measured']
            assert plan_agent_route(bad,access,validate_access=listening_access_errors,
                spectral_request=scenario['spectral_request'])['decision']['outcome']=='abstain'
            checks.append('beyond_band: unsupported measurement abstains')
        if row['id']=='second_report':
            bad_report=deepcopy(report)
            bad_report['features'][0]['claim']['evidence_refs']=[request['apparatus_ref']]
            assert agent_route_report_errors(bad_report,route)
            checks.append('second_report: unattributed inherited claim rejected')
        routes.append(dict(id=row['id'],outcome=route['decision']['outcome'],execution=route['execution']))
    assert matrix==before,'Cross-contract validation changed retained source evidence'
    return dict(routes=routes,negative_checks=checks,generation_lineage='validated_metadata_only')


if __name__=='__main__':
    if len(sys.argv)!=2:
        raise SystemExit(__doc__)
    print(json.dumps(check_scenarios(json.loads(Path(sys.argv[1]).read_text())),indent=2))
