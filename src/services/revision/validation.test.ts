import { describe, expect, it } from 'vitest';
import type { DiagnosticQuestion } from '@/types/diagnostic';
import type { ValidationResponse } from '@/types/revision';
import {
  createValidationAttempt,
  getValidationQuestions,
  scoreValidationResponses,
} from './validation';

const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: 'equations-01',
    competencyId: 'equations',
    competencyLabel: 'Équations',
    instruction: "Résous l'équation",
    content: '2x+5=11',
    contentFormat: 'latex',
    type: 'single-choice',
    options: [
      { id: 'equations-01-a', content: 'x=8', contentFormat: 'latex' },
      { id: 'equations-01-c', content: 'x=3', contentFormat: 'latex' },
    ],
    correctOptionId: 'equations-01-c',
    points: 1,
    difficulty: 'easy',
    explanation: 'On isole x : 2x=6 donc x=3.',
    revisionExample: 'Exemple : 3x-2=10 -> x=4.',
  },
  {
    id: 'calcul-litteral-01',
    competencyId: 'calcul-litteral',
    competencyLabel: 'Calcul littéral',
    instruction: 'Développe et réduis',
    content: '3(2x-1)-4(x+2)',
    contentFormat: 'latex',
    type: 'single-choice',
    options: [{ id: 'calcul-litteral-01-a', content: '2x-11', contentFormat: 'latex' }],
    correctOptionId: 'calcul-litteral-01-a',
    points: 1,
    difficulty: 'easy',
    explanation: 'On distribue puis on réduit.',
    revisionExample: 'Exemple : 2(x+1)-3(x-2) = -x+8.',
  },
];

describe('getValidationQuestions', () => {
  it('scopes the question bank to exactly one competency', () => {
    const questions = getValidationQuestions('equations', diagnosticQuestions);

    expect(questions).toHaveLength(1);
    expect(questions[0]).toMatchObject({
      id: 'equations-01',
      competencyId: 'equations',
      correctOptionId: 'equations-01-c',
      correction: 'On isole x : 2x=6 donc x=3.',
    });
  });

  it('returns an empty bank for a competency with no questions', () => {
    expect(getValidationQuestions('theoreme-pythagore', diagnosticQuestions)).toEqual([]);
  });
});

describe('scoreValidationResponses', () => {
  it('passes at exactly the 70% threshold', () => {
    const responses: ValidationResponse[] = [
      { questionId: 'q1', optionId: 'a', isCorrect: true },
      { questionId: 'q2', optionId: 'a', isCorrect: true },
      { questionId: 'q3', optionId: 'a', isCorrect: true },
      { questionId: 'q4', optionId: 'a', isCorrect: false },
      { questionId: 'q5', optionId: 'a', isCorrect: false },
      { questionId: 'q6', optionId: 'a', isCorrect: false },
      { questionId: 'q7', optionId: 'a', isCorrect: true },
      { questionId: 'q8', optionId: 'a', isCorrect: true },
      { questionId: 'q9', optionId: 'a', isCorrect: true },
      { questionId: 'q10', optionId: 'a', isCorrect: true },
    ];

    expect(scoreValidationResponses(responses)).toEqual({ scorePercent: 70, passed: true });
  });

  it('fails just below the threshold', () => {
    const responses: ValidationResponse[] = [
      { questionId: 'q1', optionId: 'a', isCorrect: true },
      { questionId: 'q2', optionId: 'a', isCorrect: false },
    ];

    expect(scoreValidationResponses(responses)).toEqual({ scorePercent: 50, passed: false });
  });

  it('treats a zero-question attempt as a fail rather than dividing by zero', () => {
    expect(scoreValidationResponses([])).toEqual({ scorePercent: 0, passed: false });
  });
});

describe('createValidationAttempt', () => {
  it('numbers the attempt from the session history and stamps the score', () => {
    const session = {
      id: 'session-1',
      competencyId: 'equations',
      revisionUnitId: 'revision-unit:equations',
      validationAttempts: [],
    };
    const responses: ValidationResponse[] = [{ questionId: 'q1', optionId: 'a', isCorrect: true }];

    const result = createValidationAttempt(session, responses, {
      startedAt: '2026-08-04T10:00:00.000Z',
      completedAt: '2026-08-04T10:05:00.000Z',
    });

    expect(result).toMatchObject({
      id: 'validation-attempt:session-1:1',
      competencyId: 'equations',
      revisionUnitId: 'revision-unit:equations',
      attemptNumber: 1,
      scorePercent: 100,
      passed: true,
    });
  });

  it('increments the attempt number for a retry', () => {
    const session = {
      id: 'session-1',
      competencyId: 'equations',
      revisionUnitId: 'revision-unit:equations',
      validationAttempts: [
        {
          id: 'validation-attempt:session-1:1',
          competencyId: 'equations',
          revisionUnitId: 'revision-unit:equations',
          attemptNumber: 1,
          responses: [],
          scorePercent: 0,
          passed: false,
          startedAt: '2026-08-04T09:00:00.000Z',
          completedAt: '2026-08-04T09:05:00.000Z',
        },
      ],
    };

    const result = createValidationAttempt(session, [], {
      startedAt: '2026-08-04T10:00:00.000Z',
      completedAt: '2026-08-04T10:05:00.000Z',
    });

    expect(result.attemptNumber).toBe(2);
    expect(result.id).toBe('validation-attempt:session-1:2');
  });
});
