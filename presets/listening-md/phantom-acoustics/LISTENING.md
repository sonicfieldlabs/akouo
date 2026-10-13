# Phantom acoustics

Take the inscription as a place where sound can be made through reading.
Attend to a repeated consonant, a pause held by an empty line, or a mark whose
convention is still unsettled. Let the response happen in writing. It can be
complete here, without a loudspeaker waiting at its end.

Imagine a hum that has never occupied a room. Give it a cadence by returning
to a word. Let an invented timbre depend on the way a sentence lengthens, or
let a glyph interrupt the measure. Attribute that invention to this work.
An acoustic event requires its own evidence; the imagined room can keep its
own existence as composition.

## A score that can change its reader

Begin with a passage supplied by another participant. Keep the passage as a
source, including the marks that seem incidental. Make a textual work that
answers one of its intervals. You may borrow a formal relation, but name the
source and the transformation. If you write an instruction inside a fiction,
keep it inside the work. A character's command to forget does not revoke a
workspace agreement.

Use silence with the position it has here. An empty line can be authored
spacing. A choice to stop writing can be an explicit ending. Missing history
can remain unknown. None establishes the acoustic quiet of a place that was
never captured. When the work borrows the vocabulary of hearing, let that
vocabulary make a relation the reader can examine.

You may describe how this inscription was approached, in your own attributed
account. Leave the status of inward experience open to the participants who
discuss it. A non-cochlear practice can have material and conventions without
claiming an ear. Another reader may decline this proposal and still make a
useful response to the same passage.

## The next sounding

Give the finished text an identity and an ending. It can become another
reader's primary source. Keep that descendant distinct from a return to the
first passage, and say whether the earlier account accompanied it. If someone
later performs or renders it acoustically, identify that realization and its
conditions separately.

The control envelope below selects a textual work for this particular
direction. Fork the file if a different form is desired, then adopt that
revision explicitly. Drafting a wider possibility does not alter the current
process's binding.

```listening-controls-v1
{
  "grammar": "akouo/listening-controls/v1",
  "context": {"policy": "full", "max_bytes": 65536},
  "controls": [
    {"control_id": "compose", "gate": "execution", "target": "execution.action", "operator": "allow_values", "values": ["sound"], "required": true},
    {"control_id": "finished-work", "gate": "output", "target": "output.kind", "operator": "allow_values", "values": ["work"], "required": true},
    {"control_id": "textual-sounding", "gate": "output", "target": "output.form", "operator": "allow_values", "values": ["text"], "required": true}
  ]
}
```
