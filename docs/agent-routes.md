# Agent routes and retained observations

`akouo/agent-route/v0.1` is an unreleased, opt-in route contract. Its separate
[manifest](../agent-routes.manifest.json) composes existing listening skills.
The companion command enum remains opt-in. The v0.10 mode enum includes
`agent-native-listening`; hosts must still negotiate the
companion before exposing `/agent`, `/second-report`, or `/beyond`; installing it
does not add these commands to the reference application automatically.

The route request identifies the receiving agent, new pass and report, subject,
inputs, apparatus declaration, recipients, requested claim categories, and the
host's resolved reference scope. `relation.of` distinguishes a representation,
record, and observation. These are subject types, not epistemic ranks or access
permissions. References must resolve in the host's authorized local scope.

- `/agent` composes agent-native, signal inspection and mediation review for a
  structured report.
- `/second-report` composes memory and forensic review of a retained record. Its
  subject must occur in `report_of_refs`, directly or as the record containing a
  host-resolved JSON-pointer report reference. The receiving account has new pass and
  report IDs; the source account is retained. This route never invents influence.
- `/beyond` composes agent-native listening with the existing extended-spectrum
  gate and actual Earworm access validator.
  A supported request permits an observe-only measurement attempt. The route
  does not itself create a measured result, embodied hearing, SPL calibration,
  native model understanding, or execution authority.

All routes reject machine `heard` requests. Agent recipients do not widen access.
Record and observation routes permit attributed interpretation or inference,
not the receiving agent's own measurement of the original phenomenon. Ordinary
agent routes also require the spectral gate before any spectral measurement;
use `/beyond` for that explicit attempt. Permission overrides can only narrow the
computed permissions; they cannot turn `heard_allowed` on or erase the obligation
to include undetermined claims. An unsupported or unresolved measurement request abstains. An unsupported-band
interpretation requires a separate retained report and must cite it; it does not
permit fresh inference about the unobserved band.

`agent_route_report_errors` binds a proposed structured output to its successful
route, checks every feature against the resulting permissions and pass identity,
and requires separately supplied, host-validated measurement references before
accepting a measured feature. It checks references, not measurement truth. Hosts
must retain the route decision and evaluate their policy before running models,
writing records, disclosing content, or taking actions.

## MASA observation adapter

`akouo/masa-observation-report/v0.1` is an application-owned mapping, not a new
`masa:` term. `map_masa_observation` takes a complete MASA 0.2.0 Observation-profile
record, its selected Observation ID, explicit output identities and a caller-
supplied MASA validator. The validator must check structure, profile and semantic
references offline. This package does not duplicate MASA schemas or its validator.

The mapping retains a deep copy of the complete source record, including unknown
namespaced extensions, source identity, value and unit qualifications, method and
revision, original epistemic status, temporal character, signal kind, source
health, freshness, disclosure and policy references. It produces a separate
structured attribution report. There is no numerical ranking or automatic upgrade
between reported, derived, inferred and measured observations. The receiving
claim is `undetermined` about the underlying phenomenon and explicitly attributes
the retained field to its source. Its confidence is undetermined and its source is
`provider`; it is not a receiving-model measurement. No sonic or physical capture
is inferred from an astronomical or other non-acoustic source.

Known values with known string units can be copied as attributed feature values.
Qualified absences remain absences. Deleted values produce no feature (the retained
receipt and deleted state survive); values with unknown units also produce no
feature. This avoids inventing units or collapsing deletion into unavailability.
MASA's not-applicable state gets an explicit explanatory reason in the report.
The complete source snapshot is private evidence, not a public projection. Mapping
requires local access authorized by the host and grants no disclosure permission.

`masa_observation_report_errors` validates the retained MASA source with the
injected validator and recomputes the attribution mapping to detect changes in
copied values, source status or pass identity. Supply `source_record` to compare
the retained snapshot against the separately retained original. Without that
argument, validation establishes internal consistency only. This is an adaptation to AKOÚŌ,
not a transformed MASA record: no MASA descendant, operation receipt or namespace
promotion is fabricated. Earworm now supplies an opt-in observation-account binding and source register/scale
context through `akousma.observation_accounts`, plus sectors and scalar descriptor
comparisons through `akousma.agent_sectors`. Opt-in [companion routes](companion-routes.md)
now package the second-report skill, tag routing and per-ear presets. Host
adoption and application dispatch remain subsequent integration.

## Python host integration

```python
from akouo_contract.agent_routes import plan_agent_route, agent_route_report_errors
from akouo_contract.masa_observations import map_masa_observation
from akousma.listening_contracts import listening_access_errors

route = plan_agent_route(request, access, validate_access=listening_access_errors,
                         spectral_request=spectral_request)  # /beyond only
errors = agent_route_report_errors(report, route,
                                   measurement_refs=validated_measurement_refs)
```

The three companion schemas and the separate manifest are bundled with the Python
package. `load_agent_routes()` loads the installed manifest; source checkout tests
can pass `manifest_path` and `schemas_dir`. No network resolution or DSP runs in
these helpers. MASA fixtures in `tests/fixtures/masa-observation-source.json` are
copied from MASA's 0.2.0 mapping example (MIT) and remain explicitly synthetic.
