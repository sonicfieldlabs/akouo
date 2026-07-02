import { useEffect, useState } from 'react';
import {
  benchmarkExportUrl,
  benchmarkHeaders,
  benchmarkRequestUrl,
  fetchBenchmarkComparison,
  fetchBenchmarkRun,
  fetchBenchmarkRuns,
  fetchBenchmarkRunners,
  fetchBenchmarkSuite,
  fetchBenchmarkStats,
  fetchBenchmarkSuites,
  replaceBenchmarkScores,
  runDirectBenchmark,
  saveBenchmarkRun,
  updateBenchmarkReview,
  fetchBenchmarkSchema,
  type BenchmarkComparison,
  type BenchmarkConfig,
  type BenchmarkRunDetail,
  type BenchmarkRunFilters,
  type BenchmarkRunSummary,
  type BenchmarkRunners,
  type BenchmarkSchema,
  type BenchmarkScoreInput,
  type BenchmarkStats,
  type BenchmarkSuiteCase,
  type BenchmarkSuiteSummary,
} from '../akouo/benchmark';
import { runListeningCommand } from '../akouo/listener';
import { claimCategories, commandNames, inputTypes } from '../akouo/types';
import type { CommandName, InputType } from '../akouo/types';
import { BracketWrap, BlinkingStatus } from './FuiDecorations';

interface BenchmarkPanelProps {
  apiUrl: string;
  lastSavedRunId: string;
  saveStatus: string;
  benchmarkConfig: BenchmarkConfig;
  onSavedRun: (runId: string, status: string) => void;
}

interface BenchmarkFilterState {
  q: string;
  command: string;
  input_type: string;
  claim_category: string;
  raised_flag: string;
  review_status: string;
  model_id: string;
}

const defaultFilters: BenchmarkFilterState = {
  q: '',
  command: 'all',
  input_type: 'all',
  claim_category: 'all',
  raised_flag: 'all',
  review_status: 'all',
  model_id: 'all',
};

const reviewStatuses = ['pending', 'reviewed', 'flagged', 'rejected'] as const;

const flagNames = [
  'hallucination_risk',
  'source_overreach',
  'weak_uncertainty',
  'schema_drift',
  'claim_inflation',
] as const;

const scoreAxes = [
  'schema_validity',
  'claim_discipline',
  'evidence_grounding',
  'listening_mode_fidelity',
  'audio_specificity',
  'uncertainty_quality',
  'research_usefulness',
  'ethical_caution',
  'musical_specificity',
  'aesthetic_interpretation_discipline',
  'cultural_tonal_context_caution',
  'sound_design_utility',
  'poetic_usefulness',
] as const;

