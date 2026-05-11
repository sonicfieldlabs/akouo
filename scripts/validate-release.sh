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
echo "[1/7] Checking skill folder structure..."
EXPECTED_SKILLS=(
  "akouo-router"
  "signal-inspection-listening"
  "acoulogical-object-listening"
  "embodied-affective-listening"
  "transductive-media-listening"
  "forensic-archival-listening"
  "ecological-posthuman-listening"
  "critical-political-listening"
  "musical-aesthetic-listening"
  "symbolic-fictional-listening"
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
echo "[2/7] Checking for old flat skill files..."
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
echo "[3/7] Checking bundled schema consistency..."
SCHEMA_OK=1
for skill in "${EXPECTED_SKILLS[@]}"; do
  ref_dir="$SKILLS_DIR/$skill/references"
  if [ ! -d "$ref_dir" ]; then
    echo "  ERROR: No references/ folder for $skill"
    ERRORS=$((ERRORS + 1))
    SCHEMA_OK=0
    continue
  fi

  required_refs=("claim-taxonomy.schema.json" "listening-output.schema.json")
  if [ "$skill" = "akouo-router" ]; then
    required_refs+=("router-output.schema.json")
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
echo "[4/7] Checking schema references in SKILL.md files..."
for skill in "${EXPECTED_SKILLS[@]}"; do
  skill_md="$SKILLS_DIR/$skill/SKILL.md"
  ref_dir="$SKILLS_DIR/$skill/references"
  refs=$(grep -oE 'references/[^` ]+\.json' "$skill_md" || true)
  for ref in $refs; do
    ref_path="$SKILLS_DIR/$skill/$ref"
    if [ ! -f "$ref_path" ]; then
      echo "  ERROR: $skill references missing file: $ref"
      ERRORS=$((ERRORS + 1))
    fi
  done
done
echo "  OK: All schema references resolve"

# 5. Check for personal data patterns
echo
echo "[5/7] Checking for personal data and secrets..."
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
  '/Users/[a-zA-Z0-9._-]+'
  '/home/[a-zA-Z0-9._-]+'
  'C:\\Users\\[a-zA-Z0-9._-]+'
  '(^|[^0-9])192\.168\.[0-9]{1,3}\.[0-9]{1,3}([^0-9]|$)'
  '(^|[^0-9])172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3}([^0-9]|$)'
  '(^|[^0-9])(10|127)\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}([^0-9]|$)'
)

FOUND=0
for pattern in "${PATTERNS[@]}"; do
  matches=$(grep -riE "$pattern" --include='*.md' --include='*.json' --include='*.ts' --include='*.tsx' --include='*.sh' --exclude='validate-release.sh' "$REPO_ROOT" | grep -v node_modules | grep -v '.git/' || true)
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

# 6. Check .gitignore covers sensitive files
echo
echo "[6/7] Checking .gitignore coverage..."
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

# 7. Check generated build outputs are absent
echo
echo "[7/7] Checking generated build outputs are absent..."
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
