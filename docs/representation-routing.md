# Representation routing

Source candidate `akouo-contract` 0.11.0 adds opt-in
`akouo/representation-route/v1` and `akouo/representation-output/v1`. The global
default remains `akouo/v0.10`, with existing schemas and claim meanings.
Earworm owns representation, access, output, and memory-record definitions.

## Planning primary material

`plan_representation_route` accepts a request, a host-validated Earworm record,
and provider capabilities. The request identifies the operation, primary
access, full input-access scope, listening mode, output kind and form,
requested claim categories, measurement references, and supported contracts.

Capabilities declare input and output forms and exact convention revisions.
Forms include text, audio, notation, MIDI, data, Morse, glyphs, code, and other
declared material. A capability declaration is not adapter qualification.
Unsupported forms, unknown conventions, or unavailable input produce an
abstaining route with reasons. Missing required contracts prevent negotiation.

Primary access has the subject, score, or work role. Context cannot activate
itself as the source. Listen and re-listen request accounts; sounding requests
a work. A prompt cannot substitute for that finished work. Re-listening carries
an explicit return basis, resolved against the previous owner operation before
execution.

## Retained routes and outputs

A route keeps a detached request, capabilities, record identity, actual received
identities, and input snapshot. The snapshot preserves original and received
hashes, byte counts, roles, coverage, terms, and bindings. Reusing an ID cannot
hide changed bytes or a different adopted document reference.

`representation_output_errors` binds a produced output to the host-retained
route and the Earworm record. Kind, form, completion, operation, source
relations, and input accesses must agree. A completed work may carry no claims.
A listening account includes explicit uncertainty with its other statements.

| Claim category | Behavior |
| --- | --- |
| `heard` | Reserved by the existing claim contract; this automated route does not grant it |
| `measured` | Separately validated method evidence for actual received material |
| `inferred` | Within declared source and requested scope |
| `interpreted` | Attributed reading of admitted material |
| `speculative` | Declared invention within requested scope |
| `undetermined` | Required for accounts; a work need not assert a finding |

Textual measurements can concern byte count or another declared property of an
inscription. They cannot establish properties of unavailable audio. The host
validates method evidence before giving it to the planner. Schema validity does
not prove a measured value, and valid citations cannot certify free-text claims.

## Owners and execution

The planner returns `execution: not_requested`. The host separately admits
actual bytes and references, resolves applicable terms and instruction
bindings, and authorizes execution. The library invokes no model or job,
fetches no file, adopts no policy, and grants no permission. Routes and method
evidence are retained by the host; editable declarations are not authority.

Document revision, adoption, and application have separate references. Full
LISTENING.md files can exceed the old orientation loader's 4,000-character
limit; an explicit received derivative describes bounded context without
changing full-document identity. Presets, scope precedence, control enforcement,
replacement, and revocation belong to the next phase.

## Host API

```python
from akouo_contract.representations import plan_representation_route, representation_output_errors
from akousma.representations import representation_record_errors, representation_measurement_errors

# The host supplies admitted input_record, request and capabilities.
route = plan_representation_route(
    request, input_record, capabilities,
    validate_record=representation_record_errors,
    measurements=validated_measurements,
    validate_measurement=representation_measurement_errors,
)
# After separately authorized execution, check the retained result.
errors = representation_output_errors(
    output_report, route, output_record,
    validate_record=representation_record_errors,
)
```

Callbacks validate Earworm's canonical records without copying its schemas into
AKOÚŌ. The wheel includes the opt-in manifest, four schemas, and references for
agent-native, transductive-media, and sovereign listening. The independent
installed-package gate uses exact copies of Earworm's synthetic examples, whose
source digests are recorded in `tests/fixtures/representations/SOURCE.json`.
These examples qualify contracts and do not claim model execution.
