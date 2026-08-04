import { describe, expect, it } from 'vitest';
import type { RevisionNote } from '@/services/revision-notes/types';
import { getNoteSummary, getUnderstandingContent, stripInlineMarkdown } from './notePresentation';

const note: RevisionNote = {
  id: 'equations',
  competencyId: 'equations',
  title: 'Équations',
  subject: 'Mathématiques',
  exam: 'BEPC',
  curriculumVersion: '2026',
  contentVersion: '1.0.0',
  teacherValidated: false,
  estimatedReadingMinutes: 5,
  difficulty: 'beginner',
  updatedAt: '2026-08-04',
  sections: [
    {
      id: 'comprendre-simplement',
      title: 'Comprendre simplement',
      order: 1,
      content: 'Une **équation** contient une inconnue.\n\nOn isole `x`.',
    },
  ],
  workedExample: { title: 'Exemple', problem: 'p', steps: [], conclusion: 'c' },
  commonMistakes: [],
  keyTakeaways: [],
  miniExercises: [],
};

describe('revision note presentation helpers', () => {
  it('removes Markdown markers before display', () => {
    expect(stripInlineMarkdown('Une **équation** contient `x`.')).toBe('Une équation contient x.');
  });

  it('selects the parsed understanding section and creates a short summary', () => {
    expect(getUnderstandingContent(note)).toBe(
      'Une équation contient une inconnue.\n\nOn isole x.',
    );
    expect(getNoteSummary(note)).toBe('Une équation contient une inconnue.');
  });
});
