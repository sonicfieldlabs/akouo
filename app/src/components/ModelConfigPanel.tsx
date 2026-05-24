import { useEffect, useState, useCallback } from 'react';
import {
  fetchBenchmarkRunners,
  type BenchmarkConfig,
  type BenchmarkRunners,
  type BenchmarkRunnerInfo,
} from '../akouo/benchmark';
import { BracketWrap, BlinkingStatus } from './FuiDecorations';

interface ModelConfigPanelProps {
  config: BenchmarkConfig;
  apiUrl: string;
  onConfigChange: (config: BenchmarkConfig) => void;
}

const PROVIDER_OPTIONS = [
  { value: 'local', label: 'Local (Deterministic)' },
  { value: 'cli-gemini', label: 'Gemini CLI (Local Auth)' },
  { value: 'cli-claude', label: 'Claude CLI (Local Auth)' },
  { value: 'cli-codex', label: 'Codex CLI (Local Auth)' },
  { value: 'nvidia', label: 'NVIDIA NIM' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'openai-compatible', label: 'OpenAI-Compatible' },
];

const AUDIO_MODE_OPTIONS = [
  { value: 'none', label: 'Text / Metadata Only' },
  { value: 'chat-input-audio', label: 'Binary Audio Input' },
];

const RESPONSE_FORMAT_OPTIONS = [
  { value: 'json_object', label: 'JSON Object (Structured)' },
  { value: 'none', label: 'Unstructured / Free' },
];

