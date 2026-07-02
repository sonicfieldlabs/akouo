import { claimCategories } from '../akouo/types';
import { BracketWrap } from './FuiDecorations';

export function ClaimTaxonomyView() {
  return (
    <BracketWrap title="DATA.TAXONOMY">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {claimCategories.map((category) => (
          <article className="data-panel" key={category}>
            <header className="data-panel-header">{category.toUpperCase()}</header>
            <div className="data-panel-content">
              <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{descriptions[category]}</p>
            </div>
          </article>
        ))}
      </div>
    </BracketWrap>
  );
}

const descriptions = {
  heard: 'Directly present in audio/prompt/transcript.',
  measured: 'Produced by signal or adapter inspection.',
  inferred: 'Plausible but not directly confirmed.',
  interpreted: 'Cultural/theoretical reading.',
  speculative: 'Fictional/mythic possible-world reading.',
  undetermined: 'Cannot be responsibly claimed.',
};
