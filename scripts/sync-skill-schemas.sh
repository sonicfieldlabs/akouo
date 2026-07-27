#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
schema_names=(
  claim-taxonomy.schema.json
  listening-context.schema.json
  listening-output.schema.json
  listening-pass.schema.json
  listening-provenance.schema.json
  route-decision.schema.json
  ensemble.schema.json
)

for skill_dir in "$repo_root"/skills/*; do
  [ -d "$skill_dir" ] || continue
  mkdir -p "$skill_dir/references"
  for schema_name in "${schema_names[@]}"; do
    cp "$repo_root/schemas/$schema_name" "$skill_dir/references/$schema_name"
  done
done

cp "$repo_root/schemas/router-output.schema.json" "$repo_root/skills/akouo-router/references/router-output.schema.json"
cp "$repo_root/schemas/routing-plan.schema.json" "$repo_root/skills/akouo-router/references/routing-plan.schema.json"
cp "$repo_root/schemas/reference-map.schema.json" "$repo_root/skills/reference-layer/references/reference-map.schema.json"
cp "$repo_root/schemas/covenant.schema.json" "$repo_root/skills/sovereign-listening/references/covenant.schema.json"
