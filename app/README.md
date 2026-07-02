# akoúō App

This directory contains the local-first app for akoúō.

The current public MVP provides full local command integration with a deeper research/reference layer:

- text sound prompt input
- audio file upload
- command selection for all public akoúō commands
- auto-router route draft
- structured listening output
- claim taxonomy display
- reference map display for `/reference` and `/study`
- concept, methodology, tradition, route, question, caution, and adjacent-mode mapping
- comparative multi-ear output for `/one-sound-many-ears`
- visible mediations, risks, and undetermined claims
- copy/export of structured JSON results
- deeper browser-side signal adapter: FFT spectral survey (centroid, rolloff, flatness, band energy), BS.1770-style integrated loudness and loudness range, spectral-flux onset density with a guarded BPM candidate, stereo correlation/width/balance, and clipping-ratio estimates
- expanded routing plans (`routing_plan`, `schemas/routing-plan.schema.json`) embedded in `/route` and `/method` outputs, with evidence level, claim permissions, mode chain, stop conditions, and agent handoff
- optional benchmark save to a separately hosted benchmark API workspace
- benchmark history view with filters, scores, normalized claims, model and agent metadata when that API is available

The local runner is deterministic and conservative. It does not pretend to perform deep audio analysis where only prompt text or basic browser metadata is available.

## Local Use

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Build the app:

```sh
npm run build
```

The Vite dev and preview servers bind to `localhost` by default. For LAN or Tailscale-style testing, set `AKOUO_EXPOSE_DEV_SERVER=true` and list explicit hostnames in `AKOUO_ALLOWED_HOSTS`; do not use an allow-all host policy for public release work.

The MVP does not send audio to a remote service during local deterministic runs. It accepts files in the browser and measures metadata, amplitude statistics, BS.1770-style loudness and loudness range, multi-window spectral traits and band energy, onset density with a guarded BPM candidate, stereo correlation and balance, and clipping indicators. Every measured claim names its method and limits in its `basis`; sample-accurate waveform review, full spectrogram rendering, true-peak metering, and certified loudness verification remain marked as deferred. Heavy passes cover at most the first 10 minutes of a file and note the truncation as a warning.

## 60-Second Reviewer Path

From this directory:

```sh
npm install
npm run dev
```

Open the local Vite URL, drop a WAV/AIFF/MP3/OGG file or enter a sound prompt, choose `/listen`, and run `INITIATE LOCAL LISTENING PASS`. The deterministic local path runs without a model provider, benchmark server, credentials, or network connection.

## Optional Benchmark API

The benchmark API is a private extension used for repeatable model comparisons. It is not required for the public reference app. By default the app keeps benchmark auto-save off, and the header will show `BENCHMARK API: LOCAL ONLY` if no API is running.

If you operate a compatible benchmark API, set `VITE_AKOUO_BENCHMARK_API` to its origin. API keys in Vite env files are build-time browser values; they are visible to anyone using the built app. Only use local or disposable benchmark keys, and set `VITE_AKOUO_BENCHMARK_TRUSTED_ORIGINS` so the app attaches the key only to explicit origins:

```sh
VITE_AKOUO_BENCHMARK_API=http://localhost:8787
VITE_AKOUO_BENCHMARK_API_KEY=replace-with-local-bench-key
VITE_AKOUO_BENCHMARK_TRUSTED_ORIGINS=http://localhost:8787
```

The `RUN DIRECT MODEL BENCHMARK` button calls the benchmark server's OpenAI-compatible runner. Configure the benchmark workspace with `BENCH_OPENAI_COMPAT_API_KEY` and `BENCH_OPENAI_COMPAT_MODEL`.

For audio-native tests, also set `BENCH_OPENAI_COMPAT_AUDIO_MODE=chat-input-audio` on the benchmark server. Uploaded audio is sent to the provider for that request but is not stored in the benchmark database.

The Benchmark tab can run local or direct model passes over suite manifests from the benchmark workspace's `datasets/suites` directory. Suite-generated rows are saved with `suite_id` and `case_id` for repeatable comparisons.

## Architecture

```text
app/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  src/
    main.tsx
    App.tsx
    styles.css
    akouo/
      audioAdapter.ts
      benchmark.ts
      commands.ts
      listener.ts
      outputFactory.ts
      referenceLayer.ts
      router.ts
      schemas.ts
      skills.ts
      types.ts
    components/
      ClaimTaxonomyView.tsx
      BenchmarkIngestPanel.tsx
      BenchmarkPanel.tsx
      CommandSelector.tsx
      AudioVisualizer.tsx
      FuiDecorations.tsx
      InputPanel.tsx
      ListeningOutput.tsx
      ModelConfigPanel.tsx
```

The app should remain independent from any single model provider. Future model, signal-analysis, or MCP integrations should plug into the `src/akouo/` boundary rather than directly into UI components.
