"""AKOÚŌ's listening router as code.

``route`` is the reference heuristic of ``skills/akouo-router`` (the same rules the reference app
reads, packaged as ``data/router-rules.json``): input-type, keyword-family, command and evidence
weights add per mode; the primary is the highest score, the secondary the next, the corrective the
best-scoring mode of the corrective set; margins set the route confidence.

``route_account`` routes a re-listening. Between passes over one retained excerpt the evidence does
not change, so input-type and evidence weights would only repeat themselves; it reads the latest
machine account by the keyword families alone (with an optional task command as frame), keeps
negated mentions ("no speech is audible") from counting as mentions, corrects for vococentrism,
names the coarse kinds the account was heard as, and keeps an alternative reading alive. The
result is an attributed reading of an account, never a measurement.
"""
from __future__ import annotations

import json
import re
from functools import lru_cache
from typing import Any, Iterable

from . import __version__, root

ROUTER_ID = f"akouo-contract/router {__version__}"
ROUTER_RULES_CONTRACT = "akouo/router-rules/v1"

#: Kinds an account can be heard as, read from the same keyword families as the modes.
HEARD_AS = {
    "music": "musical-aesthetic-listening",
    "speech": "voice-speech-listening",
    "soundscape": "ecological-posthuman-listening",
    "material": "material-event-listening",
    "signal": "signal-inspection-listening",
}
SILENCE_TERMS = ("silence", "silent", "near silence", "no audible", "nothing audible", "inaudible", "empty", "dead air")
_NEGATORS = {"no", "not", "without", "absent", "absence", "lacks", "lacking", "neither", "nor", "none", "never"}
_FIELD_MODES = ("musical-aesthetic-listening", "ecological-posthuman-listening", "material-event-listening")


@lru_cache(maxsize=1)
def rules() -> dict[str, Any]:
    data = json.loads((root() / "router-rules.json").read_text(encoding="utf-8"))
    if data.get("contract") != ROUTER_RULES_CONTRACT:
        raise ValueError("unsupported router rules")
    return data


def _normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def _pluralize(word: str) -> str:
    if word.endswith("s"):
        return word
    if word.endswith("y") and not re.search(r"[aeiou]y$", word):
        return word[:-1] + "ies"
    if word.endswith(("ch", "sh", "x", "z")):
        return word + "es"
    return word + "s"


def _variants(term: str) -> list[str]:
    if not term:
        return []
    variants = [term]
    words = term.split(" ")
    last = words[-1]
    if re.fullmatch(r"[a-z]+", last) and len(last) > 2:
        plural = " ".join(words[:-1] + [_pluralize(last)])
        if plural not in variants:
            variants.append(plural)
    return variants


def has_any_term(value: str, terms: Iterable[str]) -> bool:
    """The reference app's term match: whole words after normalization, with a plural variant."""
    normalized = f" {_normalize(value)} "
    if not normalized.strip():
        return False
    return any(f" {variant} " in normalized for term in terms for variant in _variants(_normalize(term)))


def _rule_matches(rule: dict, text: str, input_type: str | None, command: str | None) -> bool:
    if command and command in (rule.get("commands") or []):
        return True
    if input_type and input_type in (rule.get("inputTypes") or []):
        return True
    return bool(rule.get("terms")) and has_any_term(text, rule["terms"])


def _scores(text: str, *, input_type: str | None, command: str | None) -> list[dict]:
    data = rules()
    scores = [{"mode": mode, "score": 0, "reasons": []} for mode in data["modes"]]
    by_mode = {item["mode"]: item for item in scores}
    for rule in data["rules"]:
        if _rule_matches(rule, text, input_type, command) and rule["mode"] in by_mode:
            by_mode[rule["mode"]]["score"] += rule["weight"]
            by_mode[rule["mode"]]["reasons"].append(rule["reason"])
    return scores


def _add(scores: list[dict], mode: str, weight: int, reason: str) -> None:
    for item in scores:
        if item["mode"] == mode:
            item["score"] += weight
            item["reasons"].append(reason)
            return


def _first(scores: list[dict], excluded: Iterable[str] = (), within: Iterable[str] | None = None) -> str | None:
    excluded = set(excluded)
    allowed = set(within) if within is not None else None
    for item in scores:
        if item["score"] > 0 and item["mode"] not in excluded and (allowed is None or item["mode"] in allowed):
            return item["mode"]
    return None


_FALLBACK_SECONDARY = {
    "signal-inspection-listening": "transductive-media-listening",
    "audiovisual-scenic-listening": "acoulogical-object-listening",
    "voice-speech-listening": "transductive-media-listening",
    "accessibility-normative-listening": "voice-speech-listening",
    "material-event-listening": "signal-inspection-listening",
    "ecological-posthuman-listening": "transductive-media-listening",
    "forensic-archival-listening": "signal-inspection-listening",
    "symbolic-fictional-listening": "embodied-affective-listening",
    "musical-aesthetic-listening": "acoulogical-object-listening",
    "memory-lineage-listening": "acoulogical-object-listening",
    "sovereign-listening": "critical-political-listening",
    "corpus-listening": "critical-political-listening",
}


