import type { AudioInspection, CommandResult } from './types';

interface BenchmarkModelConfig {
  id: string;
  provider: string;
  modality: string;
  notes?: string;
  // Runtime parameters the user can adjust in the app
  temperature?: number;
  maxTokens?: number;
  audioMode?: 'none' | 'chat-input-audio';
  responseFormat?: 'json_object' | 'none';
}

interface ModelProviderState {
  provider: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  audioMode: 'none' | 'chat-input-audio';
  responseFormat: 'json_object' | 'none';
}

export interface BenchmarkSchema {
  tables: string[];
  claim_categories: string[];
  listening_modes: string[];
  score_axes: string[];
  score_range: { min: number; max: number };
  flags: string[];
}

interface BenchmarkAgentConfig {
  id: string;
  type: string;
  notes?: string;
}

export interface BenchmarkConfig {
  apiUrl: string;
  autoSave: boolean;
  model: BenchmarkModelConfig;
  agent: BenchmarkAgentConfig;
}

export interface SaveBenchmarkRunPayload {
  result: CommandResult;
  input: {
    objectName?: string;
    inputType?: string;
    prompt?: string;
    audioInspection?: AudioInspection | null;
    tags?: string[];
    suiteId?: string;
    caseId?: string;
  };
  model: BenchmarkModelConfig;
  agent: BenchmarkAgentConfig;
  latencyMs?: number;
  schemaValid?: boolean;
}

export interface DirectBenchmarkRunPayload {
  command: string;
  input: {
    objectName?: string;
    blindObjectName?: string;
    inputType?: string;
    prompt?: string;
    originalPrompt?: string;
    audioInspection?: AudioInspection | null;
    audioPayload?: DirectBenchmarkAudioPayload | null;
    audioAsset?: BenchmarkAudioAsset | null;
    tags?: string[];
    suiteId?: string;
    caseId?: string;
  };
  model?: Partial<BenchmarkModelConfig>;
  options?: {
    temperature?: number;
    maxTokens?: number;
    audioMode?: 'none' | 'chat-input-audio';
    responseFormat?: 'json_object' | 'none';
  };
}

interface DirectBenchmarkAudioPayload {
  fileName: string;
  fileType: string;
  format: string;
  dataBase64: string;
}

interface BenchmarkAudioAsset {
  path: string;
  file_name?: string;
  file_type: string;
  format: string;
  duration_seconds?: number;
  sample_rate?: number;
  channel_count?: number;
  sha256?: string;
  license?: string;
  provenance?: string;
}

export interface BenchmarkRunFilters {
  q?: string;
  command?: string;
  input_type?: string;
  claim_category?: string;
  raised_flag?: string;
  review_status?: string;
  model_id?: string;
  agent_id?: string;
  skill?: string;
  limit?: number;
}

interface BenchmarkFlag {
  id: string;
  flag: string;
  value: boolean;
  details: string;
  severity: number;
  created_at: string;
}

export interface BenchmarkRunSummary {
  id: string;
  sound_object_id: string;
  sound_label: string;
  command: string;
  model_id: string;
  agent_id: string;
  input_type: string;
  suite_id: string;
  case_id: string;
  skills: string[];
  synthesis: string;
  overall_score: number | null;
  schema_valid: boolean;
  latency_ms: number | null;
  claim_count?: number;
  undetermined_count?: number;
  raised_flag_count?: number;
  max_flag_severity?: number;
  review_status: string;
  review_notes: string;
  reviewed_by: string;
  reviewed_at?: string;
  audio_file_name?: string;
  created_at: string;
}

interface BenchmarkClaim {
  id: string;
  category: string;
  statement: string;
  confidence: string;
  basis: string;
  listening_mode: string;
  source_section: string;
  created_at: string;
}

interface BenchmarkScore {
  id: string;
  axis: string;
  score: number;
  notes: string;
  created_at: string;
}

export interface BenchmarkScoreInput {
  axis: string;
  score: number;
  notes?: string;
}

export interface BenchmarkRunDetail extends BenchmarkRunSummary {
  sound_object: {
    id: string;
    label: string;
    input_type: string;
    prompt: string;
    audio_file_name: string;
    audio_file_type: string;
    audio_file_size: number | null;
    duration_seconds: number | null;
    sample_rate: number | null;
    channel_count: number | null;
    tags: string[];
  };
  route: unknown;
  result: CommandResult;
  claims: BenchmarkClaim[];
  scores: BenchmarkScore[];
  flags: BenchmarkFlag[];
  runner?: {
    id: string;
    provider: string;
    model: string;
    schema_valid: boolean;
  };
}

export interface BenchmarkRunnerInfo {
  id: string;
  configured: boolean;
  provider: string;
  base_url: string;
  model: string;
  supports_binary_audio: boolean;
  audio_mode: string;
  response_format: string;
  supported_modalities: string[];
  required_env: string[];
}

