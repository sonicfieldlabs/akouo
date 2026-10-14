#!/usr/bin/env python3
"""Freeze/check canonical preset sidecars. Writing a preset never adopts it."""
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "src"))
from akouo_contract.listening_profiles import compile_profile, create_document, load_listening_presets

check = sys.argv[1:] == ["--check"]
if sys.argv[1:] not in ([], ["--check"]):
    raise SystemExit("Usage: generate-listening-presets.py [--check]")

manifest_path = REPO / "listening-profiles.manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
presets = []
purposes = {"minimal": "orientation", "research": "research", "phantom-acoustics": "imagination",
            "covenant": "covenant", "swarm": "swarm"}
for name, purpose in purposes.items():
    folder = REPO / "presets/listening-md" / name
    source = (folder / "LISTENING.md").read_bytes()
    metadata = folder / "document.json"
    old = json.loads(metadata.read_text(encoding="utf-8")) if metadata.exists() else None
    revision = f"akouo:preset:{name}:v1"
    if old is not None and old["sha256"] != __import__("hashlib").sha256(source).hexdigest():
        raise SystemExit(f"{name}: sealed revision changed; author a new revision explicitly")
    document = create_document(source, document_id=f"akouo:preset:{name}", revision_ref=revision,
                               representation_ref=revision + ":representation", artifact_ref=f"presets/listening-md/{name}/LISTENING.md",
                               authors=["sonicfieldlabs", "agent:codex"], authored_at=old["authored_at"] if old else datetime.now(timezone.utc).isoformat(),
                               terms_ref="license:MIT", purpose=purpose, schemas_dir=REPO / "schemas")
    profile = compile_profile(document, source, schemas_dir=REPO / "schemas")
    for path, value in ((metadata, document), (folder / "profile.json", profile)):
        expected = json.dumps(value, indent=2, ensure_ascii=False) + "\n"
        if check:
            if not path.exists() or path.read_text(encoding="utf-8") != expected:
                raise SystemExit(f"Stale preset sidecar: {path.relative_to(REPO)}")
        else:
            path.write_text(expected, encoding="utf-8")
    presets.append(dict(id=name, directory=f"presets/listening-md/{name}", revision_ref=document["revision_ref"],
                        document_sha256=document["sha256"], profile_ref=profile["profile_ref"], profile_sha256=profile["sha256"],
                        adoption="not_adopted", example_kind="illustrative"))
manifest["presets"] = presets
expected = json.dumps(manifest, indent=2) + "\n"
if check:
    if manifest_path.read_text(encoding="utf-8") != expected:
        raise SystemExit("Stale listening preset catalog")
else:
    manifest_path.write_text(expected, encoding="utf-8")
load_listening_presets(directory=REPO, schemas_dir=REPO / "schemas")
print("Five canonical complete presets, profiles and catalog agree; no adoption created.")
