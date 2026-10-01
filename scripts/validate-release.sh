#!/usr/bin/env bash
set -euo pipefail

# AKOÚŌ Release Validation Script
# Run this before releasing skills to verify structural integrity,
# schema consistency, and public-repo hygiene.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_DIR="$REPO_ROOT/skills"
SCHEMAS_DIR="$REPO_ROOT/schemas"
ERRORS=0

echo "=== AKOÚŌ Release Validation ==="
echo "Repository: $REPO_ROOT"
echo

# 1. Check skill folder structure
echo "[1/9] Checking skill folder structure..."
LISTENING_MODES=(
  "agent-native-listening"
  "signal-inspection-listening"
  "acoulogical-object-listening"
  "embodied-affective-listening"
  "transductive-media-listening"
  "forensic-archival-listening"
  "ecological-posthuman-listening"
  "critical-political-listening"
  "musical-aesthetic-listening"
  "symbolic-fictional-listening"
  "audiovisual-scenic-listening"
  "voice-speech-listening"
  "accessibility-normative-listening"
  "material-event-listening"
  "memory-lineage-listening"
  "sovereign-listening"
  "corpus-listening"
)
EXPECTED_SKILLS=(
  "akouo-router"
  "reference-layer"
  "${LISTENING_MODES[@]}"
)

while IFS= read -r skill_path; do
  skill=$(basename "$skill_path")
  if ! printf '%s\n' "${EXPECTED_SKILLS[@]}" | grep -qx "$skill"; then
    echo "  ERROR: Unexpected skill folder: $skill"
    ERRORS=$((ERRORS + 1))
  fi
done < <(find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort)

for skill in "${EXPECTED_SKILLS[@]}"; do
  skill_path="$SKILLS_DIR/$skill"
  if [ ! -d "$skill_path" ]; then
    echo "  ERROR: Missing skill folder: $skill"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  if [ ! -f "$skill_path/SKILL.md" ]; then
    echo "  ERROR: Missing SKILL.md in: $skill"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  skill_md_count=$(find "$skill_path" -name 'SKILL.md' -type f | wc -l | tr -d ' ')
  if [ "$skill_md_count" != "1" ]; then
    echo "  ERROR: Expected exactly one SKILL.md in $skill, found $skill_md_count"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  # Check YAML frontmatter
  if ! head -n 1 "$skill_path/SKILL.md" | grep -q '^---$'; then
    echo "  ERROR: Missing YAML frontmatter opening in: $skill"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  # Check name field matches folder
  name=$(head -n 20 "$skill_path/SKILL.md" | grep '^name:' | head -n 1 | sed 's/name: //' | tr -d ' ')
  if [ "$name" != "$skill" ]; then
    echo "  ERROR: Name '$name' doesn't match folder '$skill'"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  echo "  OK: $skill"
done

# 2. Check no old flat .md files remain in skills/
echo
echo "[2/9] Checking for old flat skill files..."
FLAT_MD=$(find "$SKILLS_DIR" -maxdepth 1 -name '*.md' -type f 2>/dev/null || true)
if [ -n "$FLAT_MD" ]; then
  echo "  ERROR: Old flat .md files found in skills/:"
  echo "$FLAT_MD" | sed 's/^/    /'
  ERRORS=$((ERRORS + 1))
else
  echo "  OK: No flat .md files found"
fi

