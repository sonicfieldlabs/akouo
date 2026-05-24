import type { BenchmarkConfig } from '../akouo/benchmark';
import { BracketWrap } from './FuiDecorations';

interface BenchmarkControlsProps {
  config: BenchmarkConfig;
  saveStatus: string;
  lastSavedRunId: string;
  onConfigChange: (config: BenchmarkConfig) => void;
}

export function BenchmarkControls({ config, saveStatus, lastSavedRunId, onConfigChange }: BenchmarkControlsProps) {
  return (
    <BracketWrap title="BENCH.CONFIG">
      <label className="input-label" htmlFor="bench-model-id">MODEL ID</label>
      <input
        id="bench-model-id"
        className="benchmark-input"
        value={config.model.id}
        onChange={(event) => onConfigChange({ ...config, model: { ...config.model, id: event.target.value } })}
      />

      <label className="input-label" htmlFor="bench-provider">PROVIDER</label>
      <input
        id="bench-provider"
        className="benchmark-input"
        value={config.model.provider}
        onChange={(event) => onConfigChange({ ...config, model: { ...config.model, provider: event.target.value } })}
      />

      <label className="input-label" htmlFor="bench-modality">MODALITY</label>
      <input
        id="bench-modality"
        className="benchmark-input"
        value={config.model.modality}
        onChange={(event) => onConfigChange({ ...config, model: { ...config.model, modality: event.target.value } })}
      />

      <label className="input-label" htmlFor="bench-agent-id">AGENT ID</label>
      <input
        id="bench-agent-id"
        className="benchmark-input"
        value={config.agent.id}
        onChange={(event) => onConfigChange({ ...config, agent: { ...config.agent, id: event.target.value } })}
      />

      <label className="input-label" htmlFor="bench-agent-type">AGENT TYPE</label>
      <input
        id="bench-agent-type"
        className="benchmark-input"
        value={config.agent.type}
        onChange={(event) => onConfigChange({ ...config, agent: { ...config.agent, type: event.target.value } })}
      />

      <button
        className={`command-chip benchmark-toggle ${config.autoSave ? 'is-selected' : ''}`}
        type="button"
        onClick={() => onConfigChange({ ...config, autoSave: !config.autoSave })}
      >
        <span>AUTO SAVE</span>
        <small>{config.autoSave ? 'ON' : 'OFF'}</small>
      </button>

      <div className="benchmark-status-line">
        <span>{saveStatus || 'NO RUN SAVED THIS SESSION'}</span>
        {lastSavedRunId ? <small>{lastSavedRunId}</small> : null}
      </div>
    </BracketWrap>
  );
}
