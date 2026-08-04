import { describe, expect, it } from 'vitest';
import { runDiagnosticEngine } from './engine';
import type { DiagnosticQuestion, DiagnosticResponse } from '@/types/diagnostic';

const question = (
  id: string,
  competencyId: string,
  competencyLabel: string,
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
  points: 1,
  difficulty: 'easy',
  explanation: `explication ${id}`,
  revisionExample: `exemple ${id}`,
});

const response = (
  questionId: string,
  competencyId: string,
  isCorrect: boolean,
): DiagnosticResponse => ({
  questionId,
  competencyId,
  optionId: `${questionId}-a`,
  isCorrect,
  points: isCorrect ? 1 : 0,
});

describe('runDiagnosticEngine', () => {
  it('produces a structured result: mastery, readiness, strengths, weaknesses, ranked revision priorities', () => {
    const questions: DiagnosticQuestion[] = [
      question('q1', 'calcul-litteral', 'Calcul littéral'),
      question('q2', 'calcul-litteral', 'Calcul littéral'),
      question('q3', 'equations', 'Équations'),
    ];
    const responses: DiagnosticResponse[] = [
      response('q1', 'calcul-litteral', true),
      response('q2', 'calcul-litteral', false),
      response('q3', 'equations', true),
    ];

    const result = runDiagnosticEngine(questions, responses);

    expect(result.readinessScore).toBe(67); // round(2/3 * 100)
    expect(result.readinessLevel).toBe('in-progress');

    expect(result.strengths.map((s) => s.competencyId)).toEqual(['equations']);
    expect(result.weaknesses.map((w) => w.competencyId)).toEqual(['calcul-litteral']);

    // Weakest first (spec §13), enriched with the explanation/example from the missed question.
    expect(result.revisionPriorities).toEqual([
      {
        competencyId: 'calcul-litteral',
        competencyLabel: 'Calcul littéral',
        masteryPercent: 50,
        readinessLevel: 'in-progress',
        explanation: 'explication q2',
        revisionExample: 'exemple q2',
      },
    ]);

    expect(result.totalEarnedPoints).toBe(2); // q1 correct (1pt) + q3 correct (1pt)
    expect(result.totalMaxPoints).toBe(3); // 3 questions, 1 point each

    expect(result.responses).toEqual(responses);
    expect(typeof result.completedAt).toBe('string');
    expect(Number.isNaN(Date.parse(result.completedAt))).toBe(false);
  });

  it('defaults to the initial phase and accepts an explicit final phase', () => {
    const questions: DiagnosticQuestion[] = [question('q1', 'equations', 'Équations')];
    const responses: DiagnosticResponse[] = [response('q1', 'equations', true)];

    expect(runDiagnosticEngine(questions, responses).phase).toBe('initial');
    expect(runDiagnosticEngine(questions, responses, 'final').phase).toBe('final');
  });
});
