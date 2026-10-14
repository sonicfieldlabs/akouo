# A situated listening covenant

This example imagines a collection keeper and a research participant agreeing
on a bounded inquiry. Their identifiers, `illustrative:collection-keeper` and
`illustrative:research-participant`, describe roles in an example. No actual
party is bound by its availability. A real adoption must name the participants
and the authority under which each can agree to the declared scope.

The proposed inquiry concerns material the keeper has made available to the
participant. That material can be a text, a score or a recording. Access to
one representation does not authorize another representation or another use.
The keeper can withhold material, and the participant can decline an inquiry.
Attribution of that decision should preserve the category of absence without
revealing the withheld contents.

## Uses and commitments

The participant proposes to read the admitted material and make an account or
a work under the terms attached to it. They will distinguish source statements
from their own interpretation. A finished textual work can remain the outcome.
An acoustic rendering, an external provider or a publication requires its own
applicable authorization. Choosing a creative disposition grants none of
those permissions.

The parties should name the material they may retain, the places it may be
disclosed, and the duration of the agreement in their real revision. The
illustrative controls below require independently verified consent references
for execution, retention and disclosure. They also exclude public disclosure
under this example. A host that cannot enforce a required control must stop
before the relevant operation. Prose commitments remain available for review
even where a system cannot execute them.

## Contest, correction, and withdrawal

Either party can raise a disagreement through the contact or review process
they name in their actual agreement. Preserve the contested account and its
correction with their respective identities. Do not expose protected material
to make a disagreement inspectable. The record can identify which source,
term or control was contested without carrying its contents.

A revision records a new proposal. Replacement identifies the revision that
takes effect at a declared boundary and requires authority over the affected
parties. Withdrawal revokes the applicable adoption for subsequent gates.
It does not erase earlier records or imply that already disclosed material
has been recalled. Any cleanup or remedy requires its own action and receipt.
Participants should settle those conditions in the agreement they actually
adopt. The template assigns no legal standing to their choices.

```listening-controls-v1
{
  "grammar": "akouo/listening-controls/v1",
  "context": {"policy": "full", "max_bytes": 65536},
  "controls": [
    {"control_id": "execution-agreement", "gate": "execution", "target": "execution.consent_refs", "operator": "require_refs", "refs": ["illustrative:execution-agreement"], "required": true},
    {"control_id": "retention-agreement", "gate": "retention", "target": "retention.consent_refs", "operator": "require_refs", "refs": ["illustrative:retention-agreement"], "required": true},
    {"control_id": "disclosure-agreement", "gate": "disclosure", "target": "disclosure.consent_refs", "operator": "require_refs", "refs": ["illustrative:disclosure-agreement"], "required": true},
    {"control_id": "bounded-disclosure", "gate": "disclosure", "target": "disclosure.destination", "operator": "deny_values", "values": ["public"], "required": true}
  ]
}
```
