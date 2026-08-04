import { describe, expect, it } from 'vitest';
import {
  getGreeting,
  getMasteryStatusLabel,
  getReadinessLevelLabel,
  getReadinessMessage,
  getWeaknessBadgeLabel,
  partitionByReadinessLevel,
  PREPARATION_BEPC_LABEL,
  PROGRESSION_GLOBALE_LABEL,
} from './resultCopy';
import type { CompetencyMastery } from '@/types/diagnostic';

describe('getGreeting', () => {
  it('includes the trimmed first name when present', () => {
    expect(getGreeting('Awa', 70)).toBe('Bravo Awa !');
    expect(getGreeting('  Awa  ', 70)).toBe('Bravo Awa !');
  });

  it('falls back to a plain greeting when no usable name is given', () => {
    expect(getGreeting(undefined, 70)).toBe('Bravo !');
    expect(getGreeting('', 70)).toBe('Bravo !');
    expect(getGreeting('   ', 70)).toBe('Bravo !');
  });

  it('matches the greeting to the readiness score', () => {
    expect(getGreeting('Awa', 39)).toBe('Courage Awa !');
    expect(getGreeting('Awa', 69)).toBe('Tu es en progression, Awa !');
    expect(getGreeting('Awa', 70)).toBe('Bravo Awa !');
  });
});

describe('getReadinessMessage', () => {
  it('returns the low-score message for 0-39', () => {
    expect(getReadinessMessage(0)).toBe('Tu as encore plusieurs notions importantes à renforcer.');
    expect(getReadinessMessage(39)).toBe('Tu as encore plusieurs notions importantes à renforcer.');
  });

  it('returns the mid-score message for 40-69', () => {
    expect(getReadinessMessage(40)).toBe(
      'Tu progresses bien, mais certaines notions doivent encore être consolidées.',
    );
    expect(getReadinessMessage(69)).toBe(
      'Tu progresses bien, mais certaines notions doivent encore être consolidées.',
    );
  });

  it('returns the high-score message for 70-100', () => {
    expect(getReadinessMessage(70)).toBe(
      'Tu maîtrises déjà une bonne partie des compétences évaluées.',
    );
    expect(getReadinessMessage(100)).toBe(
      'Tu maîtrises déjà une bonne partie des compétences évaluées.',
    );
  });
});

describe('getReadinessLevelLabel', () => {
  it('labels 0-39 as needing reinforcement', () => {
    expect(getReadinessLevelLabel(0)).toBe('À renforcer');
    expect(getReadinessLevelLabel(39)).toBe('À renforcer');
  });

  it('labels 40-69 as in progress', () => {
    expect(getReadinessLevelLabel(40)).toBe('En progression');
    expect(getReadinessLevelLabel(69)).toBe('En progression');
  });

  it('labels 70-100 as optimal', () => {
    expect(getReadinessLevelLabel(70)).toBe('Optimal');
    expect(getReadinessLevelLabel(100)).toBe('Optimal');
  });
});

describe('getWeaknessBadgeLabel', () => {
  it('labels a priority competency', () => {
    expect(getWeaknessBadgeLabel('priority')).toBe('Prioritaire');
  });

  it('labels an in-progress competency', () => {
    expect(getWeaknessBadgeLabel('in-progress')).toBe('En progression');
  });
});

function mastery(overrides: Partial<CompetencyMastery>): CompetencyMastery {
  return {
    competencyId: 'c1',
    competencyLabel: 'Compétence',
    pointsEarned: 0,
    pointsPossible: 10,
    masteryPercent: 0,
    readinessLevel: 'priority',
    ...overrides,
  };
}

describe('partitionByReadinessLevel', () => {
  it('splits competencies into mastered, in-progress and priority buckets', () => {
    const input = [
      mastery({ competencyId: 'a', readinessLevel: 'mastered', masteryPercent: 80 }),
      mastery({ competencyId: 'b', readinessLevel: 'in-progress', masteryPercent: 50 }),
      mastery({ competencyId: 'c', readinessLevel: 'priority', masteryPercent: 20 }),
    ];

    const result = partitionByReadinessLevel(input);

    expect(result.mastered.map((m) => m.competencyId)).toEqual(['a']);
    expect(result.inProgress.map((m) => m.competencyId)).toEqual(['b']);
    expect(result.priority.map((m) => m.competencyId)).toEqual(['c']);
  });

  it('orders mastered competencies strongest-first', () => {
    const input = [
      mastery({ competencyId: 'a', readinessLevel: 'mastered', masteryPercent: 75 }),
      mastery({ competencyId: 'b', readinessLevel: 'mastered', masteryPercent: 95 }),
    ];

    expect(partitionByReadinessLevel(input).mastered.map((m) => m.competencyId)).toEqual([
      'b',
      'a',
    ]);
  });

  it('orders in-progress and priority competencies weakest-first', () => {
    const input = [
      mastery({ competencyId: 'a', readinessLevel: 'priority', masteryPercent: 30 }),
      mastery({ competencyId: 'b', readinessLevel: 'priority', masteryPercent: 10 }),
    ];

    expect(partitionByReadinessLevel(input).priority.map((m) => m.competencyId)).toEqual([
      'b',
      'a',
    ]);
  });
});

describe('getMasteryStatusLabel', () => {
  it('labels each readiness level', () => {
    expect(getMasteryStatusLabel('mastered')).toBe('Maîtrisé');
    expect(getMasteryStatusLabel('in-progress')).toBe('En apprentissage');
    expect(getMasteryStatusLabel('priority')).toBe('À renforcer');
  });
});

describe('progression labels', () => {
  it('exposes the repositioned score labels', () => {
    expect(PROGRESSION_GLOBALE_LABEL).toBe('Progression globale');
    expect(PREPARATION_BEPC_LABEL).toBe('Préparation au BEPC');
  });
});