export interface BenchmarkRunners {
  direct_openai_compatible: BenchmarkRunnerInfo;
  gemini: BenchmarkRunnerInfo;
  nvidia_nim: BenchmarkRunnerInfo;
  local: BenchmarkRunnerInfo;
  cli_gemini?: BenchmarkRunnerInfo;
  cli_claude?: BenchmarkRunnerInfo;
  cli_codex?: BenchmarkRunnerInfo;
}

export interface BenchmarkSuiteSummary {
  id: string;
  title: string;
  description: string;
  version: string;
  case_count: number;
  focus: string[];
}

export interface BenchmarkSuiteCase {
  id: string;
  title: string;
  blind_object_name?: string;
  blind_prompt?: string;
  command: string;
  input_type: string;
  prompt: string;
  audio_asset?: BenchmarkAudioAsset;
  expected_claims?: string[];
  ground_truth?: Record<string, unknown>;
  license?: string;
  provenance?: string;
  difficulty?: string;
  evaluation_focus?: string[];
  expected_modes: string[];
  tags: string[];
}

export interface BenchmarkSuiteDetail extends Omit<BenchmarkSuiteSummary, 'case_count'> {
  cases: BenchmarkSuiteCase[];
}

export interface BenchmarkStats {
  totals: {
    runs: number;
    sound_objects: number;
    models: number;
    agents: number;
    claims: number;
    flags: number;
  };
  by_model: BenchmarkGroupStat[];
  by_agent: BenchmarkGroupStat[];
  by_command: BenchmarkGroupStat[];
  by_input_type: BenchmarkGroupStat[];
  by_claim_category: BenchmarkGroupStat[];
  by_listening_mode: BenchmarkGroupStat[];
  by_score_axis: BenchmarkGroupStat[];
  by_flag: BenchmarkGroupStat[];
  recent_runs: BenchmarkRunSummary[];
}

interface BenchmarkGroupStat {
  key: string;
  count: number;
  avg_score: number | null;
}

interface BenchmarkComparisonRun {
  run_id: string;
  model_id: string;
  agent_id: string;
  overall_score: number | null;
  scores: Array<{ axis: string; score: number; notes: string }>;
  flags: BenchmarkFlag[];
  claim_counts: Record<string, number>;
  claim_count: number;
  undetermined_count: number;
  raised_flag_count: number;
  max_flag_severity: number;
  synthesis: string;
  latency_ms: number | null;
  created_at: string;
}

interface BenchmarkComparisonCase {
  case_id: string;
  case_title: string;
  runs: BenchmarkComparisonRun[];
  model_ranking: Array<{ model_id: string; avg_score: number }>;
}

interface BenchmarkComparisonModelAverage {
  model_id: string;
  avg_overall_score: number | null;
  avg_latency_ms: number | null;
  total_flags: number;
  total_runs: number;
}

export interface BenchmarkComparison {
  suite_id: string;
  case_id: string;
  model_id: string;
  cases: BenchmarkComparisonCase[];
  model_averages: BenchmarkComparisonModelAverage[];
}

const DEFAULT_BENCHMARK_API = normalizeApiUrl(import.meta.env.VITE_AKOUO_BENCHMARK_API ?? 'http://localhost:8787');
const DEFAULT_BENCHMARK_API_KEY = import.meta.env.VITE_AKOUO_BENCHMARK_API_KEY ?? '';
const DEFAULT_BENCHMARK_TRUSTED_ORIGINS = parseTrustedOrigins(import.meta.env.VITE_AKOUO_BENCHMARK_TRUSTED_ORIGINS ?? '');

export function createDefaultBenchmarkConfig(): BenchmarkConfig {
  return {
    apiUrl: DEFAULT_BENCHMARK_API,
    autoSave: false,
    model: {
      id: 'akouo-local-deterministic',
      provider: 'local',
      modality: 'text-and-audio-metadata',
      notes: 'Deterministic Akoúō local runner baseline',
      temperature: 0.2,
      maxTokens: 4096,
      audioMode: 'none',
      responseFormat: 'json_object',
    },
    agent: {
      id: 'akouo-app',
      type: 'browser-local',
      notes: 'Akoúō local app',
    },
  };
}