export function ModelConfigPanel({ config, apiUrl, onConfigChange }: ModelConfigPanelProps) {
  const [runners, setRunners] = useState<BenchmarkRunners | null>(null);
  const [status, setStatus] = useState('');
  const [showHarnessInfo, setShowHarnessInfo] = useState(false);

  useEffect(() => {
    void loadRunners();
  }, [apiUrl]);

  async function loadRunners() {
    try {
      const data = await fetchBenchmarkRunners(apiUrl);
      setRunners(data);
      setStatus('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'OFFLINE');
    }
  }

  const currentRunner = findRunnerForProvider(runners, config.model.provider);
  const isAudioCapable = currentRunner?.supports_binary_audio ?? false;

  function updateModel(patch: Partial<BenchmarkConfig['model']>) {
    onConfigChange({
      ...config,
      model: { ...config.model, ...patch },
    });
  }

  function selectProvider(providerValue: string) {
    const runner = findRunnerForProvider(runners, providerValue);
    const defaultModelId = runner?.model ?? '';
    const supportsAudio = runner?.supports_binary_audio ?? false;

    updateModel({
      provider: providerValue,
      id: defaultModelId || config.model.id,
      modality: supportsAudio ? 'audio-native-and-metadata' : 'text-and-audio-metadata',
      audioMode: supportsAudio ? 'chat-input-audio' : 'none',
    });
  }

  return (
    <BracketWrap title="MODEL.CONFIG">
      <div className="model-config-panel">
        {/* Provider Selector */}
        <div className="model-config-field">
          <label className="input-label" htmlFor="model-provider">PROVIDER</label>
          <select
            id="model-provider"
            className="benchmark-select"
            value={config.model.provider}
            onChange={(e) => selectProvider(e.target.value)}
          >
            {PROVIDER_OPTIONS.map((opt) => (
              <option value={opt.value} key={opt.value}>{opt.label}</option>
            ))}
          </select>
          {currentRunner && (
            <div className="model-config-badge-row">
              <StatusBadge
                active={currentRunner.configured}
                label={currentRunner.configured ? (currentRunner.id.startsWith('cli-') ? 'CLI AUTHENTICATED' : 'CONFIGURED') : (currentRunner.id.startsWith('cli-') ? 'CLI NOT FOUND' : 'NOT CONFIGURED')}
                type={currentRunner.id.startsWith('cli-') ? 'cli' : undefined}
              />
              {currentRunner.supports_binary_audio && <StatusBadge active label="AUDIO CAPABLE" type="audio" />}
            </div>
          )}
        </div>

        {/* Model ID */}
        <div className="model-config-field">
          <label className="input-label" htmlFor="model-id">MODEL ID</label>
          <input
            id="model-id"
            className="benchmark-input"
            value={config.model.id}
            onChange={(e) => updateModel({ id: e.target.value })}
            placeholder="e.g. meta/llama-3.1-8b-instruct"
          />
          {currentRunner?.model && currentRunner.model !== config.model.id && (
            <small className="model-config-hint">
              Server default: {currentRunner.model}
            </small>
          )}
        </div>

        {/* Temperature / Thinking Effort */}
        <div className="model-config-field">
          <label className="input-label" htmlFor="model-temperature">
            THINKING EFFORT (TEMPERATURE)
            <span className="model-config-value">{config.model.temperature ?? 0.2}</span>
          </label>
          <input
            id="model-temperature"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.model.temperature ?? 0.2}
            onChange={(e) => updateModel({ temperature: Number(e.target.value) })}
            className="model-config-slider"
          />
          <div className="model-config-slider-labels">
            <span>Disciplined (0.0)</span>
            <span>Balanced (0.5)</span>
            <span>Creative (1.0)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="model-config-field">
          <label className="input-label" htmlFor="model-max-tokens">MAX TOKENS</label>
          <input
            id="model-max-tokens"
            type="number"
            min="256"
            max="16384"
            step="256"
            className="benchmark-input"
            value={config.model.maxTokens ?? 4096}
            onChange={(e) => updateModel({ maxTokens: Number(e.target.value) })}
          />
          <small className="model-config-hint">
            Limits output length. Akoúō JSON output typically needs 1K–4K tokens.
          </small>
        </div>

        {/* Audio Mode */}
        <div className="model-config-field">
          <label className="input-label" htmlFor="model-audio-mode">AUDIO MODE</label>
          <select
            id="model-audio-mode"
            className="benchmark-select"
            value={config.model.audioMode ?? 'none'}
            onChange={(e) => updateModel({ audioMode: e.target.value as 'none' | 'chat-input-audio' })}
            disabled={!isAudioCapable}
          >
            {AUDIO_MODE_OPTIONS.map((opt) => (
              <option value={opt.value} key={opt.value}>{opt.label}</option>
            ))}
          </select>
          {!isAudioCapable && (
            <small className="model-config-hint" style={{ color: 'var(--fui-yellow)' }}>
              Current provider does not support binary audio input.
            </small>
          )}
        </div>

        {/* Response Format */}
        <div className="model-config-field">
          <label className="input-label" htmlFor="model-response-format">RESPONSE FORMAT</label>
          <select
            id="model-response-format"
            className="benchmark-select"
            value={config.model.responseFormat ?? 'json_object'}
            onChange={(e) => updateModel({ responseFormat: e.target.value as 'json_object' | 'none' })}
          >
            {RESPONSE_FORMAT_OPTIONS.map((opt) => (
              <option value={opt.value} key={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Agent Info */}
        <div className="model-config-field">
          <label className="input-label" htmlFor="agent-id">AGENT ID</label>
          <input
            id="agent-id"
            className="benchmark-input"
            value={config.agent.id}
            onChange={(e) => onConfigChange({ ...config, agent: { ...config.agent, id: e.target.value } })}
          />
        </div>

        {/* Harness Info Toggle */}
        <button
          className="command-chip benchmark-toggle"
          type="button"
          onClick={() => setShowHarnessInfo((v) => !v)}
        >
          <span>{showHarnessInfo ? 'HIDE' : 'SHOW'} HARNESS INFO</span>
          <small>How settings affect listening</small>
        </button>

        {showHarnessInfo && <HarnessInfo config={config} runner={currentRunner} />}

        {status && (
          <p className="benchmark-copy" style={{ color: 'var(--fui-red)' }}>{status}</p>
        )}
      </div>
    </BracketWrap>
  );
}

function StatusBadge({ active, label, type }: { active: boolean; label: string; type?: 'audio' | 'cli' }) {
  const color = active
    ? (type === 'audio' ? 'var(--fui-cyan)' : type === 'cli' ? 'var(--fui-green)' : 'var(--fui-cyan)')
    : 'var(--fui-red)';

  return (
    <span
      className={`model-config-badge ${type === 'cli' ? 'cli-auth' : ''}`}
      style={{
        color,
        borderColor: color,
      }}
    >
      {label}
    </span>
  );
}

function HarnessInfo({ config, runner }: { config: BenchmarkConfig; runner: BenchmarkRunnerInfo | null }) {
  return (
    <div className="data-panel" style={{ marginTop: 12 }}>
      <header className="data-panel-header">HARNESS EFFECT ON LISTENING</header>
      <div className="data-panel-content">
        <HarnessRow
          label="Provider"
          value={config.model.provider}
          effect={`Determines which API endpoint receives the request. ${runner ? `${runner.id} at ${runner.base_url}` : 'Not connected to server.'}`}
        />
        <HarnessRow
          label="Model ID"
          value={config.model.id}
          effect="The specific model weights loaded. Different models have different audio understanding capabilities, token limits, and JSON adherence."
        />
        <HarnessRow
          label="Temperature"
          value={String(config.model.temperature ?? 0.2)}
          effect={`${(config.model.temperature ?? 0.2) < 0.3 ? 'Low temperature → disciplined, repeatable, conservative claims. Good for benchmarking.' : (config.model.temperature ?? 0.2) > 0.7 ? 'High temperature → creative, varied, speculative claims. May invent listening modes or over-interpret.' : 'Moderate temperature → balanced between discipline and richness.'}`}
        />
        <HarnessRow
          label="Max Tokens"
          value={String(config.model.maxTokens ?? 4096)}
          effect={`${(config.model.maxTokens ?? 4096) < 2048 ? 'Limited output may truncate the full Akoúō JSON schema, dropping claims or synthesis.' : 'Sufficient for full structured output with claim taxonomy, synthesis, and router output.'}`}
        />
        <HarnessRow
          label="Audio Mode"
          value={config.model.audioMode ?? 'none'}
          effect={config.model.audioMode === 'chat-input-audio'
            ? 'Binary audio is base64-encoded and attached to the model request. The model can actually process waveform data, not just metadata.'
            : 'Only text prompt and audio metadata (duration, sample rate) are sent. The model cannot hear the audio directly.'}
        />
        <HarnessRow
          label="Response Format"
          value={config.model.responseFormat ?? 'json_object'}
          effect={config.model.responseFormat === 'json_object'
            ? 'Forces structured JSON output via API-level constraint (where supported). Improves schema validity but may reduce expressive richness.'
            : 'Free-form output. Model may produce prose or partial JSON. Requires stronger prompt engineering for schema compliance.'}
        />
      </div>
    </div>
  );
}

function HarnessRow({ label, value, effect }: { label: string; value: string; effect: string }) {
  return (
    <div className="model-config-harness-row">
      <div className="model-config-harness-header">
        <strong>{label}</strong>
        <code>{value}</code>
      </div>
      <p className="benchmark-copy">{effect}</p>
    </div>
  );
}

function findRunnerForProvider(runners: BenchmarkRunners | null, provider: string): BenchmarkRunnerInfo | null {
  if (!runners) return null;
  const normalized = provider.toLowerCase();
  if (normalized === 'cli-gemini') return runners.cli_gemini ?? null;
  if (normalized === 'cli-claude') return runners.cli_claude ?? null;
  if (normalized === 'cli-codex') return runners.cli_codex ?? null;
  if (normalized.includes('nvidia')) return runners.nvidia_nim;
  if (normalized.includes('gemini') || normalized.includes('google')) return runners.gemini;
  if (normalized.includes('local')) return runners.local;
  if (normalized.includes('openai')) return runners.direct_openai_compatible;
  return null;
}
