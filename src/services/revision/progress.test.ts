import { describe, expect, it } from 'vitest';
import type { RevisionPlan } from '@/types/revision';
import { updateRevisionSessionStatus } from './progress';

const plan: RevisionPlan = {
  id: 'plan-1',
  diagnosticId: 'diagnostic-1',
  generatedAt: '2026-08-04T10:00:00.000Z',
  algorithmVersion: 'revision-plan.v1',
  contentVersion: '1.0.0',
  estimatedTotalMinutes: 20,
  estimatedDays: 1,
  sessions: [
    {
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
    },
  ],
};

describe('updateRevisionSessionStatus', () => {
  it('updates a session by revisionUnitId without mutating the plan', () => {
    const updated = updateRevisionSessionStatus(
      plan,
      'revision-unit:calcul-litteral',
      'in-progress',
    );

    expect(updated.sessions[0].status).toBe('in-progress');
    expect(plan.sessions[0].status).toBe('not-started');
    expect(updated).not.toBe(plan);
    expect(updated.sessions).not.toBe(plan.sessions);
  });

  it('throws when the revision unit is not part of the plan', () => {
    expect(() => updateRevisionSessionStatus(plan, 'missing-unit', 'completed')).toThrow(
      'Aucune session trouvée pour l’unité de révision « missing-unit »',
    );
  });
});
