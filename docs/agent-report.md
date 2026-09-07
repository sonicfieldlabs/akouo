# Structured agent report

`akouo/agent-report/v0.1` is an unreleased, opt-in companion contract. It does not
replace `akouo/v0.9`, add a listening mode, or claim that hosts already route to it.
The [canonical schema](../schemas/agent-report.schema.json) reuses the existing
claim taxonomy and complete listener taxonomy through local schema references.
The [synthetic example](../examples/agent-report-example.json) is conformance data,
not evidence from a running model or a physical capture.

A report names its authoring listener and pass, subject, input references,
apparatus declaration, addressed recipients, optional prior reports, and structured
features. Each feature carries a namespaced name, a qualified value with units,
and a separately attributed claim with category, confidence, source, and evidence.
Categories are epistemic distinctions, not confidence levels. A report cannot
assign `heard` to machine output. Attribution of an actual human hearing remains
in a separate human report and pass under the existing listening contract.

Use `apparatus_ref` to reference an `earworm/listening-access/v1` declaration that
separates physical capture support, sampled representation, actual model input,
and human access. A report references that declaration rather than copying an
Earworm schema into AKOÚŌ. The receiving application must negotiate both contracts,
validate the access declaration with Earworm, and resolve the report's subject,
inputs, pass/listener identity, evidence, recipients, and prior reports. An
unresolved reference does not establish an apparatus capability. A report grants
no action authority; policy and execution gates remain outside its feature values.

```python
from akouo_contract.agent_report import AGENT_REPORT_CONTRACT, agent_report_errors
errors = agent_report_errors(report)
if errors:
    raise ValueError("; ".join(errors))
```

The installed Python package bundles all canonical schemas and resolves their
references offline. `agent_report_errors` adds report-local uniqueness, pass
attribution, and time-window checks to schema validation. It cannot verify the
truth of a claim or resolve objects belonging to a host's private record store.
For a source checkout, pass `schemas_dir=Path("schemas")` after installing the
package dependencies. The default reads the installed bundle.

Install with Python 3.10+ (`python3 -m pip install .`) before running
`./scripts/validate-release.sh`. If the desired interpreter is not `python3`, set
`AKOUO_PYTHON` to its path. The release check includes the report's positive and
negative tests; `python3 -m unittest discover -s tests` runs them separately.

Migration is explicit: older outputs stay in their original format. A host may
retain an unfamiliar report opaquely, but must reject an unsupported required
contract before using it for a decision. Producing a new structured report does
not rewrite the source report; use `report_of_refs` to retain the relationship.
The opt-in [agent route and MASA observation adapter](agent-routes.md) now supply
local planning and source-attribution APIs. Reference-app dispatch and application
persistence remain subsequent integrations; they are not supplied by this schema.

For a record's listening subject, report-format declaration, recipients, rendering
references, and claim lifetime, bind the report through the opt-in
`earworm/listening-context/v1` companion. A human prose interpretation gets its own
author and output reference. It must not silently replace the structured report.
For apparatus-dependent inference, see the [extended-spectrum gate](extended-spectrum.md).
