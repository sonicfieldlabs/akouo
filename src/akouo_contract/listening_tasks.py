"""Additive compound listening recipes; execution remains in Oída."""
from copy import deepcopy

COMPOUND_ROUTES = [
    {'id': 'broad-with-timing', 'name': 'Broad listening with event and timing evidence',
     'base_route': 'basic', 'specialist_tasks': ['tag_events', 'track_beats'],
     'evidence': ['dsp', 'model_interpretation', 'event_hypotheses', 'beat_hypotheses'],
     'failure_policy': 'retain successful lanes; expose failed and undetermined lanes'},
    {'id': 'measured-with-events', 'name': 'Measured signal with event hypotheses',
     'base_route': 'signal', 'specialist_tasks': ['tag_events'],
     'evidence': ['dsp', 'event_hypotheses'],
     'failure_policy': 'retain successful lanes; expose failed and undetermined lanes'},
    {'id': 'speech-in-context', 'name': 'Speech in its sonic environment',
     'base_route': 'basic', 'specialist_tasks': ['transcribe'],
     'evidence': ['dsp', 'model_interpretation', 'transcript_hypotheses'],
     'failure_policy': 'VAD gates only speech; retain environmental evidence and explicit abstention'},
]


def compound_listening_routes():
    return deepcopy(COMPOUND_ROUTES)