export async function saveBenchmarkRun(payload: SaveBenchmarkRunPayload, apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkRunDetail> {
  return requestJson<BenchmarkRunDetail>(apiUrl, '/api/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function runDirectBenchmark(payload: DirectBenchmarkRunPayload, apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkRunDetail> {
  return requestJson<BenchmarkRunDetail>(apiUrl, '/api/runs/direct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function fetchBenchmarkRuns(filters: BenchmarkRunFilters = {}, apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkRunSummary[]> {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '' || value === 'all') continue;
    params.set(key, String(value));
  }

  const query = params.toString();
  return requestJson<BenchmarkRunSummary[]>(apiUrl, `/api/runs${query ? `?${query}` : ''}`);
}

export async function fetchBenchmarkRun(id: string, apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkRunDetail> {
  return requestJson<BenchmarkRunDetail>(apiUrl, `/api/runs/${encodeURIComponent(id)}`);
}

export async function fetchBenchmarkStats(apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkStats> {
  return requestJson<BenchmarkStats>(apiUrl, '/api/stats');
}

export async function fetchBenchmarkRunners(apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkRunners> {
  return requestJson<BenchmarkRunners>(apiUrl, '/api/runners');
}

export async function fetchBenchmarkSuites(apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkSuiteSummary[]> {
  return requestJson<BenchmarkSuiteSummary[]>(apiUrl, '/api/suites');
}

export async function fetchBenchmarkSchema(apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkSchema> {
  return requestJson<BenchmarkSchema>(apiUrl, '/api/schema');
}

export async function fetchBenchmarkSuite(id: string, apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkSuiteDetail> {
  return requestJson<BenchmarkSuiteDetail>(apiUrl, `/api/suites/${encodeURIComponent(id)}`);
}

export async function replaceBenchmarkScores(runId: string, scores: BenchmarkScoreInput[], apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkRunDetail> {
  return requestJson<BenchmarkRunDetail>(apiUrl, `/api/runs/${encodeURIComponent(runId)}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scores }),
  });
}

export interface BenchmarkReviewInput {
  review_status?: string;
  review_notes?: string;
  reviewed_by?: string;
}

export async function updateBenchmarkReview(runId: string, review: BenchmarkReviewInput, apiUrl = DEFAULT_BENCHMARK_API): Promise<BenchmarkRunDetail> {
  return requestJson<BenchmarkRunDetail>(apiUrl, `/api/runs/${encodeURIComponent(runId)}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
}

export function benchmarkExportUrl(apiUrl: string, exportName: string): string {
  return endpointUrl(apiUrl, `/api/export/${exportName}`);
}

export function benchmarkRequestUrl(apiUrl: string, path: string): string {
  return endpointUrl(apiUrl, path);
}

export async function fetchBenchmarkComparison(
  suiteId?: string,
  caseId?: string,
  modelId?: string,
  apiUrl = DEFAULT_BENCHMARK_API,
): Promise<BenchmarkComparison> {
  const params = new URLSearchParams();
  if (suiteId) params.set('suite_id', suiteId);
  if (caseId) params.set('case_id', caseId);
  if (modelId) params.set('model_id', modelId);
  const query = params.toString();
  return requestJson<BenchmarkComparison>(apiUrl, `/api/compare${query ? `?${query}` : ''}`);
}

export async function checkBenchmarkHealth(apiUrl = DEFAULT_BENCHMARK_API): Promise<boolean> {
  try {
    const result = await requestJson<{ ok: boolean }>(apiUrl, '/api/health');
    return Boolean(result.ok);
  } catch {
    return false;
  }
}

export function benchmarkHeaders(extra?: HeadersInit, apiUrl = DEFAULT_BENCHMARK_API): Headers {
  const headers = new Headers(extra);
  if (shouldAttachBenchmarkKey(apiUrl) && !headers.has('Authorization') && !headers.has('X-Bench-API-Key')) {
    headers.set('X-Bench-API-Key', DEFAULT_BENCHMARK_API_KEY);
  }
  return headers;
}

async function requestJson<T>(apiUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(endpointUrl(apiUrl, path), { ...init, headers: benchmarkHeaders(init?.headers, apiUrl) });
  const data = await response.json().catch(() => null) as unknown;

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'error' in data ? String((data as { error: unknown }).error) : `Benchmark API error ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

function normalizeApiUrl(apiUrl: string): string {
  return apiUrl.trim().replace(/\/+$/, '');
}

function endpointUrl(apiUrl: string, path: string): string {
  const normalizedApiUrl = normalizeApiUrl(apiUrl);
  if (!normalizedApiUrl) return path;
  return `${normalizedApiUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function parseTrustedOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function shouldAttachBenchmarkKey(apiUrl: string): boolean {
  if (!DEFAULT_BENCHMARK_API_KEY || DEFAULT_BENCHMARK_TRUSTED_ORIGINS.length === 0) return false;

  const origin = originForApiUrl(apiUrl);
  return origin !== null && DEFAULT_BENCHMARK_TRUSTED_ORIGINS.includes(origin);
}

function originForApiUrl(apiUrl: string): string | null {
  const normalizedApiUrl = normalizeApiUrl(apiUrl);
  const base = globalThis.location?.origin ?? 'http://localhost';

  try {
    return new URL(normalizedApiUrl || '/', base).origin;
  } catch {
    return null;
  }
}
