import { describe, expect, it } from 'vitest';
import type { RevisionPlan, RevisionSession } from '@/types/revision';
import { getRevisionTimeline } from './timeline';

function session(overrides: Partial<RevisionSession>): RevisionSession {
  return {
    id: 'session-1',
    dayNumber: 1,
    order: 1,
    competencyId: 'calcul-litteral',
    competencyLabel: 'Calcul littéral',
    priorityLevel: 'critical',
    priorityReason: 'Priorité',
    estimatedMinutes: 20,
    masteryBefore: 0,
    targetMastery: 70,
    confidence: 'low',
    revisionUnitId: 'revision-unit:calcul-litteral',
    exitCriteria: [
      { type: 'consecutive-success', target: 2, description: 'Deux réussites consécutives.' },
    ],
    status: 'not-started',
    validationAttempts: [],
    ...overrides,
  };
}

function plan(sessions: RevisionSession[]): Pick<RevisionPlan, 'sessions'> {
  return { sessions };
}

describe('getRevisionTimeline', () => {
  it('buckets the first non-validated session as today', () => {
    const result = getRevisionTimeline(
      plan([
        session({ id: 's1', order: 1, dayNumber: 1, status: 'completed' }),
        session({ id: 's2', order: 2, dayNumber: 2, status: 'in-progress' }),
        session({ id: 's3', order: 3, dayNumber: 3, status: 'not-started' }),
      ]),
    );

    expect(result.map((entry) => entry.bucket)).toEqual(['week', 'today', 'tomorrow']);
  });

  it('buckets the day immediately after today as tomorrow, everything further out as this week', () => {
    const result = getRevisionTimeline(
      plan([
        session({ id: 's1', order: 1, dayNumber: 1, status: 'not-started' }),
        session({ id: 's2', order: 2, dayNumber: 2, status: 'not-started' }),
        session({ id: 's3', order: 3, dayNumber: 3, status: 'not-started' }),
        session({ id: 's4', order: 4, dayNumber: 4, status: 'not-started' }),
      ]),
    );

    expect(result.map((entry) => entry.bucket)).toEqual(['today', 'tomorrow', 'week', 'week']);
  });

  it('derives status per entry using the same locking rule as getCompetencyStatuses', () => {
    const result = getRevisionTimeline(
      plan([
        session({ id: 's1', order: 1, dayNumber: 1, status: 'completed' }),
        session({ id: 's2', order: 2, dayNumber: 2, status: 'not-started' }),
        session({ id: 's3', order: 3, dayNumber: 3, status: 'not-started' }),
      ]),
    );

    expect(result.map((entry) => entry.status)).toEqual(['validated', 'available', 'locked']);
  });

  it('sorts entries by order regardless of input order', () => {
    const result = getRevisionTimeline(
      plan([
        session({ id: 's2', order: 2, dayNumber: 2 }),
        session({ id: 's1', order: 1, dayNumber: 1 }),
      ]),
    );

    expect(result.map((entry) => entry.session.id)).toEqual(['s1', 's2']);
  });

  it('returns an empty list for a plan with no sessions', () => {
    expect(getRevisionTimeline(plan([]))).toEqual([]);
  });
});
