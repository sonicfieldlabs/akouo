import { useCallback, useState } from 'react';
import {
  benchmarkHeaders,
  benchmarkRequestUrl,
  type BenchmarkConfig,
} from '../akouo/benchmark';
import { BracketWrap, BlinkingStatus } from './FuiDecorations';

interface BenchmarkIngestPanelProps {
  apiUrl: string;
  benchmarkConfig: BenchmarkConfig;
  onIngested: (runId: string, status: string) => void;
}

interface IngestPreview {
  valid: boolean;
  errors: string[];
  modelId: string;
  provider: string;
  agentId: string;
  command: string;
  objectName: string;
  inputType: string;
  claimCounts: Record<string, number>;
  synthesis: string;
  timestamp: string;
  rawJson: string;
  rawText: string;
  isRawJson: boolean;
}

export function BenchmarkIngestPanel({ apiUrl, benchmarkConfig, onIngested }: BenchmarkIngestPanelProps) {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState<(IngestPreview & { fileName: string })[]>([]);
  const [history, setHistory] = useState<{ id: string; status: string; timestamp: string }[]>([]);
  const [overrideModel, setOverrideModel] = useState('');
  const [overrideProvider, setOverrideProvider] = useState('');
  const [overrideAgent, setOverrideAgent] = useState('');
  const [overrideTags, setOverrideTags] = useState('');

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      void loadFiles(files);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  async function loadFiles(files: File[]) {
    setIsLoading(true);
    setStatus(`READING ${files.length} FILES...`);

    const newPreviews: (IngestPreview & { fileName: string })[] = [];
    let validCount = 0;
    let firstModel = '';
    let firstProvider = '';
    let firstAgent = '';

    for (const file of files) {
      try {
        const text = await file.text();
        const parsed = parseIngestPreview(text);
        newPreviews.push({ ...parsed, fileName: file.name });
        if (parsed.valid) validCount++;

        if (!firstModel && parsed.modelId) firstModel = parsed.modelId;
        if (!firstProvider && parsed.provider) firstProvider = parsed.provider;
        if (!firstAgent && parsed.agentId) firstAgent = parsed.agentId;
      } catch (error) {
        setStatus(`FAILED ON ${file.name}`);
      }
    }

    setPreviews(prev => [...prev, ...newPreviews]);
    if (!overrideModel && firstModel) setOverrideModel(firstModel);
    if (!overrideProvider && firstProvider) setOverrideProvider(firstProvider);
    if (!overrideAgent && firstAgent) setOverrideAgent(firstAgent);
    setStatus(`${validCount} VALID REPORTS LOADED`);
    setIsLoading(false);
  }

  async function handleIngest() {
    const validPreviews = previews.filter(p => p.valid);
    if (validPreviews.length === 0) {
      setStatus('CANNOT INGEST: NO VALID REPORTS FOUND');
      return;
    }

    setIsLoading(true);
    setStatus(`INGESTING ${validPreviews.length} REPORTS...`);

    try {
      const tags = overrideTags.split(',').map((t) => t.trim()).filter(Boolean);
      const payloads = validPreviews.map(p => {
        const payload = JSON.parse(p.rawJson);
        if (overrideModel || overrideProvider || overrideAgent) {
          payload.benchmark_metadata = payload.benchmark_metadata ?? {};
          if (overrideModel) payload.benchmark_metadata.model_id = overrideModel;
          if (overrideProvider) payload.benchmark_metadata.provider = overrideProvider;
          if (overrideAgent) payload.benchmark_metadata.agent_id = overrideAgent;
        }
        if (tags.length > 0) payload.tags = [...(Array.isArray(payload.tags) ? payload.tags : []), ...tags];
        if (!p.isRawJson) payload.raw_report_markdown = p.rawText;
        return payload;
      });

      const res = await fetch(benchmarkRequestUrl(apiUrl, '/api/runs/ingest/batch'), {
        method: 'POST',
        headers: benchmarkHeaders({ 'Content-Type': 'application/json' }, apiUrl),
        body: JSON.stringify(payloads),
      });

      if (!res.ok) throw new Error('Batch ingest rejected by server');
      const data = await res.json();

      const successRuns = data.results.filter((r: any) => r.status === 'success');

      const newHistory = successRuns.map((r: any) => ({
        id: r.run.id,
        status: `BATCH INGESTED: ${r.run.id}`,
        timestamp: new Date().toISOString()
      }));

      setHistory(h => [...newHistory, ...h]);
      if (successRuns.length > 0) onIngested(successRuns[0].run.id, `BATCH COMPLETE: ${successRuns.length} RUNS`);

      setStatus(`INGEST COMPLETE: ${successRuns.length} SUCCESS, ${data.results.length - successRuns.length} FAILED`);
      setPreviews([]);
    } catch (error) {
      setStatus(error instanceof Error ? `INGEST FAILED: ${error.message}` : 'INGEST FAILED');
    } finally {
      setIsLoading(false);
    }
  }

  function clearPreview() {
    setPreviews([]);
    setStatus('');
    setOverrideModel('');
    setOverrideProvider('');
    setOverrideAgent('');
    setOverrideTags('');
  }

  return (
    <div className="main-content-stack">
      <BracketWrap title="BENCHMARK.INGEST">
        <div className="benchmark-header-row">
          <div>
            <h2 className="benchmark-title">Ingest External Benchmark Report</h2>
            <p className="fui-subtitle">IMPORT REPORTS FROM ANY AKOÚŌ-ENABLED AGENT</p>
          </div>
          <BlinkingStatus text={isLoading ? 'PROCESSING' : status.includes('FAILED') ? 'ERROR' : 'READY'} active={isLoading || status.includes('FAILED')} />
        </div>

        <p className="benchmark-copy">
          Drop a .md or .json file from any external agent running the benchmark-listening skill.
          The file will be parsed, validated, and saved to the local benchmark database.
        </p>

        {!previews.length ? (
          <div
            className="ingest-drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="ingest-drop-content">
              <span className="ingest-drop-icon">↙</span>
              <p>DROP BENCHMARK REPORTS HERE</p>
              <small>Accepts .md (markdown with embedded JSON) or .json (raw payload)</small>
              <input
                type="file"
                multiple
                accept=".md,.json,.txt"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) void loadFiles(files);
                }}
                className="ingest-file-input"
              />
            </div>
          </div>
        ) : (
          <div className="ingest-preview">
            <div className="ingest-preview-header">
              <span>{previews.length} FILES LOADED ({previews.filter(p => p.valid).length} VALID)</span>
              <button className="benchmark-small-button" type="button" onClick={clearPreview}>CLEAR</button>
            </div>

            <div className="data-grid" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {previews.map((p, idx) => (
                <div className="data-panel" key={idx} style={{ borderColor: p.valid ? 'var(--fui-cyan)' : 'var(--fui-red)' }}>
                  <header className="data-panel-header">{p.fileName} {p.valid ? '✓' : '✗'}</header>
                  <div className="data-panel-content">
                    <div className="mode-slot"><span>COMMAND</span><strong>{p.command || 'unknown'}</strong></div>
                    <div className="mode-slot"><span>OBJECT</span><strong>{p.objectName || 'unknown'}</strong></div>
                    <div className="mode-slot"><span>MODEL</span><strong>{p.modelId || 'unknown'}</strong></div>
                    {!p.valid && p.errors.length > 0 && (
                      <ul className="bullet-list">
                        {p.errors.map((err, i) => (
                          <li key={i} style={{ color: 'var(--fui-red)' }}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="data-panel" style={{ marginTop: 12 }}>
              <header className="data-panel-header">OVERRIDES (OPTIONAL)</header>
              <div className="data-panel-content">
                <div className="benchmark-filter-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  <div className="model-config-field">
                    <label className="input-label">MODEL ID</label>
                    <input
                      className="benchmark-input"
                      value={overrideModel}
                      onChange={(e) => setOverrideModel(e.target.value)}
                      placeholder={previews.length > 0 ? previews[0].modelId || 'override model' : 'override model'}
                    />
                  </div>
                  <div className="model-config-field">
                    <label className="input-label">PROVIDER</label>
                    <input
                      className="benchmark-input"
                      value={overrideProvider}
                      onChange={(e) => setOverrideProvider(e.target.value)}
                      placeholder={previews.length > 0 ? previews[0].provider || 'override provider' : 'override provider'}
                    />
                  </div>
                  <div className="model-config-field">
                    <label className="input-label">AGENT ID</label>
                    <input
                      className="benchmark-input"
                      value={overrideAgent}
                      onChange={(e) => setOverrideAgent(e.target.value)}
                      placeholder={previews.length > 0 ? previews[0].agentId || 'override agent' : 'override agent'}
                    />
                  </div>
                  <div className="model-config-field">
                    <label className="input-label">TAGS (comma-separated)</label>
                    <input
                      className="benchmark-input"
                      value={overrideTags}
                      onChange={(e) => setOverrideTags(e.target.value)}
                      placeholder="e.g. music, synthetic, test"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="benchmark-suite-actions">
              <button
                className="run-button"
                type="button"
                disabled={previews.filter(p => p.valid).length === 0 || isLoading}
                onClick={() => void handleIngest()}
              >
                {isLoading ? 'INGESTING...' : `INGEST ${previews.filter(p => p.valid).length} BATCH`}
              </button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="data-panel" style={{ marginTop: '15px' }}>
            <header className="data-panel-header">INGESTION HISTORY</header>
            <div className="data-panel-content">
              {history.map((h, i) => (
                <div key={i} className="benchmark-copy" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{h.status}</span>
                  <small>{new Date(h.timestamp).toLocaleTimeString()}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {status ? <p className="benchmark-copy">{status}</p> : null}
      </BracketWrap>
    </div>
  );
}

function parseIngestPreview(text: string): IngestPreview {
  const result: IngestPreview = {
    valid: false,
    errors: [],
    modelId: '',
    provider: '',
    agentId: '',
    command: '',
    objectName: '',
    inputType: '',
    claimCounts: {},
    synthesis: '',
    timestamp: '',
    rawJson: '',
    rawText: text,
    isRawJson: false,
  };

  try {
    const trimmed = text.trim();
    const json = parseIngestJson(trimmed);

    result.rawJson = JSON.stringify(json);
    result.isRawJson = trimmed.startsWith('{');

    // Validate required fields
    if (!json.command) result.errors.push('Missing command');
    if (!json.object_listened_to && !json.sound_object) result.errors.push('Missing object_listened_to');
    if (!json.input_type) result.errors.push('Missing input_type');

    const claimSummary = json.claim_summary ?? json.shared_claim_summary ?? json.claims;
    if (!claimSummary || typeof claimSummary !== 'object') {
      result.errors.push('Missing claim_summary');
    } else {
      const categories = ['heard', 'measured', 'inferred', 'interpreted', 'speculative', 'undetermined'];
      for (const cat of categories) {
        const claims = Array.isArray((claimSummary as Record<string, unknown>)[cat]) ? (claimSummary as Record<string, unknown>)[cat] as unknown[] : [];
        result.claimCounts[cat] = claims.length;
      }
    }

    // Extract metadata
    const metadata = (json.benchmark_metadata ?? {}) as Record<string, unknown>;
    result.modelId = String(metadata.model_id ?? json.model_id ?? '');
    result.provider = String(metadata.provider ?? json.provider ?? '');
    result.agentId = String(metadata.agent_id ?? json.agent_id ?? '');
    result.command = String(json.command ?? '');
    result.objectName = String(json.object_listened_to ?? json.sound_object ?? '');
    result.inputType = String(json.input_type ?? '');
    result.synthesis = String(json.synthesis ?? json.most_responsible_reading ?? '');
    result.timestamp = String(metadata.timestamp ?? '');

    result.valid = result.errors.length === 0;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Parse error');
  }

  return result;
}

function parseIngestJson(trimmed: string): Record<string, unknown> {
  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed) as Record<string, unknown>;
  }

  const blocks = extractMarkdownFenceBlocks(trimmed);
  const parsedBlocks: Array<{ language: string; value: Record<string, unknown> }> = [];

  for (const block of blocks) {
    const content = block.content.trim();
    if (!content.startsWith('{')) continue;
    try {
      const value = JSON.parse(content) as unknown;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        parsedBlocks.push({ language: block.language, value: value as Record<string, unknown> });
      }
    } catch {
      // Keep scanning because agents may include illustrative JSON before the canonical block.
    }
  }

  const jsonBlocks = parsedBlocks.filter((block) => block.language === 'json');
  const preferredBlocks = jsonBlocks.length > 0 ? jsonBlocks : parsedBlocks;
  const canonical = preferredBlocks.find((block) => isCanonicalBenchmarkReport(block.value));
  if (canonical) return canonical.value;

  const benchmarkLike = preferredBlocks.find((block) => isBenchmarkLikeReport(block.value));
  if (benchmarkLike) return benchmarkLike.value;

  if (preferredBlocks[0]) return preferredBlocks[0].value;
  throw new Error('No JSON block found in markdown');
}

function extractMarkdownFenceBlocks(text: string): Array<{ language: string; content: string }> {
  const blocks: Array<{ language: string; content: string }> = [];
  const fencePattern = /```([^\r\n`]*)\r?\n([\s\S]*?)\r?\n?```/g;
  let match: RegExpExecArray | null;

  while ((match = fencePattern.exec(text)) !== null) {
    const language = String(match[1] ?? '').trim().split(/\s+/)[0].toLowerCase();
    blocks.push({ language, content: match[2] });
  }

  return blocks;
}

function isCanonicalBenchmarkReport(value: Record<string, unknown>): boolean {
  return isBenchmarkLikeReport(value) && Boolean(value.benchmark_metadata && typeof value.benchmark_metadata === 'object');
}

function isBenchmarkLikeReport(value: Record<string, unknown>): boolean {
  return Boolean(
    typeof value.command === 'string' &&
    (value.claim_summary || value.shared_claim_summary || value.claims) &&
    (Array.isArray(value.outputs) || Array.isArray(value.skills_called) || value.router_output),
  );
}
