import { describe, expect, it } from 'vitest';
import { selectChapterQuestions } from './chapterScope';
import type { DiagnosticQuestion } from '@/types/diagnostic';

function makeQuestion(id: string, chapterId: string): DiagnosticQuestion {
  return {
    id,
    chapterId,
    competencyId: 'some-competency',
    competencyLabel: 'Some competency',
    instruction: 'Instruction',
    content: 'Content',
    contentFormat: 'text',
    type: 'single-choice',
    options: [{ id: `${id}-a`, content: 'A', contentFormat: 'text' }],
    correctOptionId: `${id}-a`,
    points: 1,
    difficulty: 'easy',
    explanation: 'Explanation',
    revisionExample: 'Example',
  };
}

describe('selectChapterQuestions', () => {
  const questions = [
    makeQuestion('q1', 'polynomes-second-degre'),
    makeQuestion('q2', 'polynomes-second-degre'),
    makeQuestion('q3', 'thales'),
  ];

  it('returns only the questions tagged with the requested chapter', () => {
    expect(selectChapterQuestions(questions, 'polynomes-second-degre').map((q) => q.id)).toEqual([
      'q1',
      'q2',
    ]);
  });

  it('returns an empty list when no chapter is selected', () => {
    expect(selectChapterQuestions(questions, null)).toEqual([]);
  });

  it('returns an empty list when no question matches the requested chapter', () => {
    expect(selectChapterQuestions(questions, 'unknown-chapter')).toEqual([]);
  });
});
