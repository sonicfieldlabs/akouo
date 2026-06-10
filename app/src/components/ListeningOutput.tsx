import { useState } from 'react';
import { claimCategories, comparativeModeKeys, listeningModes } from '../akouo/types';
import type {
  Claim,
  ClaimCategory,
  ClaimTaxonomy,
  CommandOutput,
  CommandResult,
  ComparativeListeningOutput,
  ListeningOutput as ModeOutput,
  Mediations,
  ReferenceMap,
  Risks,
  RoutingPlan,
} from '../akouo/types';
import { BracketWrap } from './FuiDecorations';

interface ListeningOutputProps {
  result: CommandResult | null;
  error: string;
}

export function ListeningOutput({ result, error }: ListeningOutputProps) {
  return (
    <BracketWrap title="OUTPUT.LOG">
      {error ? <p className="error-note">{error}</p> : null}
      {result ? <ReportActions result={result} /> : null}
      {result ? <ResultReport result={result} /> : <EmptyReport />}
    </BracketWrap>
  );
}

function EmptyReport() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed var(--text-dim)' }}>
      AWAITING COMMAND EXECUTION...
    </div>
  );
}

function ReportActions({ result }: { result: CommandResult }) {
  const [status, setStatus] = useState('');

  async function copyResult() {
    const payload = JSON.stringify(result, null, 2);
    if (!navigator.clipboard) {
      setStatus('CLIPBOARD API OFFLINE');
      return;
    }
    await navigator.clipboard.writeText(payload);
    setStatus('JSON COPIED');
  }

  function exportResult() {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'akouo-result.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('JSON EXPORTED');
  }

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <button className="run-button" style={{ padding: '5px', margin: 0, width: 'auto' }} onClick={copyResult}>COPY JSON</button>
      <button className="run-button" style={{ padding: '5px', margin: 0, width: 'auto' }} onClick={exportResult}>EXPORT LOG</button>
      {status && <span style={{ color: 'var(--fui-cyan)', fontSize: '0.65rem', alignSelf: 'center' }}>{status}</span>}
    </div>
  );
}

function ResultReport({ result }: { result: CommandResult }) {
  if (isComparativeResult(result)) {
    return <ComparativeReport result={result} />;
  }
  return <StandardReport result={result} />;
}

function StandardReport({ result }: { result: CommandOutput }) {
  return (
    <div className="main-content-stack">
      <ReportHeader
        command={result.command}
        objectName={result.object_listened_to}
        inputType={result.input_type}
        modeCount={result.outputs.length}
        nextMode={result.recommended_next_mode}
      />

      {result.router_output ? (
        <div className="route-stack-three">
          <ModeSlot label="PRIMARY EAR" value={result.router_output.primary_mode} />
          <ModeSlot label="SECONDARY EAR" value={result.router_output.secondary_mode} />
          <ModeSlot label="CORRECTIVE EAR" value={result.router_output.corrective_mode} />
        </div>
      ) : null}

      {result.routing_plan ? <RoutingPlanView plan={result.routing_plan} /> : null}

      <div className="data-panel">
        <header className="data-panel-header">SYNTHESIS</header>
        <div className="data-panel-content">
          <p>{result.synthesis}</p>
        </div>
      </div>

      {result.reference_map ? <ReferenceMapView referenceMap={result.reference_map} /> : null}

      {result.outputs.length > 0 ? <MediationRiskSummary outputs={result.outputs} commandRisks={result.risks} /> : null}

      <ClaimSummary claims={result.claim_summary} />

      {result.outputs.length > 0 ? (
        <div className="mode-output-grid">
          {result.outputs.map((output) => (
            <ModeOutputCard output={output} key={output.listening_mode} />
          ))}
        </div>
      ) : (
        <div className="data-panel">
          <div className="data-panel-content">{emptyModeOutputLabel(result)}</div>
        </div>
      )}
    </div>
  );
}

function emptyModeOutputLabel(result: CommandOutput): string {
  if (result.command === '/route') return 'ROUTER PLAN ONLY. NO MODE OUTPUT.';
  if (result.reference_map) return 'REFERENCE MAP ONLY. NO MODE OUTPUT.';
  return 'NO MODE OUTPUT.';
}

