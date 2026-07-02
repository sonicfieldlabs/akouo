import type { AudioInspection } from '../akouo/types';
import { AudioVisualizer } from './AudioVisualizer';
import { BracketWrap, AudioWaveform } from './FuiDecorations';

interface InputPanelProps {
  prompt: string;
  audioFile: File | null;
  audioInspection: AudioInspection | null;
  audioStatus: string;
  canRun: boolean;
  isRunning: boolean;
  onPromptChange: (value: string) => void;
  onAudioFileChange: (file: File | null) => void;
  onRun: () => void;
  onRunDirectModel: () => void;
}

export function InputPanel({
  prompt,
  audioFile,
  audioInspection,
  audioStatus,
  canRun,
  isRunning,
  onPromptChange,
  onAudioFileChange,
  onRun,
  onRunDirectModel,
}: InputPanelProps) {
  return (
    <BracketWrap title="INPUT.STREAM">
      <label className="input-label" htmlFor="sound-prompt">
        {"// SOUND PROMPT"}
      </label>
      <textarea
        id="sound-prompt"
        placeholder="> Describe a sound, archive fragment, field recording, or impossible sonic object..."
        rows={4}
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
      />

      <label className="input-label" htmlFor="audio-file">
        {"// AUDIO FILE STREAM"}
      </label>
      <input
        id="audio-file"
        type="file"
        accept="audio/*"
        onChange={(event) => onAudioFileChange(event.target.files?.[0] ?? null)}
      />

      {audioInspection ? <AudioInspectionSummary inspection={audioInspection} /> : null}
      {audioFile ? <AudioVisualizer file={audioFile} /> : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
        {audioStatus ? <p className="fui-subtitle" style={{ color: 'var(--fui-cyan)' }}>{audioStatus}</p> : <div />}
        <AudioWaveform active={isRunning} />
      </div>

      <button className="run-button" type="button" onClick={onRun} disabled={!canRun || isRunning}>
        {isRunning ? 'EXECUTING SCAN...' : 'INITIATE LOCAL LISTENING PASS'}
      </button>

      <button className="run-button direct-run-button" type="button" onClick={onRunDirectModel} disabled={!canRun || isRunning}>
        RUN DIRECT MODEL BENCHMARK
      </button>
    </BracketWrap>
  );
}

function AudioInspectionSummary({ inspection }: { inspection: AudioInspection }) {
  return (
    <div className="audio-summary" aria-label="Audio inspection summary">
      <span>{inspection.fileName}</span>
      <div style={{ display: 'flex', gap: '10px' }}>
        <small>{inspection.fileType}</small>
        <small>{formatBytes(inspection.fileSize)}</small>
        {inspection.durationSeconds !== null ? <small>{inspection.durationSeconds.toFixed(2)}s</small> : null}
        {inspection.sampleRate !== null ? <small>{inspection.sampleRate} Hz</small> : null}
        {inspection.channelCount !== null ? <small>{inspection.channelCount} CH</small> : null}
        {inspection.features?.rmsDbfs !== null && inspection.features?.rmsDbfs !== undefined ? <small>RMS {inspection.features.rmsDbfs.toFixed(1)} dBFS</small> : null}
        {inspection.features?.silenceRatio !== null && inspection.features?.silenceRatio !== undefined ? <small>SILENCE {(inspection.features.silenceRatio * 100).toFixed(1)}%</small> : null}
        {inspection.features?.spectralCentroidHz !== null && inspection.features?.spectralCentroidHz !== undefined ? <small>CENTROID {inspection.features.spectralCentroidHz.toFixed(0)} Hz</small> : null}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
