# Agent-native evidence and aperture admission (v0.10)

`agent-native-listening` is a canonical mode in `akouo/v0.10`; hosts must still
admit and implement it explicitly. `agent-native` and `beyond-band` presets are
disabled by default and use DSP-only, read-memory, observe-only chains. Existing
`extended-spectrum` requests and evaluator are unchanged.

`akouo/agent-native-evidence/v1` migrates the supplied proposal's structure and
deterministic example. Its status stays `unvalidated` in transport: neither its
new identifier nor schema validity upgrades its evidence. `native_evidence_errors`
requires a host reference resolver and observer-access admission callback.
Duplicate IDs, dangling local refs, unresolved clocks, nonfinite values and
unsupported observer access are refused. Projection IDs cannot supply native
relations. A host resolves external artifacts, observers, claims and passes;
caller-provided text is not resolution authority.

`aperture_decision` receives a request and a trusted `resolve_route` callback.
The callback returns matching source/representation/route identity plus
`sampled_representation`, `analysis`, and when applicable `capture`/`model_input`
blocks. Known blocks contain `validated: true`, sorted `bands_hz` and a
`window_s`; the host must establish those fields from actual resolved evidence.
Model blocks additionally require `prepared_input_validated: true` for the exact
prepared input and admitted scope. These fields belong to host state, never the
request schema. Missing evidence yields undetermined; known exclusion yields
unsupported. Both refuse a claim. A permitted route still has claim status
undetermined until its operation is executed and attributable evidence exists.

Digital DSP requires sampled-representation and analysis support. Capture and
model input can be not applicable with host reasons. Physical capture claims
add capture support; model-input claims add prepared-input support. Human
projection cannot establish human audibility. Beyond rejects overlap with the
20 Hz–20 kHz reference and never silently falls back to it; an empty request
is invalid. Centaur does not union routes to authorize a single route.

This phase ships contracts and deterministic evaluators only. Oída producers,
Station controls, physical tests and actual spectral views are not implemented.
