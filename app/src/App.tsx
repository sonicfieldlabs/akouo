import { startTransition, useState, useEffect } from 'react';
import { ClaimTaxonomyView } from './components/ClaimTaxonomyView';
import { BenchmarkPanel } from './components/BenchmarkPanel';
import { CommandSelector } from './components/CommandSelector';
import { InputPanel } from './components/InputPanel';
import { ListeningOutput } from './components/ListeningOutput';
import { ModelConfigPanel } from './components/ModelConfigPanel';
import { BenchmarkIngestPanel } from './components/BenchmarkIngestPanel';
import { inspectAudioFile } from './akouo/audioAdapter';
import { createDefaultBenchmarkConfig, runDirectBenchmark, saveBenchmarkRun } from './akouo/benchmark';
import { runListeningCommand } from './akouo/listener';
import { appContract } from './akouo/schemas';
import type { AudioInspection, CommandName, CommandResult, InputType } from './akouo/types';
import { BracketWrap, Radar, BlinkingStatus } from './components/FuiDecorations';

type ActiveSection = 'listen' | 'benchmark' | 'ingest';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [selectedCommand, setSelectedCommand] = useState<CommandName>('/listen');
  const [audioInspection, setAudioInspection] = useState<AudioInspection | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [audioStatus, setAudioStatus] = useState('');
  const [result, setResult] = useState<CommandResult | null>(null);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('listen');
  const [benchmarkConfig, setBenchmarkConfig] = useState(createDefaultBenchmarkConfig);
  const [benchmarkSaveStatus, setBenchmarkSaveStatus] = useState('');
  const [lastSavedRunId, setLastSavedRunId] = useState('');
  const [serverHealth, setServerHealth] = useState<'pending' | 'ok' | 'error'>('pending');

  useEffect(() => {
    let mounted = true;
    const check = () => {
      fetch(`${benchmarkConfig.apiUrl}/api/health`)
        .then(r => r.json())
        .then(d => { if (mounted) setServerHealth(d.ok ? 'ok' : 'error') })
        .catch(() => { if (mounted) setServerHealth('error') });
    };
    check();
    const interval = setInterval(check, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, [benchmarkConfig.apiUrl]);

  const canRun = Boolean(prompt.trim() || audioInspection);

  async function handleAudioFileChange(file: File | null) {
    setError('');
    setResult(null);

    if (!file) {
      setAudioInspection(null);
      setSelectedAudioFile(null);
      setAudioStatus('');
      return;
    }

    setAudioStatus('INSPECTING LOCAL FILE...');

    try {
      const inspection = await inspectAudioFile(file);
      setAudioInspection(inspection);
      setSelectedAudioFile(file);
      setAudioStatus(inspection.warnings.length > 0 ? inspection.warnings.join(' ') : 'FILE ACCEPTED');
    } catch {
      setAudioInspection(null);
      setSelectedAudioFile(null);
      setAudioStatus('FILE ERROR: UNABLE TO PARSE');
    }
  }

  async function handleRun() {
    if (!canRun) {
      setError('AWAITING INPUT: SUPPLY AUDIO OR TEXT');
      return;
    }

    setIsRunning(true);
    setError('');
    setBenchmarkSaveStatus('');

    const startedAt = performance.now();

    let nextResult: CommandResult;

    try {
      const inputType = inferInputType(prompt, audioInspection);
      nextResult = runListeningCommand({
        objectName: audioInspection?.fileName ?? (prompt.trim() ? 'sound prompt' : 'unnamed sonic object'),
        inputType,
        prompt,
        command: selectedCommand,
        audioInspection: audioInspection ?? undefined,
      });

      startTransition(() => {
        setResult(nextResult);
      });
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : 'PASS FAILED');
      setIsRunning(false);
      return;
    }

    if (!benchmarkConfig.autoSave) {
      setBenchmarkSaveStatus('BENCHMARK AUTO SAVE OFF');
      setIsRunning(false);
      return;
    }

    try {
      setBenchmarkSaveStatus('SAVING RUN TO LOCAL BENCHMARK DB...');
      const savedRun = await saveBenchmarkRun({
        result: nextResult,
        input: {
          prompt,
          audioInspection,
          tags: inferBenchmarkTags(prompt, selectedCommand, inferInputType(prompt, audioInspection)),
        },
        model: benchmarkConfig.model,
        agent: benchmarkConfig.agent,
        latencyMs: Math.round(performance.now() - startedAt),
        schemaValid: true,
      }, benchmarkConfig.apiUrl);
      setLastSavedRunId(savedRun.id);
      setBenchmarkSaveStatus(`SAVED: ${savedRun.id}`);
    } catch (caught) {
      setBenchmarkSaveStatus(caught instanceof Error ? `BENCHMARK SAVE FAILED: ${caught.message}` : 'BENCHMARK SAVE FAILED');
    } finally {
      setIsRunning(false);
    }
  }

  async function handleRunDirectModel() {
    if (!canRun) {
      setError('AWAITING INPUT: SUPPLY AUDIO OR TEXT');
      return;
    }

    setIsRunning(true);
    setError('');
    setBenchmarkSaveStatus('CALLING DIRECT MODEL RUNNER...');

    const inputType = inferInputType(prompt, audioInspection);

    try {
      const audioPayload = selectedAudioFile ? await createDirectAudioPayload(selectedAudioFile) : null;
      const savedRun = await runDirectBenchmark({
        command: selectedCommand,
        input: {
          objectName: audioInspection?.fileName ?? (prompt.trim() ? 'sound prompt' : 'unnamed sonic object'),
          inputType,
          prompt,
          audioInspection,
          audioPayload,
          tags: inferBenchmarkTags(prompt, selectedCommand, inputType),
        },
        model: directModelOverride(benchmarkConfig.model),
        options: {
          temperature: benchmarkConfig.model.temperature,
          maxTokens: benchmarkConfig.model.maxTokens,
          audioMode: benchmarkConfig.model.audioMode,
          responseFormat: benchmarkConfig.model.responseFormat,
        },
      }, benchmarkConfig.apiUrl);

      startTransition(() => {
        setResult(savedRun.result);
      });
      setLastSavedRunId(savedRun.id);
      setBenchmarkSaveStatus(`DIRECT MODEL SAVED: ${savedRun.id}`);
    } catch (caught) {
      setBenchmarkSaveStatus(caught instanceof Error ? `DIRECT MODEL FAILED: ${caught.message}` : 'DIRECT MODEL FAILED');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <main className="app-shell">
      <BracketWrap title="SYS.AKOUO.CORE">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="fui-title">akoúō</h1>
            <p className="fui-subtitle">operational ears for the agentic era</p>
          </div>
          <div className="contract-card" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', borderRight: '1px solid rgba(0,255,255,0.2)', paddingRight: '15px' }}>
              <span>DB STATUS: {serverHealth === 'ok' ? 'ONLINE' : serverHealth === 'pending' ? 'CONNECTING...' : 'OFFLINE'}</span>
              <span style={{ color: serverHealth === 'ok' ? 'var(--fui-green)' : 'var(--fui-red)' }}>
                {benchmarkConfig.apiUrl}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span>{appContract.listeningModes.length} EARS</span>
              <span>{appContract.commandNames.length} COMMANDS</span>
              <span>{appContract.claimCategories.length} CLAIM TYPES</span>
            </div>
          </div>
        </header>

        <nav className="app-tabs" aria-label="Akoúō sections">
          <button className={activeSection === 'listen' ? 'is-active' : ''} type="button" onClick={() => setActiveSection('listen')}>LISTENING CONSOLE</button>
          <button className={activeSection === 'benchmark' ? 'is-active' : ''} type="button" onClick={() => setActiveSection('benchmark')}>BENCHMARK DB</button>
          <button className={activeSection === 'ingest' ? 'is-active' : ''} type="button" onClick={() => setActiveSection('ingest')}>INGEST</button>
        </nav>

        {activeSection === 'listen' && (
          <div className="hud-grid">
            <aside className="hud-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Radar />
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
                <span className="fui-subtitle">SYSTEM STATUS</span>
                <BlinkingStatus text={isRunning ? 'PROCESSING' : 'STANDBY'} active={isRunning} />
              </div>
              <CommandSelector selectedCommand={selectedCommand} onSelectCommand={setSelectedCommand} />
              <ModelConfigPanel
                config={benchmarkConfig}
                apiUrl={benchmarkConfig.apiUrl}
                onConfigChange={setBenchmarkConfig}
              />
              <ClaimTaxonomyView />
            </aside>

            <div className="main-content-stack">
              <InputPanel
                prompt={prompt}
                audioFile={selectedAudioFile}
                audioInspection={audioInspection}
                audioStatus={audioStatus}
                canRun={canRun}
                isRunning={isRunning}
                onPromptChange={setPrompt}
                onAudioFileChange={handleAudioFileChange}
                onRun={handleRun}
                onRunDirectModel={handleRunDirectModel}
              />
              <ListeningOutput result={result} error={error} />
            </div>
          </div>
        )}

        {activeSection === 'benchmark' && (
          <BenchmarkPanel
            apiUrl={benchmarkConfig.apiUrl}
            lastSavedRunId={lastSavedRunId}
            saveStatus={benchmarkSaveStatus}
            benchmarkConfig={benchmarkConfig}
            onSavedRun={(runId, status) => {
              setLastSavedRunId(runId);
              setBenchmarkSaveStatus(status);
            }}
          />
        )}

        {activeSection === 'ingest' && (
          <BenchmarkIngestPanel
            apiUrl={benchmarkConfig.apiUrl}
            benchmarkConfig={benchmarkConfig}
            onIngested={(runId, status) => {
              setLastSavedRunId(runId);
              setBenchmarkSaveStatus(status);
              setActiveSection('benchmark');
            }}
          />
        )}
      </BracketWrap>
    </main>
  );
}

async function createDirectAudioPayload(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return {
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    format: inferAudioFormat(file),
    dataBase64: btoa(binary),
  };
}

function inferAudioFormat(file: File): string {
  const value = `${file.type} ${file.name}`.toLowerCase();
  if (value.includes('wav') || value.includes('wave')) return 'wav';
  if (value.includes('mpeg') || value.includes('mp3')) return 'mp3';
  if (value.includes('mp4') || value.includes('m4a') || value.includes('aac')) return 'mp4';
  if (value.includes('flac')) return 'flac';
  if (value.includes('ogg') || value.includes('opus')) return 'ogg';
  return 'wav';
}

function directModelOverride(model: ReturnType<typeof createDefaultBenchmarkConfig>['model']) {
  if (model.id === 'akouo-local-deterministic') {
    return undefined;
  }

  return model;
}

function inferInputType(prompt: string, audioInspection: AudioInspection | null): InputType {
  if (prompt.trim() && audioInspection) return 'mixed';
  if (audioInspection) return 'audio_file';
  const text = prompt.toLowerCase();
  if (!text.trim()) return 'unknown';

  if (hasAnyTerm(text, ['transcript', 'caption file', 'subtitle file', 'asr output', 'diarization'])) return 'transcript';
  if (hasAnyTerm(text, ['field note', 'field recording note', 'soundwalk note', 'site note'])) return 'field_note';
  if (hasAnyTerm(text, ['archive note', 'archival note', 'oral history', 'custody note'])) return 'archive_note';
  if (hasAnyTerm(text, ['dataset description', 'training set', 'benchmark dataset', 'corpus'])) return 'dataset_description';
  if (hasAnyTerm(text, ['spectrogram'])) return 'spectrogram';
  if (hasAnyTerm(text, ['waveform'])) return 'waveform';
  if (hasAnyTerm(text, ['video', 'film', 'game scene', 'cutscene', 'trailer', 'screen recording', 'subtitle', 'caption'])) return 'video';
  if (hasAnyTerm(text, ['metadata', 'id3', 'exif', 'container info'])) return 'metadata';
  if (hasAnyTerm(text, ['model output', 'classifier output', 'asr output', 'tts output', 'generated audio', 'voice agent output'])) return 'model_output';
  return 'sound_prompt';
}

function inferBenchmarkTags(prompt: string, command: CommandName, inputType: InputType): string[] {
  const text = prompt.toLowerCase();
  const tags = new Set<string>([command, inputType]);

  const termMap: Array<[string, string[]]> = [
    ['speech_voice', ['voice', 'speech', 'spoken', 'transcript', 'vocal']],
    ['music', ['music', 'song', 'rhythm', 'melody', 'bass', 'drone']],
    ['soundscape', ['soundscape', 'field recording', 'forest', 'river', 'ocean', 'weather', 'city', 'street']],
    ['foley_household', ['foley', 'household', 'object', 'kitchen', 'door', 'footstep']],
    ['ecology', ['insect', 'animal', 'bird', 'habitat', 'ecology', 'rain']],
    ['machine_mediation', ['machine', 'codec', 'dataset', 'model', 'ai audio', 'platform']],
    ['audiovisual_scene', ['video', 'film', 'game', 'caption', 'subtitle', 'screen', 'audiovisual']],
    ['accessibility', ['accessibility', 'caption', 'subtitle', 'deaf', 'hard of hearing', 'haptic', 'assistive']],
    ['material_event', ['vibration', 'resonance', 'feedback', 'duration', 'material', 'rumble', 'loudspeaker']],
  ];

  for (const [tag, terms] of termMap) {
    if (terms.some((term) => text.includes(term))) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

function hasAnyTerm(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}