export function BenchmarkPanel({ apiUrl, lastSavedRunId, saveStatus, benchmarkConfig, onSavedRun }: BenchmarkPanelProps) {
  const [filters, setFilters] = useState<BenchmarkFilterState>(defaultFilters);
  const [runs, setRuns] = useState<BenchmarkRunSummary[]>([]);
  const [stats, setStats] = useState<BenchmarkStats | null>(null);
  const [runners, setRunners] = useState<BenchmarkRunners | null>(null);
  const [suites, setSuites] = useState<BenchmarkSuiteSummary[]>([]);
  const [selectedRun, setSelectedRun] = useState<BenchmarkRunDetail | null>(null);
  const [status, setStatus] = useState('CONNECTING TO BENCHMARK API...');
  const [suiteRunStatus, setSuiteRunStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comparison, setComparison] = useState<BenchmarkComparison | null>(null);
  const [comparisonSuiteId, setComparisonSuiteId] = useState('');
  const [comparisonStatus, setComparisonStatus] = useState('');
  const [schema, setSchema] = useState<BenchmarkSchema | null>(null);

  useEffect(() => {
    void refreshBenchmark();
  }, [apiUrl, lastSavedRunId]);

  async function refreshBenchmark(nextFilters: BenchmarkFilterState = filters) {
    setIsLoading(true);
    setStatus('READING LOCAL BENCHMARK DB...');
    try {
      const query = filtersToRequest(nextFilters);
      const [nextStats, nextRuns, nextRunners, nextSuites, nextSchema] = await Promise.all([
        fetchBenchmarkStats(apiUrl),
        fetchBenchmarkRuns({ ...query, limit: 100 }, apiUrl),
        fetchBenchmarkRunners(apiUrl),
        fetchBenchmarkSuites(apiUrl),
        fetchBenchmarkSchema(apiUrl),
      ]);
      setStats(nextStats);
      setRuns(nextRuns);
      setRunners(nextRunners);
      setSuites(nextSuites);
      setSchema(nextSchema);
      setStatus(`ONLINE: ${nextRuns.length} RUNS LOADED`);

      if (lastSavedRunId && !selectedRun) {
        await selectRun(lastSavedRunId);
      }
    } catch (error) {
      setStats(null);
      setRunners(null);
      setSuites([]);
      setRuns([]);
      setSelectedRun(null);
      setStatus(error instanceof Error ? `BENCHMARK OFFLINE: ${error.message}` : 'BENCHMARK OFFLINE');
    } finally {
      setIsLoading(false);
    }
  }

  async function selectRun(id: string) {
    setStatus(`LOADING RUN ${id}...`);
    try {
      const detail = await fetchBenchmarkRun(id, apiUrl);
      setSelectedRun(detail);
      setStatus(`RUN LOADED: ${id}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'RUN LOAD FAILED');
    }
  }

  async function loadComparison(suiteId: string) {
    if (!suiteId) return;
    setIsLoading(true);
    setComparisonStatus(`LOADING COMPARISON FOR ${suiteId}...`);
    try {
      const data = await fetchBenchmarkComparison(suiteId, undefined, undefined, apiUrl);
      setComparison(data);
      setComparisonStatus(`COMPARISON LOADED: ${data.cases.length} CASES, ${data.model_averages.length} MODELS`);
    } catch (error) {
      setComparisonStatus(error instanceof Error ? `COMPARISON FAILED: ${error.message}` : 'COMPARISON FAILED');
    } finally {
      setIsLoading(false);
    }
  }

  function updateFilter<Key extends keyof BenchmarkFilterState>(key: Key, value: BenchmarkFilterState[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function runSuite(suiteId: string, runnerMode: 'local' | 'direct') {
    setIsLoading(true);
    setSuiteRunStatus(`LOADING SUITE ${suiteId}...`);

    try {
      const suite = await fetchBenchmarkSuite(suiteId, apiUrl);
      let lastRunId = '';

      for (const [index, suiteCase] of suite.cases.entries()) {
        setSuiteRunStatus(`RUNNING ${runnerMode.toUpperCase()} SUITE ${suite.id}: ${index + 1}/${suite.cases.length} // ${suiteCase.id}`);
        const savedRun = runnerMode === 'local'
          ? await runLocalSuiteCase(suite.id, suiteCase, benchmarkConfig, apiUrl)
          : await runDirectSuiteCase(suite.id, suiteCase, benchmarkConfig, apiUrl);
        lastRunId = savedRun.id;
      }

      if (lastRunId) {
        onSavedRun(lastRunId, `SUITE ${suite.id} COMPLETE: ${suite.cases.length} ${runnerMode.toUpperCase()} RUNS`);
        await selectRun(lastRunId);
      }

      setSuiteRunStatus(`SUITE COMPLETE: ${suite.id}`);
      await refreshBenchmark(filters);
    } catch (error) {
      setSuiteRunStatus(error instanceof Error ? `SUITE RUN FAILED: ${error.message}` : 'SUITE RUN FAILED');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="main-content-stack">
      <BracketWrap title="BENCHMARK.LOCAL">
        <div className="benchmark-header-row">
          <div>
            <h2 className="benchmark-title">The Agentic Listening Benchmark</h2>
            <p className="fui-subtitle">LOCAL DATABASE: {apiUrl}</p>
          </div>
          <div className="benchmark-header-actions">
            <BenchmarkExportActions apiUrl={apiUrl} />
            <BlinkingStatus text={isLoading ? 'SYNCING' : status.includes('OFFLINE') ? 'OFFLINE' : 'ONLINE'} active={isLoading || status.includes('OFFLINE')} />
          </div>
        </div>
        <p className="benchmark-copy">{status}</p>
        {runners ? <RunnerStatus runners={runners} /> : null}
        {saveStatus ? <p className="benchmark-copy">LAST WRITE: {saveStatus}</p> : null}
      </BracketWrap>

      {stats ? <BenchmarkStatsGrid stats={stats} /> : null}
      {stats ? <BenchmarkBreakdownGrid stats={stats} /> : null}
      {suites.length > 0 ? <BenchmarkSuites suites={suites} suiteRunStatus={suiteRunStatus} onRunSuite={(suiteId, runnerMode) => void runSuite(suiteId, runnerMode)} /> : null}

      {suites.length > 0 ? (
        <BracketWrap title="BENCHMARK.COMPARISON">
          <div className="benchmark-filter-grid" style={{ gridTemplateColumns: 'minmax(220px, 1fr) 180px' }}>
            <select
              className="benchmark-select"
              value={comparisonSuiteId}
              onChange={(event) => setComparisonSuiteId(event.target.value)}
            >
              <option value="">select suite to compare</option>
              {suites.map((suite) => (
                <option value={suite.id} key={suite.id}>{suite.title}</option>
              ))}
            </select>
            <button
              className="run-button"
              type="button"
              onClick={() => void loadComparison(comparisonSuiteId)}
            >
              LOAD COMPARISON
            </button>
          </div>
          {comparisonStatus ? <p className="benchmark-copy">{comparisonStatus}</p> : null}
          {comparison ? <BenchmarkComparisonView comparison={comparison} /> : null}
        </BracketWrap>
      ) : null}

      <BracketWrap title="BENCHMARK.FILTERS">
        <div className="benchmark-filter-grid">
          <input
            className="benchmark-input"
            placeholder="Search sound, synthesis, command..."
            value={filters.q}
            onChange={(event) => updateFilter('q', event.target.value)}
          />
          <select className="benchmark-select" value={filters.command} onChange={(event) => updateFilter('command', event.target.value)}>
            <option value="all">all commands</option>
            {commandNames.map((command) => <option value={command} key={command}>{command}</option>)}
          </select>
          <select className="benchmark-select" value={filters.model_id} onChange={(event) => updateFilter('model_id', event.target.value)}>
            <option value="all">all models</option>
            {stats && stats.by_model.map((m) => <option value={m.key} key={m.key}>{m.key}</option>)}
          </select>
          <select className="benchmark-select" value={filters.input_type} onChange={(event) => updateFilter('input_type', event.target.value)}>
            <option value="all">all input types</option>
            {inputTypes.map((inputType) => <option value={inputType} key={inputType}>{inputType}</option>)}
          </select>
          <select className="benchmark-select" value={filters.claim_category} onChange={(event) => updateFilter('claim_category', event.target.value)}>
            <option value="all">all claim categories</option>
            {claimCategories.map((category) => <option value={category} key={category}>{category}</option>)}
          </select>
          <select className="benchmark-select" value={filters.raised_flag} onChange={(event) => updateFilter('raised_flag', event.target.value)}>
            <option value="all">all flags</option>
            {flagNames.map((flag) => <option value={flag} key={flag}>{flag}</option>)}
          </select>
          <select className="benchmark-select" value={filters.review_status} onChange={(event) => updateFilter('review_status', event.target.value)}>
            <option value="all">all review statuses</option>
            {reviewStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
          </select>
          <button className="run-button" type="button" onClick={() => void refreshBenchmark(filters)}>APPLY FILTERS</button>
        </div>
      </BracketWrap>

      <div className="benchmark-grid-two">
        <BenchmarkRunList runs={runs} selectedRunId={selectedRun?.id ?? ''} onSelectRun={(id) => void selectRun(id)} />
        <BenchmarkRunDetailView
          run={selectedRun}
          apiUrl={apiUrl}
          schema={schema}
          onRunUpdate={(run) => {
            if (!run) {
              setSelectedRun(null);
              void refreshBenchmark(filters);
              return;
            }
            setSelectedRun(run);
            void refreshBenchmark(filters);
          }}
        />
      </div>
    </div>
  );
}

function RunnerStatus({ runners }: { runners: BenchmarkRunners }) {
  return (
    <div className="benchmark-runner-list">
      {Object.values(runners).map((runner) => (
        <p className="benchmark-copy" key={runner.id}>
          {runner.id.toUpperCase().replace(/-/g, '_')}: {runner.configured ? 'CONFIGURED' : 'NOT CONFIGURED'} // {runner.provider} // {runner.model || 'NO MODEL'}
          {runner.supports_binary_audio ? ` // AUDIO MODE ${runner.audio_mode}` : ' // TEXT/METADATA MODE'}
        </p>
      ))}
    </div>
  );
}

async function runLocalSuiteCase(suiteId: string, suiteCase: BenchmarkSuiteCase, benchmarkConfig: BenchmarkConfig, apiUrl: string): Promise<BenchmarkRunDetail> {
  const command = normalizeSuiteCommand(suiteCase.command);
  const inputType = normalizeSuiteInputType(suiteCase.input_type);
  const startedAt = performance.now();
  const result = runListeningCommand({
    objectName: suiteCase.blind_object_name ?? suiteCase.title,
    inputType,
    prompt: suiteCase.blind_prompt ?? suiteCase.prompt,
    command,
  });

  return saveBenchmarkRun({
    result,
    input: {
      objectName: suiteCase.blind_object_name ?? suiteCase.title,
      inputType,
      prompt: suiteCase.blind_prompt ?? suiteCase.prompt,
      tags: suiteTags(suiteId, suiteCase),
      suiteId,
      caseId: suiteCase.id,
    },
    model: benchmarkConfig.model,
    agent: benchmarkConfig.agent,
    latencyMs: Math.round(performance.now() - startedAt),
    schemaValid: true,
  }, apiUrl);
}

async function runDirectSuiteCase(suiteId: string, suiteCase: BenchmarkSuiteCase, benchmarkConfig: BenchmarkConfig, apiUrl: string): Promise<BenchmarkRunDetail> {
  return runDirectBenchmark({
    command: normalizeSuiteCommand(suiteCase.command),
    input: {
      objectName: suiteCase.title,
      blindObjectName: suiteCase.blind_object_name ?? suiteCase.title,
      inputType: normalizeSuiteInputType(suiteCase.input_type),
      prompt: suiteCase.blind_prompt ?? suiteCase.prompt,
      originalPrompt: suiteCase.prompt,
      audioAsset: suiteCase.audio_asset ?? null,
      tags: suiteTags(suiteId, suiteCase),
      suiteId,
      caseId: suiteCase.id,
    },
    model: benchmarkConfig.model,
    options: {
      temperature: benchmarkConfig.model.temperature,
      maxTokens: benchmarkConfig.model.maxTokens,
      audioMode: benchmarkConfig.model.audioMode,
      responseFormat: benchmarkConfig.model.responseFormat,
    },
  }, apiUrl);
}

function suiteTags(suiteId: string, suiteCase: BenchmarkSuiteCase): string[] {
  return Array.from(new Set([suiteId, suiteCase.id, ...suiteCase.tags]));
}

function normalizeSuiteCommand(command: string): CommandName {
  return commandNames.includes(command as CommandName) ? command as CommandName : '/listen';
}

function normalizeSuiteInputType(inputType: string): InputType {
  return inputTypes.includes(inputType as InputType) ? inputType as InputType : 'sound_prompt';
}

function BenchmarkComparisonView({ comparison }: { comparison: BenchmarkComparison }) {
  if (comparison.cases.length === 0) {
    return <p className="benchmark-copy">NO RUNS FOUND FOR COMPARISON.</p>;
  }

  const models = Array.from(new Set(comparison.cases.flatMap((c) => c.runs.map((r) => r.model_id))));

  return (
    <div className="main-content-stack">
      <div className="data-grid">
        <div className="data-panel">
          <header className="data-panel-header">MODEL AVERAGES</header>
          <div className="data-panel-content">
            {comparison.model_averages.map((ma) => (
              <div key={ma.model_id} className="benchmark-score-row benchmark-comparison-model-row">
                <span>{ma.model_id}</span>
                <span>{ma.avg_overall_score === null ? 'N/A' : ma.avg_overall_score.toFixed(2)}</span>
                <span>{ma.avg_latency_ms ?? 'N/A'}ms</span>
                <span style={{ color: ma.total_flags > 0 ? 'var(--fui-red)' : 'var(--fui-cyan)' }}>{ma.total_flags} FLAGS</span>
              </div>
            ))}
          </div>
        </div>
        <div className="data-panel">
          <header className="data-panel-header">CASE OVERVIEW</header>
          <div className="data-panel-content">
            {comparison.cases.map((c) => (
              <div key={c.case_id} className="benchmark-score-row benchmark-comparison-case-row">
                <span>{c.case_title || c.case_id}</span>
                <span>{c.runs.length} RUNS</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="data-panel">
        <header className="data-panel-header">CASE X MODEL MATRIX</header>
        <div className="data-panel-content" style={{ overflowX: 'auto' }}>
          <table className="benchmark-comparison-table">
            <thead>
              <tr>
                <th>CASE</th>
                {models.map((m) => <th key={m}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {comparison.cases.map((c) => (
                <tr key={c.case_id}>
                  <td>{c.case_title || c.case_id}</td>
                  {models.map((m) => {
                    const run = c.runs.find((r) => r.model_id === m);
                    if (!run) return <td key={m} className="benchmark-comparison-cell null">—</td>;
                    return (
                      <td key={m} className="benchmark-comparison-cell">
                        <div className="benchmark-comparison-score">
                          {run.overall_score === null ? 'N/A' : run.overall_score.toFixed(2)}
                        </div>
                        <small style={{ color: run.raised_flag_count > 0 ? 'var(--fui-red)' : 'var(--text-dim)' }}>
                          {run.raised_flag_count} FLAG{run.raised_flag_count !== 1 ? 'S' : ''}
                        </small>
                        <small>{run.claim_count} CLAIMS</small>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {comparison.cases.map((c) => (
        <div className="data-panel" key={c.case_id}>
          <header className="data-panel-header">CASE // {c.case_title || c.case_id}</header>
          <div className="data-panel-content">
            {c.model_ranking.length > 0 ? (
              <p className="benchmark-copy" style={{ marginBottom: 10 }}>
                RANKING: {c.model_ranking.map((r) => `${r.model_id} (${r.avg_score})`).join(' > ')}
              </p>
            ) : null}
            <div className="benchmark-grid-two" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {c.runs.map((run) => (
                <div className="benchmark-run-row" key={run.run_id} style={{ textAlign: 'left' }}>
                  <span>{run.model_id}</span>
                  <small>SCORE {run.overall_score === null ? 'N/A' : run.overall_score.toFixed(2)} // {run.latency_ms ?? 'N/A'}ms</small>
                  <small>{run.claim_count} CLAIMS // {run.undetermined_count} UNDETERMINED</small>
                  {run.raised_flag_count > 0 ? (
                    <small style={{ color: severityColor(run.max_flag_severity) }}>
                      {run.raised_flag_count} FLAGS // MAX SEVERITY {run.max_flag_severity}
                    </small>
                  ) : null}
                  {run.scores.length > 0 ? (
                    <ul className="bullet-list">
                      {run.scores.map((s) => <li key={s.axis}>{s.axis}: {s.score}</li>)}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BenchmarkSuites({
  suites,
  suiteRunStatus,
  onRunSuite,
}: {
  suites: BenchmarkSuiteSummary[];
  suiteRunStatus: string;
  onRunSuite: (suiteId: string, runnerMode: 'local' | 'direct') => void;
}) {
  return (
    <div className="main-content-stack">
      {suiteRunStatus ? <p className="benchmark-copy">{suiteRunStatus}</p> : null}
      <div className="data-grid">
        {suites.map((suite) => (
          <article className="data-panel" key={suite.id}>
            <header className="data-panel-header">SUITE // {suite.id}</header>
            <div className="data-panel-content">
              <p className="benchmark-copy" style={{ color: 'var(--fui-cyan)' }}>{suite.title}</p>
              <p className="benchmark-copy">{suite.description}</p>
              <p className="benchmark-copy">CASES: {suite.case_count} // VERSION: {suite.version}</p>
              <p className="benchmark-copy">FOCUS: {suite.focus.join(' // ')}</p>
              <div className="benchmark-suite-actions">
                <button type="button" onClick={() => onRunSuite(suite.id, 'local')}>RUN LOCAL SUITE</button>
                <button type="button" onClick={() => onRunSuite(suite.id, 'direct')}>RUN DIRECT SUITE</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function BenchmarkExportActions({ apiUrl }: { apiUrl: string }) {
  async function openExport(exportName: 'runs.csv' | 'claims.csv' | 'scores.csv' | 'flags.csv' | 'runs.json' | 'report.html' | 'report.md') {
    const response = await fetch(benchmarkExportUrl(apiUrl, exportName), { headers: benchmarkHeaders(undefined, apiUrl) });
    if (!response.ok) return;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    if (exportName.endsWith('.html')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = exportName;
      link.click();
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  return (
    <div className="benchmark-export-actions">
      <button type="button" onClick={() => void openExport('runs.csv')}>RUNS CSV</button>
      <button type="button" onClick={() => void openExport('claims.csv')}>CLAIMS CSV</button>
      <button type="button" onClick={() => void openExport('scores.csv')}>SCORES CSV</button>
      <button type="button" onClick={() => void openExport('flags.csv')}>FLAGS CSV</button>
      <button type="button" onClick={() => void openExport('report.html')}>REPORT HTML</button>
      <button type="button" onClick={() => void openExport('report.md')}>REPORT MD</button>
    </div>
  );
}

function BenchmarkStatsGrid({ stats }: { stats: BenchmarkStats }) {
  return (
    <div className="benchmark-stats-grid">
      <StatCard label="RUNS" value={stats.totals.runs} />
      <StatCard label="SOUNDS" value={stats.totals.sound_objects} />
      <StatCard label="MODELS" value={stats.totals.models} />
      <StatCard label="AGENTS" value={stats.totals.agents} />
      <StatCard label="CLAIMS" value={stats.totals.claims} />
      <StatCard label="FLAGS" value={stats.totals.flags} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="data-panel benchmark-stat-card">
      <header className="data-panel-header">{label}</header>
      <div className="data-panel-content">{value}</div>
    </article>
  );
}

function BenchmarkBreakdownGrid({ stats }: { stats: BenchmarkStats }) {
  return (
    <div className="data-grid">
      <ListPanel title="SCORE AXES" values={stats.by_score_axis.map(formatGroupStat)} />
      <ListPanel title="CLAIM CATEGORIES" values={stats.by_claim_category.map(formatGroupStat)} />
      <ListPanel title="LISTENING MODES" values={stats.by_listening_mode.slice(0, 9).map(formatGroupStat)} />
      <ListPanel title="FLAGS" values={stats.by_flag.map(formatGroupStat)} />
      <ListPanel title="MODELS" values={stats.by_model.map(formatGroupStat)} />
    </div>
  );
}

function BenchmarkRunList({ runs, selectedRunId, onSelectRun }: { runs: BenchmarkRunSummary[]; selectedRunId: string; onSelectRun: (id: string) => void }) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (runs.length === 0) return;
    const currentIndex = runs.findIndex(r => r.id === selectedRunId);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = currentIndex < runs.length - 1 ? currentIndex + 1 : 0;
      onSelectRun(runs[nextIndex].id);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : runs.length - 1;
      onSelectRun(runs[nextIndex].id);
    }
  }

  return (
    <BracketWrap title="RUN.HISTORY">
      <div className="benchmark-run-list" tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: 'none' }}>
        {runs.length > 0 ? runs.map((run) => (
          <button
            className={`benchmark-run-row ${selectedRunId === run.id ? 'is-selected' : ''}`}
            type="button"
            onClick={() => onSelectRun(run.id)}
            key={run.id}
          >
            <span>{run.sound_label}</span>
            <small>{run.command} // {run.model_id}</small>
            <small>{formatDate(run.created_at)} // {run.claim_count ?? 0} CLAIMS // SCORE {formatScore(run.overall_score)}</small>
            {run.raised_flag_count ? (
              <small style={{ color: severityColor(run.max_flag_severity ?? 1) }}>
                {run.raised_flag_count} FLAG{run.raised_flag_count > 1 ? 'S' : ''} RAISED // MAX SEVERITY {run.max_flag_severity}
              </small>
            ) : null}
            <small style={{ color: reviewStatusColor(run.review_status) }}>
              REVIEW: {run.review_status.toUpperCase()}
            </small>
            {run.suite_id ? <small>SUITE {run.suite_id} // CASE {run.case_id}</small> : null}
            {run.synthesis && (
              <div style={{ marginTop: '6px', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'left', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {run.synthesis}
              </div>
            )}
          </button>
        )) : <p className="benchmark-copy">NO RUNS FOUND. START THE BENCH SERVER AND SAVE A LISTENING PASS.</p>}
      </div>
    </BracketWrap>
  );
}

function BenchmarkRunDetailView({ run, apiUrl, schema, onRunUpdate }: { run: BenchmarkRunDetail | null; apiUrl: string; schema: BenchmarkSchema | null; onRunUpdate: (run: BenchmarkRunDetail | null) => void }) {
  if (!run) {
    return (
      <BracketWrap title="RUN.DETAIL">
        <p className="benchmark-copy">SELECT A RUN TO INSPECT NORMALIZED CLAIMS, SCORES, SKILLS, AND RAW OUTPUT.</p>
      </BracketWrap>
    );
  }

  return <BenchmarkRunInspector run={run} apiUrl={apiUrl} schema={schema} onRunUpdate={onRunUpdate} />;
}

function BenchmarkRunInspector({ run, apiUrl, schema, onRunUpdate }: { run: BenchmarkRunDetail; apiUrl: string; schema: BenchmarkSchema | null; onRunUpdate: (run: BenchmarkRunDetail | null) => void }) {
  const [scoreInputs, setScoreInputs] = useState(() => createScoreInputs(run, schema));
  const [scoreStatus, setScoreStatus] = useState('');
  const [reviewStatus, setReviewStatus] = useState(run.review_status);
  const [reviewNotes, setReviewNotes] = useState(run.review_notes);
  const [reviewedBy, setReviewedBy] = useState(run.reviewed_by);
  const [reviewStatusMsg, setReviewStatusMsg] = useState('');
  const [visibleClaimsCount, setVisibleClaimsCount] = useState(18);

  useEffect(() => {
    setScoreInputs(createScoreInputs(run, schema));
    setScoreStatus('');
    setReviewStatus(run.review_status);
    setReviewNotes(run.review_notes);
    setReviewedBy(run.reviewed_by);
    setReviewStatusMsg('');
    setVisibleClaimsCount(18);
  }, [run.id, schema]);

  const visibleClaims = run.claims.slice(0, visibleClaimsCount);

  async function copyRunJson() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(JSON.stringify(run, null, 2));
  }

  async function deleteRun() {
    if (!confirm('Are you sure you want to delete this run? This cannot be undone.')) return;
    try {
      const res = await fetch(benchmarkRequestUrl(apiUrl, `/api/runs/${encodeURIComponent(run.id)}`), { method: 'DELETE', headers: benchmarkHeaders(undefined, apiUrl) });
      if (!res.ok) throw new Error('Delete failed');
      onRunUpdate(null);
    } catch (error) {
      setReviewStatusMsg('DELETE FAILED');
    }
  }

  async function saveScores() {
    setScoreStatus('SAVING SCORES...');
    try {
      const nextScores: BenchmarkScoreInput[] = scoreInputs.map((score) => ({
        axis: score.axis,
        score: Number(score.score),
        notes: score.notes,
      }));
      const savedRun = await replaceBenchmarkScores(run.id, nextScores, apiUrl);
      onRunUpdate(savedRun);
      setScoreStatus('SCORES SAVED');
    } catch (error) {
      setScoreStatus(error instanceof Error ? `SCORE SAVE FAILED: ${error.message}` : 'SCORE SAVE FAILED');
    }
  }

  async function saveReview() {
    setReviewStatusMsg('SAVING REVIEW...');
    try {
      const savedRun = await updateBenchmarkReview(run.id, {
        review_status: reviewStatus,
        review_notes: reviewNotes,
        reviewed_by: reviewedBy,
      }, apiUrl);
      onRunUpdate(savedRun);
      setReviewStatusMsg('REVIEW SAVED');
    } catch (error) {
      setReviewStatusMsg(error instanceof Error ? `REVIEW SAVE FAILED: ${error.message}` : 'REVIEW SAVE FAILED');
    }
  }

  return (
    <BracketWrap title="RUN.DETAIL">
      <div className="report-header benchmark-detail-header">
        <div>
          <span className="report-command">{run.command}</span>
          <h3>{run.sound_label}</h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="run-button benchmark-small-button" type="button" onClick={() => void copyRunJson()}>COPY JSON</button>
          <button className="run-button benchmark-small-button" type="button" style={{ borderColor: 'var(--fui-red)', color: 'var(--fui-red)' }} onClick={() => void deleteRun()}>DELETE RUN</button>
        </div>
      </div>

      <div className="route-stack-three">
        <ModeSlot label="MODEL" value={run.model_id} />
        <ModeSlot label="AGENT" value={run.agent_id} />
        <ModeSlot label="INPUT" value={run.input_type} />
      </div>

      {run.suite_id ? (
        <div className="route-stack-three">
          <ModeSlot label="SUITE" value={run.suite_id} />
          <ModeSlot label="CASE" value={run.case_id} />
          <ModeSlot label="LATENCY" value={run.latency_ms === null ? 'unknown' : `${run.latency_ms} ms`} />
        </div>
      ) : null}

      <div className="data-grid">
        <ListPanel title="SKILLS" values={run.skills} />
        <ListPanel title="SCORES" values={run.scores.map((score) => `${score.axis}: ${score.score}/5`)} />
      </div>

      {run.flags.length > 0 ? (
        <div className="data-panel benchmark-flags-panel">
          <header className="data-panel-header">AUTOMATED QUALITY FLAGS</header>
          <div className="data-panel-content">
            {run.flags.map((flag) => (
              <div className="benchmark-flag-row" key={flag.id} style={{ opacity: flag.value ? 1 : 0.5 }}>
                <span style={{ color: flag.value ? severityColor(flag.severity) : 'var(--fui-white-dim)' }}>
                  {flag.value ? '⚠' : '✓'} {flag.flag}
                </span>
                <small>severity {flag.severity}</small>
                <p className="benchmark-copy">{flag.details}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="data-panel benchmark-score-editor">
        <header className="data-panel-header">MANUAL SCORECARD</header>
        <div className="data-panel-content">
          {scoreInputs.map((score, index) => (
            <div className="benchmark-score-row" key={score.axis}>
              <label htmlFor={`score-${score.axis}`}>{score.axis}</label>
              <input
                id={`score-${score.axis}`}
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={score.score}
                onChange={(event) => setScoreInputs((current) => updateScoreInput(current, index, { score: event.target.value }))}
              />
              <input
                className="benchmark-input"
                placeholder="notes"
                value={score.notes}
                onChange={(event) => setScoreInputs((current) => updateScoreInput(current, index, { notes: event.target.value }))}
              />
            </div>
          ))}
          <button className="run-button benchmark-small-button" type="button" onClick={() => void saveScores()}>SAVE SCORES</button>
          {scoreStatus ? <p className="benchmark-copy">{scoreStatus}</p> : null}
        </div>
      </div>

      <div className="data-panel benchmark-score-editor">
        <header className="data-panel-header">HUMAN REVIEW</header>
        <div className="data-panel-content">
          <div className="benchmark-score-row" style={{ gridTemplateColumns: '120px 1fr' }}>
            <label htmlFor="review-status">STATUS</label>
            <select
              id="review-status"
              className="benchmark-select"
              value={reviewStatus}
              onChange={(event) => setReviewStatus(event.target.value)}
            >
              {reviewStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
            </select>
          </div>
          <div className="benchmark-score-row" style={{ gridTemplateColumns: '120px 1fr' }}>
            <label htmlFor="reviewed-by">REVIEWER</label>
            <input
              id="reviewed-by"
              className="benchmark-input"
              placeholder="reviewer name or id"
              value={reviewedBy}
              onChange={(event) => setReviewedBy(event.target.value)}
            />
          </div>
          <div className="benchmark-score-row" style={{ gridTemplateColumns: '120px 1fr' }}>
            <label htmlFor="review-notes">NOTES</label>
            <input
              id="review-notes"
              className="benchmark-input"
              placeholder="review notes..."
              value={reviewNotes}
              onChange={(event) => setReviewNotes(event.target.value)}
            />
          </div>
          <button className="run-button benchmark-small-button" type="button" onClick={() => void saveReview()}>SAVE REVIEW</button>
          {reviewStatusMsg ? <p className="benchmark-copy">{reviewStatusMsg}</p> : null}
        </div>
      </div>

      <div className="data-panel benchmark-claim-table">
        <header className="data-panel-header">NORMALIZED CLAIMS</header>
        <div className="data-panel-content">
          {visibleClaims.length > 0 ? visibleClaims.map((claim) => (
            <div className="benchmark-claim-row" key={claim.id}>
              <span>{claim.category}</span>
              <strong>{claim.statement}</strong>
              <small>{claim.listening_mode || 'summary'} // {claim.confidence} // {claim.basis || 'no basis'}</small>
            </div>
          )) : <p className="benchmark-copy">NO CLAIMS STORED FOR THIS RUN.</p>}
          {run.claims.length > visibleClaims.length ? (
            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p className="benchmark-copy">SHOWING {visibleClaims.length} OF {run.claims.length} CLAIMS.</p>
              <button className="run-button benchmark-small-button" type="button" onClick={() => setVisibleClaimsCount(c => c + 18)}>SHOW MORE</button>
            </div>
          ) : null}
        </div>
      </div>
    </BracketWrap>
  );
}

interface ScoreInputState {
  axis: string;
  score: string;
  notes: string;
}

function createScoreInputs(run: BenchmarkRunDetail, schema: BenchmarkSchema | null): ScoreInputState[] {
  const scoreMap = new Map(run.scores.map((score) => [score.axis, score]));
  const defaultAxes = schema?.score_axes ?? scoreAxes;
  const axes = Array.from(new Set([...defaultAxes, ...run.scores.map((score) => score.axis)]));

  return axes.map((axis) => {
    const score = scoreMap.get(axis);
    return {
      axis,
      score: String(score?.score ?? defaultScoreForAxis(axis)),
      notes: score?.notes ?? '',
    };
  });
}

function updateScoreInput(scores: ScoreInputState[], index: number, patch: Partial<ScoreInputState>): ScoreInputState[] {
  return scores.map((score, scoreIndex) => scoreIndex === index ? { ...score, ...patch } : score);
}

function defaultScoreForAxis(axis: string): number {
  if (axis === 'schema_validity') return 5;
  return 3;
}

function ModeSlot({ label, value }: { label: string; value: string }) {
  return (
    <div className="mode-slot">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ListPanel({ title, values }: { title: string; values: string[] }) {
  return (
    <article className="data-panel">
      <header className="data-panel-header">{title}</header>
      <div className="data-panel-content">
        {values.length > 0 ? <ul className="bullet-list">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <span className="benchmark-copy">NULL</span>}
      </div>
    </article>
  );
}

function filtersToRequest(filters: BenchmarkFilterState): BenchmarkRunFilters {
  return {
    q: filters.q,
    command: filters.command,
    input_type: filters.input_type,
    claim_category: filters.claim_category,
    raised_flag: filters.raised_flag,
    review_status: filters.review_status,
    model_id: filters.model_id,
  };
}

function formatScore(score: number | null): string {
  return score === null ? 'N/A' : score.toFixed(2);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function severityColor(severity: number): string {
  if (severity >= 3) return 'var(--fui-red)';
  if (severity >= 2) return 'var(--fui-yellow)';
  if (severity >= 1) return 'var(--fui-cyan)';
  return 'var(--fui-white-dim)';
}

function reviewStatusColor(status: string): string {
  if (status === 'rejected') return 'var(--fui-red)';
  if (status === 'flagged') return 'var(--fui-yellow)';
  if (status === 'reviewed') return 'var(--fui-cyan)';
  return 'var(--text-dim)';
}

function formatGroupStat(stat: { key: string; count: number; avg_score: number | null }): string {
  const score = stat.avg_score === null ? '' : ` // avg ${stat.avg_score}`;
  return `${stat.key}: ${stat.count}${score}`;
}
