import type { ListeningRequest } from './types';

function normalizeForTermMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function hasAnyTerm(value: string, terms: string[]): boolean {
  const normalized = ` ${normalizeForTermMatch(value)} `;
  if (normalized.trim().length === 0) return false;

  return terms.some((term) => {
    const variants = termVariants(normalizeForTermMatch(term));
    return variants.some((variant) => normalized.includes(` ${variant} `));
  });
}

export function hasAnyRequestTerm(request: ListeningRequest, terms: string[], includeRoutingFields = false): boolean {
  const routingText = includeRoutingFields ? ` ${request.inputType} ${request.command ?? ''}` : '';
  return hasAnyTerm(`${request.prompt ?? ''} ${request.objectName}${routingText}`, terms);
}

function termVariants(normalizedTerm: string): string[] {
  if (normalizedTerm.length === 0) return [];
  const variants = new Set([normalizedTerm]);
  const words = normalizedTerm.split(' ');
  const last = words.at(-1);

  if (last && /^[a-z]+$/.test(last) && last.length > 2) {
    const pluralWords = [...words];
    pluralWords[pluralWords.length - 1] = pluralize(last);
    variants.add(pluralWords.join(' '));
  }

  return Array.from(variants);
}

function pluralize(word: string): string {
  if (word.endsWith('s')) return word;
  if (word.endsWith('y') && !/[aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (word.endsWith('ch') || word.endsWith('sh') || word.endsWith('x') || word.endsWith('z')) return `${word}es`;
  return `${word}s`;
}