function ComparativeReport({ result }: { result: ComparativeListeningOutput }) {
  const outputs = listeningModes.map((mode) => result.mode_comparison[comparativeModeKeys[mode]]);

  return (
    <div className="main-content-stack">
      <ReportHeader
        command={result.command}
        objectName={result.sound_object}
        inputType={result.input_type}
        modeCount={outputs.length}
        nextMode={result.most_interesting_next_mode}
      />

      <div className="data-panel">
        <header className="data-panel-header">MOST RESPONSIBLE READING</header>
        <div className="data-panel-content"><p>{result.most_responsible_reading}</p></div>
      </div>

      <div className="data-grid">
        <ListPanel title="CONTRADICTIONS" values={result.contradictions} />
        <ListPanel title="PRODUCTIVE TENSIONS" values={result.productive_tensions} />
      </div>

      <MediationRiskSummary outputs={outputs} commandRisks={[]} />
      <ClaimSummary claims={result.shared_claim_summary} />

      <div className="mode-output-grid">
        {outputs.map((output) => (
          <ModeOutputCard output={output} key={output.listening_mode} />
        ))}
      </div>
    </div>
  );
}

function ReportHeader({
  command,
  objectName,
  inputType,
  modeCount,
  nextMode,
}: {
  command: string;
  objectName: string;
  inputType: string;
  modeCount: number;
  nextMode: string;
}) {
  return (
    <div className="report-header">
      <div>
        <span className="report-command">{"// "}{command}</span>
        <h3>{objectName}</h3>
      </div>
      <div style={{ display: 'flex', gap: '8px', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
        <span>TYPE: {inputType.toUpperCase()}</span>
        <span>MODES: {modeCount}</span>
        <span>NEXT: {nextMode.toUpperCase()}</span>
      </div>
    </div>
  );
}

function ModeSlot({ label, value }: { label: string; value: string }) {
  return (
    <div className="mode-slot">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RoutingPlanView({ plan }: { plan: RoutingPlan }) {
  const permissions = Object.entries(plan.claim_permissions)
    .map(([key, allowed]) => `${key.replace(/_allowed$/, '').replace(/_/g, ' ')}: ${allowed ? 'yes' : 'no'}`);

  return (
    <div className="data-panel">
      <header className="data-panel-header">
        ROUTING PLAN — EVIDENCE: {plan.evidence_level.toUpperCase()} / CONFIDENCE: {plan.route_confidence.toUpperCase()}
      </header>
      <div className="data-panel-content">
        <p>{plan.agent_handoff.summary}</p>

        <div className="route-stack-three" style={{ margin: '10px 0' }}>
          {plan.mode_chain.map((item) => (
            <div className="mode-slot" key={`${item.role}-${item.mode}`} title={item.reason}>
              <span>{item.role.toUpperCase()}</span>
              <strong>{item.mode}</strong>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
          CLAIM PERMISSIONS — {permissions.join(' · ')}
        </p>

        {plan.stop_conditions.length > 0 ? (
          <div style={{ marginTop: '8px' }}>
            <strong style={{ fontSize: '0.65rem' }}>STOP CONDITIONS</strong>
            <ul>
              {plan.stop_conditions.map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReferenceMapView({ referenceMap }: { referenceMap: ReferenceMap }) {
  return (
    <div className="data-grid">
      <ListPanel title="CONCEPTS" values={referenceMap.concepts_triggered} />
      <ListPanel title="METHODOLOGIES" values={referenceMap.sonic_methodologies} />
      <ListPanel title="TRADITIONS" values={referenceMap.authors_or_traditions} />
      <ListPanel title="ROUTES" values={referenceMap.possible_research_routes} />
      <ListPanel title="QUESTIONS" values={referenceMap.research_questions} />
      <ListPanel title="CAUTIONS" values={referenceMap.cautions} />
      <ListPanel title="ADJACENT" values={referenceMap.adjacent_modes} />
    </div>
  );
}

function MediationRiskSummary({ outputs, commandRisks }: { outputs: ModeOutput[]; commandRisks: string[] }) {
  const mediations = aggregateMediations(outputs);
  const risks = aggregateRisks(outputs, commandRisks);

  return (
    <div className="data-grid">
      <ListPanel title="TECHNICAL MEDIATIONS" values={mediations.technical} />
      <ListPanel title="CULTURAL MEDIATIONS" values={mediations.cultural} />
      <ListPanel title="SPATIAL MEDIATIONS" values={mediations.spatial} />
      <ListPanel title="BODILY MEDIATIONS" values={mediations.bodily} />
      <ListPanel title="ARCHIVAL MEDIATIONS" values={mediations.archival} />
      <ListPanel title="COMPUTATIONAL MEDIATIONS" values={mediations.computational} />
      <ListPanel title="RISKS DETECTED" values={risks} isWarning />
    </div>
  );
}

function ClaimSummary({ claims }: { claims: ClaimTaxonomy }) {
  return (
    <div className="data-grid">
      {claimCategories.map((category) => (
        <ClaimBucket category={category} claims={claims[category]} key={category} />
      ))}
    </div>
  );
}

function ClaimBucket({ category, claims }: { category: ClaimCategory; claims: Claim[] }) {
  return (
    <article className="data-panel">
      <header className="data-panel-header">{category.toUpperCase()}</header>
      <div className="data-panel-content">
        {claims.length > 0 ? (
          <div className="claim-list">
            {claims.map((claim, index) => (
              <div className="claim-item" key={`${claim.statement}-${index}`}>
                <span className="claim-text">{claim.statement}</span>
                <div className="claim-meta">
                  <span>{claim.basis || 'NO BASIS PROVIDED'}</span>
                  <div>
                    <span className={`conf-${claim.confidence}`}>{claim.confidence.toUpperCase()}</span>
                    <span className="conf-bar"><span className={`conf-bar-fill ${claim.confidence}`} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>NO CLAIMS</span>
        )}
      </div>
    </article>
  );
}

function ModeOutputCard({ output }: { output: ModeOutput }) {
  return (
    <article className="mode-output-card">
      <span className="fui-subtitle" style={{ color: 'var(--fui-cyan)' }}>{output.listening_mode}</span>
      <p style={{ marginTop: '10px' }}>{output.main_reading}</p>
      <dl>
        <dt>APPEARS</dt>
        <dd>{formatList(output.what_appears)}</dd>
        <dt>HIDDEN</dt>
        <dd>{formatList(output.what_remains_hidden)}</dd>
        <dt>ALTERNATIVE</dt>
        <dd>{output.alternative_reading}</dd>
        <dt>NEXT REC</dt>
        <dd>{output.recommended_next_mode}</dd>
      </dl>
    </article>
  );
}

function ListPanel({ title, values, isWarning }: { title: string; values: string[], isWarning?: boolean }) {
  return (
    <article className="data-panel" style={isWarning ? { borderColor: 'var(--fui-red)' } : {}}>
      <header className="data-panel-header" style={isWarning ? { color: 'var(--fui-red)', background: 'rgba(255,42,42,0.05)' } : {}}>
        {title}
      </header>
      <div className="data-panel-content">
        {values.length > 0 ? (
          <ul className="bullet-list">
            {values.map((value, index) => (
              <li key={`${value}-${index}`} style={isWarning ? { color: 'var(--text-main)' } : {}}>{value}</li>
            ))}
          </ul>
        ) : (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>NULL</span>
        )}
      </div>
    </article>
  );
}

// Helpers
function aggregateMediations(outputs: ModeOutput[]): Mediations {
  return {
    technical: unique(outputs.flatMap((o) => o.mediations.technical)),
    cultural: unique(outputs.flatMap((o) => o.mediations.cultural)),
    spatial: unique(outputs.flatMap((o) => o.mediations.spatial)),
    bodily: unique(outputs.flatMap((o) => o.mediations.bodily)),
    archival: unique(outputs.flatMap((o) => o.mediations.archival)),
    computational: unique(outputs.flatMap((o) => o.mediations.computational)),
  };
}

function aggregateRisks(outputs: ModeOutput[], commandRisks: string[]): string[] {
  return unique([...commandRisks, ...outputs.flatMap((o) => flattenRisks(o.risks))]);
}

function flattenRisks(risks: Risks): string[] {
  return [
    ...risks.hallucination,
    ...risks.over_identification,
    ...risks.cultural_flattening,
    ...risks.forensic_overreach,
    ...risks.source_confusion,
    ...risks.aesthetic_overstatement,
  ];
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join(' // ') : 'NULL';
}

function isComparativeResult(result: CommandResult): result is ComparativeListeningOutput {
  return result.command === '/one-sound-many-ears';
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
