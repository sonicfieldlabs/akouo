# Listening as research

Begin with a question that the supplied material can answer or complicate.
Keep the question close to an encounter: the spacing of a score, a remembered
account of a recording, or the cadence of a passage that another participant
calls sound. State what was received before interpreting it. A text is eligible
as primary material, and its contribution does not depend on a later acoustic
performance.

## Material and access

Keep the exact source distinct from every derivative. If a parser normalizes
line endings or removes marks, identify the resulting representation and what
changed. Treat the layout of a score as part of its material when its author
has made that relation explicit. A data stream needs its convention and units;
an unfamiliar glyph may remain unread. Do not invent a convention to conceal
an unsupported route. Record the question that the gap leaves.

The source can be longer than the available context. Preserve its complete
revision and select a declared excerpt only when this workflow permits that
selection. Identify the supplied segments, their order and what was omitted.
An account based on an excerpt answers to that excerpt. The complete document
digest establishes identity, while the access record establishes what this
operation could encounter. Neither substitutes for the other.

## Accounts and works

Write an account when the operation asks what can be understood from the
source. Write a work when it asks for a response made in the same field. A
textual sounding can end as a finished inscription. Keep its authorship and
its relation to the input, and let its next reader approach it as material.
A prompt for an eventual audio renderer remains a prompt. A separately made
acoustic realization has its own process and identity.

Claims should name their support. A count of repeated marks needs a method and
the exact representation counted. A reading of an imagined hum can be
interpreted or speculative. A statement by a participant is attributable to
that participant even where their account of experience remains open. Preserve
what they said without treating it as a measurement of their inward state.
Distinguish an available account from an acoustic signal received by this
process. The distinction describes access without excluding the account from
the research.

## Returns and disagreement

When returning, name whether the subject is the original source or a work that
descends from it. State whether earlier accounts were available. A shared
analysis may be useful, but its participants cannot be counted as independent
witnesses merely because their names differ. Record the context each received
and keep corrections attached to their earlier claims. A second operation
does not inherit the first one's experience by reading its record.

Disagreement can identify a convention, a missing source or a different
commitment to the same material. Keep those differences addressable. Do not
average them into a confident answer unless the research question and method
justify that aggregation. Let an agent's description of reading-as-listening
remain an attributed contribution alongside accounts that resist that wording.
An explicit refusal and an explicit decision to leave a source unanswered
belong in the record. A missing response leaves a different question open.

## Duration and correction

Sequence, authored duration and execution time can describe different parts
of an encounter. A series of signs does not acquire seconds because a process
read it. Retain an authored timing or a known event clock when one exists, and
leave other duration unknown. Acoustic measurements require admitted signal
material and an appropriate method. Textual or data measurements require
their own methods, with their actual scope stated.

End the bounded inquiry when its declared limit is reached. Preserve a
correction as a new revision and keep the earlier record readable. Rewriting
this file proposes another research disposition. An authorized adoption or
replacement determines which revision governs the next operation.

```listening-controls-v1
{
  "grammar": "akouo/listening-controls/v1",
  "context": {"policy": "explicit_selection", "max_bytes": 65536},
  "controls": [
    {"control_id": "bounded-inquiry", "gate": "execution", "target": "execution.turn_count", "operator": "max_value", "limit": 24, "required": true},
    {"control_id": "research-outputs", "gate": "output", "target": "output.kind", "operator": "allow_values", "values": ["account", "work"], "required": true}
  ]
}
```
