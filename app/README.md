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
- adapter layer for deeper audio analysis
- browser-side audio metadata, amplitude, and limited spectral inspection
- local benchmark auto-save to a sibling benchmark API workspace
- benchmark history view with filters, scores, normalized claims, model and agent metadata

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

The MVP does not send audio to a remote service during local deterministic runs. It accepts files in the browser, reads basic metadata when possible, estimates amplitude and limited single-window spectral traits, and marks deeper waveform, spectrogram, standardized loudness, onset, phase, stereo image, and time-varying frequency claims as undetermined until a deeper adapter is added.

## Local Benchmark Use

Start the benchmark API first:

```sh
cd ../bench
npm run dev
```

Then start the app:

```sh
npm run dev
```

The app saves listening runs to `http://localhost:8787` by default. Override with `VITE_AKOUO_BENCHMARK_API` if the benchmark API runs elsewhere.

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
      BenchmarkControls.tsx
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