def _roles(scores: list[dict]) -> tuple[str, str, str]:
    primary = _first(scores) or "acoulogical-object-listening"
    secondary = _first(scores, [primary]) or _FALLBACK_SECONDARY.get(primary, "signal-inspection-listening")
    corrective = _first(scores, [primary, secondary], rules()["corrective_modes"])
    if corrective is None:
        preferred = [
            "critical-political-listening",
            "accessibility-normative-listening",
            "transductive-media-listening",
            "signal-inspection-listening",
            "acoulogical-object-listening",
        ]
        corrective = next((m for m in preferred if m not in (primary, secondary)), "critical-political-listening")
    return primary, secondary, corrective


def _confidence(scores: list[dict], has_input: bool) -> str:
    if not has_input:
        return "undetermined"
    top = scores[0]["score"] if scores else 0
    second = scores[1]["score"] if len(scores) > 1 else 0
    if top <= 0:
        return "low"
    if top >= 6 and top >= second + 4:
        return "high"
    if top >= second + 2:
        return "medium"
    return "low"


def _reasoning(scores: list[dict], modes: Iterable[str]) -> list[str]:
    by_mode = {item["mode"]: item for item in scores}
    out = []
    for mode in modes:
        reasons = by_mode.get(mode, {}).get("reasons") or ["Selected as a balancing listening mode."]
        out.append(f"{mode}: {reasons[0]}")
    return out


def route(
    *,
    prompt: str = "",
    object_name: str = "",
    input_type: str = "unknown",
    command: str | None = None,
    audio_inspection: bool = False,
) -> dict[str, Any]:
    """The reference router (parity with the reference app's createRouteDraft roles and confidence)."""
    text = f"{prompt} {object_name} {input_type} {command or ''}"
    scores = _scores(text, input_type=input_type, command=command)
    if audio_inspection:
        _add(scores, "signal-inspection-listening", 3, "Decoded audio metadata is available.")
        _add(scores, "transductive-media-listening", 1, "Uploaded audio still has an unknown capture and encoding chain.")
    if not prompt.strip() and not audio_inspection:
        _add(scores, "acoulogical-object-listening", 1, "No input was supplied; default to minimal perceptual caution.")
    scores.sort(key=lambda item: -item["score"])
    primary, secondary, corrective = _roles(scores)
    has_input = bool(prompt.strip() or audio_inspection or object_name.strip())
    return {
        "primary": primary,
        "secondary": secondary,
        "corrective": corrective,
        "confidence": _confidence(scores, has_input),
        "route_reasoning": _reasoning(scores, (primary, secondary, corrective)),
        "router": ROUTER_ID,
    }


def _strip_negated(text: str) -> str:
    """Drop the words a negator governs (up to four, or to the next clause) from a normalized text."""
    out, skip = [], 0
    for word in _normalize(text).split():
        if word in _NEGATORS:
            skip = 4
            continue
        if skip:
            skip -= 1
            if word in {"and", "but", "while", "though", "yet"}:
                skip = 0
                out.append(word)
            continue
        out.append(word)
    return " ".join(out)


def route_account(
    account: str,
    *,
    command: str | None = None,
    heard: Iterable[str] = (),
    generated: bool = False,
) -> dict[str, Any]:
    """Route the next listening of one retained excerpt from its latest machine account.

    ``command`` frames the task (for example ``/field`` for open-microphone radio); ``heard`` names
    modes already listened in, so the alternative reading points somewhere new. The result carries
    the primary, secondary and corrective ears, the route confidence, the coarse kinds the account
    was heard as, a reasoning line and an alternative reading.
    """
    text = _strip_negated(account or "")
    scores = _scores(text, input_type=None, command=command)
    scores.sort(key=lambda item: -item["score"])
    by_mode = {item["mode"]: item for item in scores}
    corrected = False
    if scores and scores[0]["mode"] == "voice-speech-listening" and command not in {"/voice"}:
        rival = next((item for item in scores[1:] if item["mode"] in _FIELD_MODES and item["score"] > 0), None)
        if rival is not None:
            # Vococentrism: speech inside music or a soundscape does not capture the route.
            scores.remove(rival)
            scores.insert(0, rival)
            corrected = True
    primary, secondary, corrective = _roles(scores)
    heard_as = [kind for kind, mode in HEARD_AS.items() if by_mode.get(mode, {}).get("score", 0) > 0]
    if has_any_term(text, SILENCE_TERMS) or (account or "").strip() and not text.strip():
        heard_as.append("silence")
    if generated:
        heard_as.append("generated")
    if not heard_as:
        heard_as.append("unknown")
    confidence = _confidence(scores, bool((account or "").strip()))
    if corrected and confidence == "high":
        confidence = "medium"
    reasons = _reasoning(scores, (primary,))
    reasoning = f"The account reads as {', '.join(heard_as)}; {reasons[0]}"
    if corrected:
        reasoning += " Speech is present but does not capture the route."
    heard = set(heard)
    alternative = next(
        (m for m in (secondary, corrective) if m not in heard and m != primary),
        secondary,
    )
    return {
        "primary": primary,
        "secondary": secondary,
        "corrective": corrective,
        "confidence": confidence,
        "heard_as": list(dict.fromkeys(heard_as))[:8],
        "reasoning": reasoning[:2000],
        "alternative_reading": f"The same excerpt could be heard through {alternative}: "
        + (by_mode.get(alternative, {}).get("reasons") or ["it keeps another reading alive."])[0],
        "scores": [{"mode": item["mode"], "score": item["score"]} for item in scores if item["score"] > 0][:6],
        "router": ROUTER_ID,
    }
