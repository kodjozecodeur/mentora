import { describe, expect, it } from 'vitest';
import { rankRevisionPriorities } from './recommendations';
import type { CompetencyMastery } from '@/types/diagnostic';

const mastery = (
  competencyId: string,
  masteryPercent: number,
  readinessLevel: CompetencyMastery['readinessLevel'],
): CompetencyMastery => ({
  competencyId,
  competencyLabel: competencyId,
  pointsEarned: 0,
  pointsPossible: 1,
  masteryPercent,
  readinessLevel,
});

describe('rankRevisionPriorities', () => {
  it('orders weak competencies weakest-first and excludes mastered ones', () => {
    const input = [
      mastery('statistiques', 60, 'in-progress'),
      mastery('theoreme-thales', 20, 'priority'),
      mastery('calcul-litteral', 100, 'mastered'),
      mastery('equations', 40, 'in-progress'),
    ];

    const result = rankRevisionPriorities(input);

    expect(result.map((m) => m.competencyId)).toEqual([
      'theoreme-thales',
      'equations',
      'statistiques',
    ]);
  });

  it('breaks ties on mastery percent by competencyId for determinism', () => {
    const input = [
      mastery('theoreme-thales', 30, 'priority'),
      mastery('equations', 30, 'priority'),
    ];

    const result = rankRevisionPriorities(input);

    expect(result.map((m) => m.competencyId)).toEqual(['equations', 'theoreme-thales']);
  });
});
