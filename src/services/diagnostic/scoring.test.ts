import { describe, expect, it } from 'vitest';
import { computeCompetencyMastery, computeReadinessScore } from './scoring';
import type { CompetencyMastery, DiagnosticQuestion, DiagnosticResponse } from '@/types/diagnostic';

const question = (
  id: string,
  competencyId: string,
  competencyLabel: string,
  points: number,
): DiagnosticQuestion => ({
  id,
  competencyId,
  competencyLabel,
  instruction: 'Résous',
  content: 'x',
  contentFormat: 'latex',
  type: 'single-choice',
  options: [{ id: `${id}-a`, content: 'x', contentFormat: 'latex' }],
  correctOptionId: `${id}-a`,
  points,
  difficulty: 'easy',
  explanation: '...',
  revisionExample: '...',
});

const response = (
  questionId: string,
  competencyId: string,
  isCorrect: boolean,
  points: number,
): DiagnosticResponse => ({
  questionId,
  competencyId,
  optionId: `${questionId}-a`,
  isCorrect,
  points,
});

describe('computeCompetencyMastery', () => {
  it('sums earned/possible points per competency and computes mastery percent', () => {
    const questions: DiagnosticQuestion[] = [
      question('q1', 'calcul-litteral', 'Calcul littéral', 1),
      question('q2', 'calcul-litteral', 'Calcul littéral', 1),
      question('q3', 'equations', 'Équations', 1),
    ];
    const responses: DiagnosticResponse[] = [
      response('q1', 'calcul-litteral', true, 1),
      response('q2', 'calcul-litteral', false, 0),
      response('q3', 'equations', true, 1),
    ];

    const result = computeCompetencyMastery(questions, responses);

    expect(result).toEqual([
      {
        competencyId: 'calcul-litteral',
        competencyLabel: 'Calcul littéral',
        pointsEarned: 1,
        pointsPossible: 2,
        masteryPercent: 50,
        readinessLevel: 'in-progress',
      },
      {
        competencyId: 'equations',
        competencyLabel: 'Équations',
        pointsEarned: 1,
        pointsPossible: 1,
        masteryPercent: 100,
        readinessLevel: 'mastered',
      },
    ]);
  });
});

describe('computeReadinessScore', () => {
  it('weights the overall percent by points possible per competency, not a plain average of percentages', () => {
    const mastery: CompetencyMastery[] = [
      {
        competencyId: 'calcul-litteral',
        competencyLabel: 'Calcul littéral',
        pointsEarned: 1,
        pointsPossible: 10,
        masteryPercent: 10,
        readinessLevel: 'priority',
      },
      {
        competencyId: 'equations',
        competencyLabel: 'Équations',
        pointsEarned: 1,
        pointsPossible: 1,
        masteryPercent: 100,
        readinessLevel: 'mastered',
      },
    ];

    // Plain average of percentages would be (10+100)/2 = 55.
    // Weighted by points: (1+1)/(10+1) = 18.18... -> rounds to 18.
    expect(computeReadinessScore(mastery)).toBe(18);
  });

  it('returns 0 for an empty mastery list', () => {
    expect(computeReadinessScore([])).toBe(0);
  });
});
