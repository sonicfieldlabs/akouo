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

const negators = new Set(['no', 'not', 'without', 'absent', 'absence', 'lacks', 'lacking', 'neither', 'nor', 'none', 'never']);
const clauseTurns = new Set(['and', 'but', 'while', 'though', 'yet']);

// Drop the words a negator governs: up to four, or to the next clause, and a list's last item
// after "or" ("no speech, music or event" leaves nothing). Shared with akouo_contract.router.
export function stripNegated(value: string): string {
  const out: string[] = [];
  let skip = 0; // words the last negator still governs
  let tail = false; // the governed words just ended; the list may go on with "or"
  let afterOr = false;
  for (const word of normalizeForTermMatch(value).split(' ')) {
    if (!word) continue;
    if (negators.has(word)) {
      skip = 4;
      tail = false;
      continue;
    }
    if (skip > 0) {
      skip -= 1;
      if (clauseTurns.has(word)) {
        skip = 0;
        tail = false;
        out.push(word);
        continue;
      }
      tail = skip === 0;
      afterOr = word === 'or';
      continue;
    }
    if (tail) {
      if (afterOr) {
        // The governed words ended on "or": this is the list's last item.
        afterOr = false;
        tail = false;
        continue;
      }
      if (word === 'or') {
        afterOr = true;
        continue;
      }
      tail = false;
    }
    out.push(word);
  }
  return out.join(' ');
}

// A text that negates everything it names: it has a negator, and none of `terms` is left once
// the negated words are dropped.
export function namesOnlyAbsences(value: string, terms: string[]): boolean {
  const words = normalizeForTermMatch(value).split(' ');
  if (!words.some((word) => negators.has(word))) return false;
  return !hasAnyTerm(stripNegated(value), terms);
}