# 3. Check bundled schemas match canonical schemas
echo
echo "[3/9] Checking bundled schema consistency..."
SCHEMA_OK=1
for skill in "${EXPECTED_SKILLS[@]}"; do
  ref_dir="$SKILLS_DIR/$skill/references"
  if [ ! -d "$ref_dir" ]; then
    echo "  ERROR: No references/ folder for $skill"
    ERRORS=$((ERRORS + 1))
    SCHEMA_OK=0
    continue
  fi

  required_refs=(
    "claim-taxonomy.schema.json"
    "listening-context.schema.json"
    "listening-output.schema.json"
    "listening-pass.schema.json"
    "listening-provenance.schema.json"
    "route-decision.schema.json"
    "ensemble.schema.json"
  )
  if [ "$skill" = "akouo-router" ]; then
    required_refs+=("router-output.schema.json" "routing-plan.schema.json")
  fi
  if [ "$skill" = "reference-layer" ]; then
    required_refs+=("reference-map.schema.json")
  fi

  for required_ref in "${required_refs[@]}"; do
    if [ ! -f "$ref_dir/$required_ref" ]; then
      echo "  ERROR: $skill missing bundled schema: $required_ref"
      ERRORS=$((ERRORS + 1))
      SCHEMA_OK=0
    fi
  done

  for ref_file in "$ref_dir"/*.json; do
    [ -e "$ref_file" ] || continue
    basename=$(basename "$ref_file")
    canonical="$SCHEMAS_DIR/$basename"
    if [ ! -f "$canonical" ]; then
      echo "  ERROR: Bundled schema $basename has no canonical source"
      ERRORS=$((ERRORS + 1))
      SCHEMA_OK=0
      continue
    fi
    if ! diff -q "$ref_file" "$canonical" > /dev/null 2>&1; then
      echo "  ERROR: $skill/references/$basename differs from schemas/"
      ERRORS=$((ERRORS + 1))
      SCHEMA_OK=0
      continue
    fi
  done
done
if [ "$SCHEMA_OK" -eq 1 ]; then
  echo "  OK: All bundled schemas match canonical sources"
fi

# 4. Check schema references in SKILL.md point to existing files
echo
echo "[4/9] Checking schema references in SKILL.md files..."
REFS_OK=1
for skill in "${EXPECTED_SKILLS[@]}"; do
  skill_md="$SKILLS_DIR/$skill/SKILL.md"
  refs=$(grep -oE 'references/[^` ]+\.json' "$skill_md" || true)
  for ref in $refs; do
    ref_path="$SKILLS_DIR/$skill/$ref"
    if [ ! -f "$ref_path" ]; then
      echo "  ERROR: $skill references missing file: $ref"
      ERRORS=$((ERRORS + 1))
      REFS_OK=0
    fi
  done
done
if [ "$REFS_OK" -eq 1 ]; then
  echo "  OK: All schema references resolve"
fi

# 5. Check schema enums stay aligned with skill folders and command files
echo
echo "[5/9] Checking schema enums against skills/ and commands/..."
ENUMS_OK=1

for mode in "${LISTENING_MODES[@]}"; do
  if ! grep -q "\"$mode\"" "$SCHEMAS_DIR/listening-output.schema.json"; then
    echo "  ERROR: listening-output.schema.json listening_mode enum missing: $mode"
    ERRORS=$((ERRORS + 1))
    ENUMS_OK=0
  fi
done

for skill in "${EXPECTED_SKILLS[@]}"; do
  if ! grep -q "\"$skill\"" "$SCHEMAS_DIR/command-output.schema.json"; then
    echo "  ERROR: command-output.schema.json callable_skill enum missing: $skill"
    ERRORS=$((ERRORS + 1))
    ENUMS_OK=0
  fi
done

while IFS= read -r enum_command; do
  command_file="$REPO_ROOT/commands/${enum_command#/}.md"
  if [ ! -f "$command_file" ]; then
    echo "  ERROR: router-output.schema.json command enum lists $enum_command but commands/${enum_command#/}.md is missing"
    ERRORS=$((ERRORS + 1))
    ENUMS_OK=0
  fi
done < <(grep -oE '"/[a-z-]+"' "$SCHEMAS_DIR/router-output.schema.json" | tr -d '"')

while IFS= read -r command_path; do
  command_name="/$(basename "$command_path" .md)"
  if ! grep -q "\"$command_name\"" "$SCHEMAS_DIR/router-output.schema.json"; then
    echo "  ERROR: commands/$(basename "$command_path") exists but $command_name is missing from router-output.schema.json command enum"
    ERRORS=$((ERRORS + 1))
    ENUMS_OK=0
  fi
done < <(find "$REPO_ROOT/commands" -maxdepth 1 -name '*.md' -type f)

if [ "$ENUMS_OK" -eq 1 ]; then
  echo "  OK: Schema enums match skill folders and command files"
fi

# 6. Check examples against canonical schema structure
echo
echo "[6/9] Checking examples against canonical schema structure..."
# Finding P1-14 / R-A. The Python tests used to run under an ambient
# interpreter against the source tree, which failed with
# ModuleNotFoundError: No module named 'akouo_contract' and was read as a
# packaging defect. It was not: it only showed that the package was not
# installed where the gate looked.
#
# It also could not have shown what this gate is for. The wheel force-includes
# the manifests, schemas, presets, skills, commands and system guide under
# akouo_contract/data; a test run against src/ reads those from the repository
# root and would pass even if the wheel shipped none of them. So the gate now
# builds the wheel, installs it into a throwaway environment, and runs the tests
# against the installed package — which is the only thing a release actually
# hands anyone.
run_python_contract_tests() {
  local venv wheel
  if [ ! -f "${AKOUO_AKOUSMA_WHEEL:-}" ] || [ -z "${AKOUO_AKOUSMA_SHA256:-}" ]; then
    echo "  FAIL: set AKOUO_AKOUSMA_WHEEL and AKOUO_AKOUSMA_SHA256 to the reviewed Earworm wheel."
    echo "        Installed record-workflow tests are required, not optional skips."
    return 1
  fi
  if [ "$(shasum -a 256 "$AKOUO_AKOUSMA_WHEEL" | cut -d ' ' -f 1)" != "$AKOUO_AKOUSMA_SHA256" ]; then
    echo "  FAIL: Earworm wheel hash does not match the supplied identity"
    return 1
  fi
  venv="$(mktemp -d)"
  trap 'rm -rf "$venv"' RETURN

  if command -v uv >/dev/null 2>&1; then
    uv build --wheel --out-dir "$venv/dist" "$REPO_ROOT" >/dev/null 2>&1 || {
      echo "  FAIL: the wheel did not build"
      return 1
    }
    wheel="$(find "$venv/dist" -name '*.whl' -print -quit)"
    [ -n "$wheel" ] || { echo "  FAIL: no wheel was produced"; return 1; }
    uv venv --python "${AKOUO_TEST_PYTHON:-3.12}" "$venv/env" >/dev/null 2>&1 || return 1
    # pytest travels with the test environment, not with the package. It is
    # needed because four test modules are written in pytest style; under the
    # previously documented `unittest discover` those seventeen functions were
    # collected and never called. pytest collects unittest.TestCase classes too,
    # so one runner runs all of them.
    VIRTUAL_ENV="$venv/env" uv pip install --quiet "$wheel" "$AKOUO_AKOUSMA_WHEEL" pytest >/dev/null 2>&1 || {
      echo "  FAIL: the built wheel did not install"
      return 1
    }
    # Prove the tests will import the *installed* package rather than src/.
    # Running from the repository root is fine — src/ is not on sys.path there —
    # but "fine" is not evidence, so the location is asserted.
    PYTHONPATH= "$venv/env/bin/python" - <<PYWHERE || return 1
import akouo_contract, akousma, sys
if "site-packages" not in (akousma.__file__ or ""):
    sys.exit("FAIL: Earworm is not installed from the candidate wheel")
where = akouo_contract.__file__ or ""
if "site-packages" not in where:
    print(f"  FAIL: akouo_contract resolved to {where}, not the installed wheel")
    sys.exit(1)
print(f"  OK: akouo_contract imports from the installed wheel")
PYWHERE
    ( cd "$REPO_ROOT" && PYTHONPATH= "$venv/env/bin/python" -m pytest tests -q -p no:cacheprovider --junitxml="$venv/results.xml" ) || return 1
    "$venv/env/bin/python" - "$venv/results.xml" <<'PYRESULT' || return 1
import sys
import xml.etree.ElementTree as ET
root = ET.parse(sys.argv[1]).getroot()
cases = list(root.iter("testcase"))
if not cases or list(root.iter("skipped")):
    sys.exit("FAIL: installed-package gate collected no cases or skipped required tests")
print(f"  OK: {len(cases)} installed-package cases, no skips")
PYRESULT
    # The data is the reason this package exists; prove the wheel carries it.
    "$venv/env/bin/python" - <<'PYCHECK' || return 1
import importlib.resources as resources
import sys

required = [
    "akouo.manifest.json",
    "agent-routes.manifest.json",
    "SYSTEM_GUIDE.md",
]
data = resources.files("akouo_contract") / "data"
missing = [name for name in required if not (data / name).is_file()]
for folder in ("schemas", "presets", "skills", "commands", "companions"):
    if not (data / folder).is_dir():
        missing.append(folder + "/")
if missing:
    print("  FAIL: the installed wheel is missing bundled data: " + ", ".join(missing))
    sys.exit(1)
skills = sum(1 for entry in (data / "skills").iterdir() if entry.is_dir())
print(f"  OK: installed wheel carries its manifests, schemas and {skills} skills")
PYCHECK
    return 0
  fi

  echo "  FAIL: uv is required to verify the installed wheel; no source-only fallback."
  return 1
}

if node --test "$REPO_ROOT/scripts/listening-semantics.test.mjs" && node "$REPO_ROOT/scripts/validate-examples.mjs" "$REPO_ROOT" && run_python_contract_tests; then
  echo "  OK: Examples match canonical structure and semantic references"
else
  ERRORS=$((ERRORS + 1))
fi

# 7. Check for personal data patterns
echo
echo "[7/9] Checking for personal data and secrets..."
PATTERNS=(
  'password\s*=\s*['\''"]'
  'secret\s*=\s*['\''"]'
  'api_key\s*=\s*['\''"]'
  'apikey\s*=\s*['\''"]'
  'private_key'
  'BEGIN (RSA|OPENSSH) PRIVATE KEY'
  'sk-[a-zA-Z0-9]{20,}'
  'AKIA[0-9A-Z]{16}'
  '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
  '/U[s]ers/[a-zA-Z0-9._-]+'
  '/home/[a-zA-Z0-9._-]+'
  'C:\\U[s]ers\\[a-zA-Z0-9._-]+'
  '(^|[^0-9])192\.168\.[0-9]{1,3}\.[0-9]{1,3}([^0-9]|$)'
  '(^|[^0-9])172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3}([^0-9]|$)'
  '(^|[^0-9])(10|127)\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}([^0-9]|$)'
)

FOUND=0
for pattern in "${PATTERNS[@]}"; do
  matches=$(grep -riE "$pattern" --include='*.md' --include='*.json' --include='*.ts' --include='*.tsx' --include='*.sh' --exclude='validate-release.sh' "$REPO_ROOT" | grep -v node_modules | grep -v '/.venv/' | grep -v '.git/' || true)
  if [ -n "$matches" ]; then
    echo "  ERROR: Potential personal data or secret pattern matched: $pattern"
    echo "$matches" | head -n 3 | sed 's/^/    /'
    FOUND=1
    ERRORS=$((ERRORS + 1))
  fi
done

if [ "$FOUND" -eq 0 ]; then
  echo "  OK: No obvious secrets or personal data found"
fi

# 8. Check .gitignore covers sensitive files
echo
echo "[8/9] Checking .gitignore coverage..."
REQUIRED_IGNORES=('node_modules/' '.env' '*.pem' '*.key' '*.wav' '*.mp3')
MISSING=0
for item in "${REQUIRED_IGNORES[@]}"; do
  if ! grep -qF "$item" "$REPO_ROOT/.gitignore"; then
    echo "  WARNING: .gitignore missing: $item"
    MISSING=1
  fi
done
if [ "$MISSING" -eq 0 ]; then
  echo "  OK: .gitignore covers standard exclusions"
fi

# 9. Check generated build outputs are absent
echo
echo "[9/9] Checking generated build outputs are absent..."
GENERATED_FOUND=0
if [ -d "$REPO_ROOT/app/dist" ]; then
  echo "  ERROR: Generated build directory exists: app/dist"
  GENERATED_FOUND=1
  ERRORS=$((ERRORS + 1))
fi

tsbuildinfo_files=$(find "$REPO_ROOT" -path "$REPO_ROOT/app/node_modules" -prune -o -name '*.tsbuildinfo' -type f -print)
if [ -n "$tsbuildinfo_files" ]; then
  echo "  ERROR: Generated TypeScript build info files found:"
  echo "$tsbuildinfo_files" | sed "s|$REPO_ROOT/|    |"
  GENERATED_FOUND=1
  ERRORS=$((ERRORS + 1))
fi

if [ "$GENERATED_FOUND" -eq 0 ]; then
  echo "  OK: No generated build outputs found"
fi

# Summary
echo
echo "======================================"
if [ "$ERRORS" -eq 0 ]; then
  echo "✓ ALL CHECKS PASSED"
  echo "Repository is ready for release."
  exit 0
else
  echo "✗ FOUND $ERRORS ERROR(S)"
  echo "Please fix the issues above before releasing."
  exit 1
fi
