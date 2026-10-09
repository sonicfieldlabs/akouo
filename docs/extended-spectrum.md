# Extended-spectrum gate

The unreleased Python `extended_spectrum_decision` helper checks whether declared
apparatus and input evidence support an observe-only spectral measurement attempt.
It reuses Earworm's negotiated access validator and AKOÚŌ's existing route-decision
schema. It does not run a model, perform DSP, or add a new command or listening mode.

```python
from akousma.listening_contracts import (
    LISTENING_ACCESS_CONTRACT, assert_supported_contracts, listening_access_errors,
)
from akouo_contract.spectral_gate import (
    EXTENDED_SPECTRUM_CONTRACT, extended_spectrum_decision,
)
assert_supported_contracts(
    [LISTENING_ACCESS_CONTRACT, EXTENDED_SPECTRUM_CONTRACT], host_supported_contracts,
)
result = extended_spectrum_decision(
    access, request, actor=host_actor_id, validate_access=listening_access_errors,
)
```

The host supplies the actual Earworm validator. AKOÚŌ carries no copied Earworm
schema and does not infer support from a matching package version. These APIs are
unreleased local additions; install the coordinated local packages when testing.
The [request schema](../schemas/extended-spectrum-request.schema.json) and
[synthetic request](../examples/extended-spectrum-request-example.json) define the
input. The `extended-spectrum` preset continues to choose the existing signal and
spectral listening modes; hosts can apply this gate before their measurement.
Automatic host/runtime wiring remains a subsequent integration.

The host builds `resolved_refs` from its authorized, validated evidence scope.
An untrusted model report must not populate that list as its own proof. The scope
includes the subject, apparatus, model, sampled/effective representations,
evidence, and preprocessing receipts. Resolve and validate receipt bodies before
classifying their operation kinds. The helper does not fetch references or verify
that a calibration record is factually correct.

The gate checks each declared capture/sample/model band, the model's own validated
Nyquist bound, actual analysis window, channel count, blind spots, and the ordered
preprocessing chain from sampled representation to model input. It permits direct
physical frequency comparisons through identity, filtered resampling, channel
mapping, and window cropping. Rate conversion requires a filtered-resampling
receipt; channel conversion requires a channel-mapping receipt. Changed signal
coordinates—playback-rate changes, frequency translation, pitch shift, or an
unknown operation—need a separate mapping assessment and return `undetermined`.
A file sample rate cannot establish physical capture support.

The result separates `support`, `claim_status`, `measurement_permitted`, and an
attributed route `decision`. Supported declarations can produce `proceed` with
`observe_only` authority and confirmation still required. This is a measurement
attempt permission within the gate, not a measured fact or authorization to bypass
other policy gates. No successful measurement has occurred, so `claim_status`
remains `undetermined`. Unsupported or unresolved support produces `abstain` with
reasons. Invalid request structure raises a validation error before assessment.

Native understanding of an ultrasonic/infrasonic sector, embodied hearing, and
calibrated SPL are not established by this helper. Requests for those claims
abstain. The same restriction applies when a human rendering is absent: an
agent-addressed report does not gain capabilities from its recipient. A future
`/beyond` route may retain supported measurements or attributed interpretations;
it cannot manufacture an embodied `heard` claim. Native understanding, perceptual
access, and report-format interoperability each require their own implementation
and evaluation evidence.
