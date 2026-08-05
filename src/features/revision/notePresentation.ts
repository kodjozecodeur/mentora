import type { RevisionNote } from '@/services/revision-notes/types';

export function stripInlineMarkdown(value: string): string {
  return value.replace(/\*\*/g, '').replace(/`([^`]+)`/g, '$1');
}

export function getUnderstandingContent(note: RevisionNote): string {
  const section = note.sections.find((candidate) => candidate.id === 'comprendre-simplement');
  return section ? stripInlineMarkdown(section.content) : '';
}

/** Raw (un-stripped) paragraphs of "Comprendre simplement", used to split explanation vs. bubble copy. */
export function getUnderstandingParagraphs(note: RevisionNote): string[] {
  const section = note.sections.find((candidate) => candidate.id === 'comprendre-simplement');
  if (!section) return [];
  return section.content
    .split(/\n\s*\n/)
    .map((paragraph) => stripInlineMarkdown(paragraph).trim())
    .filter(Boolean);
}

export function getNoteSummary(note: RevisionNote): string {
  return getUnderstandingContent(note).split(/\n\s*\n/)[0] ?? '';
}

/** All backtick-delimited math expressions in a source line, in order. */
export function extractMathExpressions(value: string): string[] {
  return [...value.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
}

/**
 * Splits a worked-example step (e.g. "**Étape 1 :** Distribuer 3 ... : `3(2x - 1) = 6x - 3`.")
 * into its prose explanation and the trailing math result to render via KaTeX.
 */
export function splitStepContent(step: string): { explanation: string; expression: string | null } {
  const expressions = extractMathExpressions(step);
  const expression = expressions.length > 0 ? expressions[expressions.length - 1] : null;
  const withoutExpression = expression ? step.replace(`\`${expression}\``, '') : step;
  const explanation = stripInlineMarkdown(withoutExpression)
    .replace(/[\s:]+\.?\s*$/, '')
    .trim();
  return { explanation, expression };
}
