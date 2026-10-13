# Several listenings in one bounded inquiry

Give each participant an addressable contribution and the material it
actually received. A swarm may approach a written passage, a recording or a
dataset. Its members can have different representations and capabilities.
Keep those differences in the record so that a shared source does not imply
shared access.

## Before exchange

Declare the question and the participants before dispatch. This example uses
`illustrative:reader-a` and `illustrative:reader-b`; actual participants need
their own identities and authority. Let a participant decline, choose no reply
or withdraw under the applicable agreement. A missing event alone does not
establish any of those decisions. Keep the explicit outcome when it is given.

When an independent approach is requested, withhold earlier accounts from
that phase's context. After exchange begins, label the inquiry as informed or
shared analysis. A participant who has read another account cannot become an
independent witness by changing its role name. Preserve the supplied context
with each contribution, including omitted material.

## Making and returning

Participants may make accounts or finished works. A textual work can become
another participant's primary input without acoustic conversion. Mark whether
that return addresses the original source or its descendant. A handover
passes an identified artifact and its terms; it does not pass another agent's
experience as if it were remembered by the receiver.

Keep disagreement attributed. A synthesis can identify a shared relation or
a remaining question without erasing the contributions that resist it.
Nominate the synthesis operation and its authors, and preserve the accounts
it used. Repeated wording is not an independent corroboration when the
participants shared that wording in context.

## End and maintenance

End this example after at most twelve declared turns. Its host must count
those turns within the inquiry's authenticated run scope. Reaching the limit
stops the next exchange; it does not authorize another run. Record the ending
and any explicit non-response before dissolution. Retention and disclosure
remain subject to inherited terms and owner controls.

Rewrite this file when another organization of exchange is useful. Adopt the
new revision at a declared scope and boundary. A narrower participant binding
inherits the active parent restrictions, and a replaced or revoked parent
requires explicit rebinding before another gate proceeds.

```listening-controls-v1
{
  "grammar": "akouo/listening-controls/v1",
  "context": {"policy": "explicit_selection", "max_bytes": 65536},
  "controls": [
    {"control_id": "declared-participants", "gate": "execution", "target": "execution.participant_refs", "operator": "allow_values", "values": ["illustrative:reader-a", "illustrative:reader-b"], "required": true},
    {"control_id": "ending", "gate": "execution", "target": "execution.turn_count", "operator": "max_value", "limit": 12, "required": true}
  ]
}
```
