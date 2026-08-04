import { describe, expect, it } from 'vitest';
import { buildDiagnosticComparison } from './comparison';
import type { CompetencyMastery, DiagnosticResult } from '@/types/diagnostic';

function mastery(
  competencyId: string,
  masteryPercent: number,
  overrides: Partial<CompetencyMastery> = {},
): CompetencyMastery {
  return {
    competencyId,
    competencyLabel: competencyId,
    pointsEarned: masteryPercent,
    pointsPossible: 100,
    masteryPercent,
    readinessLevel: masteryPercent >= 70 ? 'mastered' : 'priority',
    ...overrides,
  };
}

function result(overrides: Partial<DiagnosticResult>): DiagnosticResult {
  return {
    responses: [],
    competencyMastery: [],
    readinessScore: 0,
    readinessLevel: 'priority',
    strengths: [],
    weaknesses: [],
    revisionPriorities: [],
    totalEarnedPoints: 0,
    totalMaxPoints: 0,
    completedAt: new Date().toISOString(),
    phase: 'initial',
    ...overrides,
  };
}

describe('buildDiagnosticComparison', () => {
  it('joins initial and final results by competencyId and computes deltas', () => {
    const initial = result({
      competencyMastery: [mastery('equations', 40), mastery('calcul-litteral', 60)],
      readinessScore: 50,
      readinessLevel: 'in-progress',
      phase: 'initial',
    });
    const final = result({
      competencyMastery: [mastery('equations', 80), mastery('calcul-litteral', 55)],
      readinessScore: 68,
      readinessLevel: 'in-progress',
      phase: 'final',
    });

    const comparison = buildDiagnosticComparison(initial, final);

    expect(comparison.rows).toEqual([
      {
        competencyId: 'equations',
        competencyLabel: 'equations',
        masteryBefore: 40,
        masteryAfter: 80,
        delta: 40,
      },
      {
        competencyId: 'calcul-litteral',
        competencyLabel: 'calcul-litteral',
        masteryBefore: 60,
        masteryAfter: 55,
        delta: -5,
      },
    ]);
    expect(comparison.readinessScoreBefore).toBe(50);
    expect(comparison.readinessScoreAfter).toBe(68);
    expect(comparison.readinessScoreDelta).toBe(18);
    expect(comparison.readinessLevelBefore).toBe('in-progress');
    expect(comparison.readinessLevelAfter).toBe('in-progress');
  });

  it('drops competencies missing from the final result rather than crashing', () => {
    const initial = result({
      competencyMastery: [mastery('equations', 40), mastery('geometrie', 30)],
    });
    const final = result({
      competencyMastery: [mastery('equations', 90)],
    });

    const comparison = buildDiagnosticComparison(initial, final);

    expect(comparison.rows.map((row) => row.competencyId)).toEqual(['equations']);
  });
});
