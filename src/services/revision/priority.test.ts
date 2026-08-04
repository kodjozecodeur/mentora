import { describe, expect, it } from 'vitest';
import { classifyRevisionPriority, getRevisionPriorityReason } from './priority';

describe('classifyRevisionPriority', () => {
  it('uses explicit score bands for deterministic priority levels', () => {
    expect(classifyRevisionPriority(39)).toBe('critical');
    expect(classifyRevisionPriority(40)).toBe('high');
    expect(classifyRevisionPriority(59)).toBe('high');
    expect(classifyRevisionPriority(60)).toBe('medium');
    expect(classifyRevisionPriority(69)).toBe('medium');
    expect(classifyRevisionPriority(70)).toBe('low');
  });

  it('clamps out-of-range mastery values before applying the bands', () => {
    expect(classifyRevisionPriority(-10)).toBe('critical');
    expect(classifyRevisionPriority(120)).toBe('low');
  });
});

describe('getRevisionPriorityReason', () => {
  it('explains the score and confidence used by the rule', () => {
    expect(getRevisionPriorityReason(35, 'critical', 'low')).toBe(
      'Maîtrise estimée à 35 % avec une confiance faible : reprendre les bases avant la pratique autonome.',
    );
  });

  it('uses an uncertainty explanation for a low-priority verification', () => {
    expect(getRevisionPriorityReason(80, 'low', 'low')).toBe(
      'Maîtrise estimée à 80 %, mais avec une confiance faible : une vérification est recommandée.',
    );
  });
});
