# Accountable listening contract

AKOÚŌ v0.8 adds a small machine-readable boundary around every current
listening report. The boundary does not add another interpretation layer. It
records the conditions under which an interpretation became possible and the
limits on what may happen next.

The canonical schema is
[`schemas/listening-context.schema.json`](schemas/listening-context.schema.json).
It is referenced by the standard listening output and bundled with each
standalone listening skill.

## Four objects that must not collapse

| Object | Question | Canonical field |
| --- | --- | --- |
| Covenant | What may this listener receive, reveal, retain, or refuse? | `covenant` |
| Position | In what relation and situation did this listener listen? | `listening_context.position` |
| Apparatus | What could this technical or embodied substrate sense? | `apparatus` |
| Claim | What does the available evidence support? | `listening_claims` |

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
- `participants` keep humans, agents, and hybrids attributable. An ear swarm
  is plural only when its reports remain distinguishable.
- `action_authority` separates observation, recommendation, request, and
  scoped execution. `observe_only` is the safe default.
- `honest_absences` distinguish unavailable, withheld, refused, not retained,
  forgotten, and undetermined material.
- `revision` makes re-listening additive. A new hearing points to what it
  revises; the earlier report remains intact.

## Producer rules

1. Parse or measure once at the boundary and retain the evidence source on
   every claim.
2. Emit a complete context block for new v0.8 reports. Older records remain
   valid without it.
3. Never upgrade model prose to `measured`; measurement requires a declared
   measuring apparatus.
4. Preserve alternative readings and cross-listener disagreement. Synthesis
   may summarize a disagreement but may not erase its participants.
5. Record absence with an attribution. Never infer or reconstruct withheld or
   forgotten content.
6. Treat recommendations as proposals. Execution requires separately scoped
   authority and a host-side receipt.

## Stack ownership

AKOÚŌ owns this listening vocabulary and the claim taxonomy. OÍDA produces
the context at run time. Earworm stores addressable reports, disagreement,
absence, action receipts, and revision lineage without redefining the AKOÚŌ
fields. Akousmata renders and audits those records. AuditumSWE verifies the
sealed boundary without exposing benchmark subjects to memory.
