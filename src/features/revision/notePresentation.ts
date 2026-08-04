import type { RevisionNote } from '@/services/revision-notes/types';

export function stripInlineMarkdown(value: string): string {
  return value.replace(/\*\*/g, '').replace(/`([^`]+)`/g, '$1');
}

export function getUnderstandingContent(note: RevisionNote): string {
  const section = note.sections.find((candidate) => candidate.id === 'comprendre-simplement');
  return section ? stripInlineMarkdown(section.content) : '';
}

export function getNoteSummary(note: RevisionNote): string {
  return getUnderstandingContent(note).split(/\n\s*\n/)[0] ?? '';
}
