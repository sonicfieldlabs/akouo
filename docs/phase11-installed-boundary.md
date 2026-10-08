# Required installed-package release boundary

The release gate requires Python 3.12 (override with `AKOUO_TEST_PYTHON`
only for a separately labelled compatibility run), `uv`, and an explicitly
selected Earworm (`akousma`) wheel. Set `AKOUO_AKOUSMA_WHEEL` to its absolute
path and `AKOUO_AKOUSMA_SHA256` to its reviewed SHA-256 before running
`bash scripts/validate-release.sh`.

The gate builds AKOÚŌ, installs both wheels in a disposable environment,
asserts site-packages imports, exercises record workflows and rejects any
skipped test. Missing dependencies or tools are failures, not successful
source-only fallbacks. This gate checks local contracts and storage workflows;
it does not establish model inference, optional room engines or live services.
