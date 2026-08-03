# Accountable listening contract

AKOÚŌ v0.9 carries the accountable boundary introduced in v0.8 across
several listening moments. It records the conditions under which an
interpretation became possible, the source and cuts that conditioned it, the
route decisions that admitted or withheld it, and the limits on what may
happen next.

The canonical schema is
[`schemas/listening-context.schema.json`](schemas/listening-context.schema.json).
It is referenced by the standard listening output and bundled with each
standalone listening skill.

## Objects that must not collapse

| Object | Question | Canonical field |
| --- | --- | --- |
| Covenant | What may this listener receive, reveal, retain, or refuse? | `covenant` |
| Position | In what relation and situation did this listener listen? | `listening_context.position` |
| Apparatus | What could this technical or embodied substrate sense? | `apparatus` |
| Claim | What does the available evidence support? | `listening_claims` |
| Listening provenance | Which evidence streams, cuts, corpora, or voice source conditioned this hearing? | `listening_provenance` |
| Listening pass | Who or what listened, when, by which route, and with which influence? | `listening_passes` |
| Route decision | What did a gate decide, why, and under whose authority? | `route_decisions` |
| Ensemble | Are these merely plural reports, or an attributable ear swarm? | `ensemble` |

A model with audio input has a capability, not permission. A local DSP tool
can measure within its calibration and bandwidth, but cannot identify a social
scene. A covenant may close an aperture, but it does not turn the withheld
material into `undetermined`. A listening identity may orient attention, but
it is provenance rather than evidence.

## The context block

- `apertures` name the openings through which evidence was available,
  degraded, unavailable, or withheld.
- `auditory_scales` name the scales actually attended to: frame, gesture,
  event, scene, session, archive, lineage, infrastructure, or planet.
- `sources_of_listening` name evidence streams actually used, not every
  feature the apparatus could theoretically access.
- `participants` keep human, agent, hybrid, community, institutional, sensor,
  habitat, other-animal, ensemble, and other listeners attributable.
- `action_authority` separates observation, recommendation, request, and
  scoped execution. `observe_only` is the safe default.
- `honest_absences` distinguish unavailable, withheld, refused, not retained,
  and forgotten material. Epistemic uncertainty belongs in `undetermined`.
- `listening_passes` preserve each listening moment rather than flattening a
  live hearing, a past capture, and a re-listening into one timeless report.
- `route_decisions` make coded silence visible: pause, defer, abstain, refuse,
  withhold, forget, and do-not-act are addressable outcomes.
- `revision` makes re-listening additive. A new hearing points to what it
  revises; the earlier report remains intact.

## Producer rules

1. Parse or measure once at the boundary and retain the evidence source on
   every claim.
2. Emit context v2, provenance, passes, and route decisions for new v0.9
   reports. Readers keep an explicit compatibility path for v0.8 context v1.
3. Never upgrade model prose to `measured`; measurement requires a declared
   measuring apparatus.
4. Preserve alternative readings and cross-listener disagreement. Synthesis
   may summarize a disagreement but may not erase its participants.
5. Record absence with an attribution. Never infer or reconstruct withheld or
   forgotten content.
6. Treat recommendations as proposals. Execution requires separately scoped
   authority and a host-side receipt.
7. Reserve `heard` for an attributable embodied listener reporting what was
   directly present to a declared perceptual aperture. Treat model, sensor,
   prompt, transcript, description, and field-note output as measured,
   inferred, interpreted, or undetermined according to its actual basis.
8. Do not infer a corpus from a model output or provider label. Carry training,
   fine-tuning, retrieval, annotation, licensing, and jurisdiction as known,
   partial, unknown, or not applicable.
9. Do not call parallel or multi-listener execution an ear swarm. Require at
   least one declared influence edge, preserved permission and disagreement,
   and a dissolution rule.

## Stack ownership

AKOÚŌ owns this listening vocabulary and the claim taxonomy. OÍDA produces
route decisions, passes, provenance, and context at run time. Earworm stores
addressable auditums, pre-capture decisions, disagreement, absence, forgetting
receipts, and revision lineage without redefining AKOÚŌ fields. Akousmata
renders and audits those records and only declares an ear swarm when influence
is evidenced. AuditumSWE verifies the sealed boundary without exposing
benchmark subjects to memory.
