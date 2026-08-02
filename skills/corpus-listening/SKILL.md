---
name: corpus-listening
description: >-
  AKOÚŌ inheritance ear for auditing training corpora, fine-tunes, codecs,
  datasets, taxonomies, defaults, and unknown provenance that condition a
  machine listening. Use when a task asks what a model learned from, which
  categories or exclusions it inherits, or how prior listening shapes a
  present encounter. Never reconstruct undisclosed training data.
---

# Corpus listening

`corpus-listening` listens backward from a present computational ear toward the
prior hearings sedimented in its weights, codec choices, labels, defaults, and
institutional conditions. It treats that inheritance as part of the apparatus,
not as a hidden universal culture and not as proof about the present sound.

## Required distinctions

1. **Present evidence is not training evidence.** A current output can reveal a
   behavior without identifying the exact material that trained it.
2. **Known, partial, unknown, and not applicable are real states.** Use the
   disclosure status supplied by the source. Never fill an unknown corpus with
   likely datasets, genres, languages, communities, or recordings.
3. **Documentation is attributed testimony.** Model cards, provider pages,
   licenses, papers, and operator notes must keep their source and date.
4. **Inheritance is not authority.** A trained capability does not confer
   permission to capture, identify, retain, disclose, or act.
5. **Absence in a corpus is not absence in a world.** Name coverage and
   exclusion limits without treating the dataset as a population census.
6. **The cut is inspectable.** Record codecs, filters, label taxonomies,
   preprocessing, sampling, moderation, and evaluation choices when known.

## Procedure

1. Inventory the model, provider, revision, modality, and present route.
2. Gather only declared corpus and fine-tune evidence.
3. Record inherited categories, languages, scales, exclusions, permissions,
   labor, and jurisdictions that the evidence actually supports.
4. Mark undisclosed or unverifiable lineage as `unknown`.
5. Relate inherited conditions to the present aperture and claim limits.
6. Ask who can inspect, contest, revise, or refuse this inherited listening.
7. Propose a new test or listening route when a limitation can be examined
   without reconstructing protected or undisclosed material.

## Output discipline

- Use `references/listening-output.schema.json` and
  `references/listening-context.schema.json`.
- Emit `listening_provenance` using
  `references/listening-provenance.schema.json`.
- Every corpus entry names a `source_ref` and disclosure status.
- Textual documentation never enters `listening_claims.heard`.
- Keep `undetermined` as an epistemic claim and honest absence as an attributed
  availability or permission condition.
- Default action authority to `observe_only`.

## Refusals

Refuse to infer exact training recordings, speakers, communities, copyrighted
works, consent, ownership, or demographic composition from model behavior alone.
Refuse requests to reconstruct withheld lineage. Record that refusal as a route
decision when the host supports `references/route-decision.schema.json`.
