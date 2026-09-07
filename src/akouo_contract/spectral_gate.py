"""Conservative extended-spectrum gate; no model invocation or physical measurement."""
from __future__ import annotations
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from .validation import contract_errors

EXTENDED_SPECTRUM_CONTRACT = "akouo/extended-spectrum-request/v0.1"


def extended_spectrum_decision(
    access: dict, request: dict, *, actor: str,
    validate_access: Callable[[Any], list[str]],
    schemas_dir: Path | None = None,
) -> dict:
    """Use the negotiated Earworm validator supplied by the host, without duplication.

    Resolved references assert the host's validated evidence scope. This gate
    checks declared support, not evidence truth, successful measurement, or hearing.
    """
    if not isinstance(actor, str) or not actor.strip():
        raise ValueError("An attributable actor is required")
    if not callable(validate_access):
        raise TypeError("The negotiated Earworm access validator is required")
    errors = contract_errors("extended-spectrum-request", request, schemas_dir=schemas_dir)
    if errors:
        raise ValueError("; ".join(errors))
    band, window = request["band_hz"], request["window_s"]
    if band["lower"] >= band["upper"] or window["start"] >= window["end"]:
        raise ValueError("Requested band and window must have increasing bounds")
    missing, unsupported = [], []
    access_errors = validate_access(access)
    if not isinstance(access_errors, list) or any(not isinstance(error, str) for error in access_errors):
        raise TypeError("Access validator must return a list of error strings")
    if access_errors:
        missing.append("Invalid or unsupported access declaration: " + "; ".join(access_errors))
    elif access.get("contract") != "earworm/listening-access/v1":
        missing.append("The declared access contract is not supported")
    else:
        if request["subject_ref"] != access["subject_ref"]:
            missing.append("Requested subject does not match the access declaration")
        resolved = set(request["resolved_refs"])
        required = {access["subject_ref"]}
        for name, key in (("capture", "supported_band_hz"), ("sampled_representation", "retained_band_hz"), ("model_input", "effective_band_hz")):
            block = access[name]
            if block["status"] != "known":
                missing.append(f"{name} support is {block['status']}")
                continue
            required.update(block["evidence_refs"])
            required.update(block[field] for field in ("apparatus_ref", "representation_ref", "model_ref") if field in block)
            supported_band = block[key]
            if band["lower"] < supported_band["lower"] or band["upper"] > supported_band["upper"]:
                unsupported.append(f"Requested band falls outside {name} support")
        sampled, model = access["sampled_representation"], access["model_input"]
        if model["status"] == "known":
            if window["start"] < model["window_s"]["start"] or window["end"] > model["window_s"]["end"]:
                unsupported.append("Requested window falls outside the effective model input")
            if request["channel_count"] != model["channels"]:
                unsupported.append("Requested channel count differs from the effective model input")
            if model["blind_spots"]:
                missing.append("Declared model blind spots require a more specific assessment")
            receipts = request["preprocessing"]
            if [receipt["receipt_ref"] for receipt in receipts] != model["preprocessing_refs"]:
                missing.append("Preprocessing receipts do not match the declared input chain")
            required.update(model["preprocessing_refs"])
            if sampled["status"] == "known":
                current = sampled["representation_ref"]
                for receipt in receipts:
                    required.update((receipt["input_ref"], receipt["output_ref"]))
                    if receipt["input_ref"] != current:
                        missing.append("Preprocessing chain has an unresolved input")
                    current = receipt["output_ref"]
                    if receipt["kind"] not in ("identity", "filtered_resample", "channel_mix", "window_crop"):
                        missing.append("Preprocessing changes or does not establish the physical frequency mapping")
                if current != model["representation_ref"]:
                    missing.append("Preprocessing chain does not reach the effective model input")
                kinds = {receipt["kind"] for receipt in receipts}
                if sampled["sample_rate_hz"] != model["sample_rate_hz"] and "filtered_resample" not in kinds:
                    missing.append("Rate conversion requires a filtered-resampling receipt")
                if sampled["channels"] != model["channels"] and "channel_mix" not in kinds:
                    missing.append("Channel change requires a channel-mapping receipt")
                if sampled["representation_ref"] == model["representation_ref"] and (
                    sampled["sample_rate_hz"] != model["sample_rate_hz"] or sampled["channels"] != model["channels"]
                ):
                    missing.append("One representation cannot declare conflicting rates or channel counts")
        unresolved = required - resolved
        if unresolved:
            missing.append("Unresolved evidence or apparatus references: " + ", ".join(sorted(unresolved)))
    if request["claim_kind"] != "spectral_measurement":
        missing.append("This gate does not establish native understanding, embodied hearing, or calibrated SPL")
    # A coordinate change makes direct band comparisons inconclusive, even if
    # some declared bands would otherwise exclude the request.
    mapping_unknown = any("frequency mapping" in reason for reason in missing)
    support = "undetermined" if mapping_unknown else "unsupported" if unsupported else "undetermined" if missing else "supported"
    reasons = unsupported + missing
    proceed = support == "supported"
    reason = "; ".join(reasons) if reasons else "Declared capture, sampled representation, effective input and resolved evidence support an observe-only measurement attempt. No measurement or hearing has yet been established."
    decision = {
        "id": f"{request['request_id']}:spectral-gate", "gate": "inference",
        "outcome": "proceed" if proceed else "abstain", "subject": request["subject_ref"],
        "reason": reason, "decided_at": datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        "authority": {"mode": "observe_only", "actor": actor, "requires_confirmation": True, "reversible": True},
    }
    decision_errors = contract_errors("route-decision", decision, schemas_dir=schemas_dir)
    if decision_errors:
        raise ValueError("; ".join(decision_errors))
    return {"support": support, "claim_status": "undetermined", "measurement_permitted": proceed, "decision": decision}
