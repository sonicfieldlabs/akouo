from akouo_contract.listening_tasks import compound_listening_routes


def test_compound_routes_are_additive_and_independent():
    first=compound_listening_routes()
    first[0]['specialist_tasks'].clear()
    assert compound_listening_routes()[0]['specialist_tasks']==['tag_events','track_beats']
    assert all('base_route' in r for r in compound_listening_routes())
