import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RevisionPlan } from '@/types/revision';
import { clearRevisionPlan, loadRevisionPlan, saveRevisionPlan } from './storage';

function stubLocalStorage() {
  const store = new Map<string, string>();
  const stub = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  };
  vi.stubGlobal('localStorage', stub);
  return stub;
}

const plan: RevisionPlan = {
  id: 'plan-1',
  diagnosticId: 'diagnostic-1',
  generatedAt: '2026-08-04T10:00:00.000Z',
  algorithmVersion: 'revision-plan.v1',
  contentVersion: '1.0.0',
  estimatedTotalMinutes: 0,
  estimatedDays: 0,
  sessions: [],
};

afterEach(() => vi.unstubAllGlobals());

describe('revision plan storage', () => {
  it('round-trips a plan through localStorage', () => {
    stubLocalStorage();
    saveRevisionPlan(plan);
    expect(loadRevisionPlan()).toEqual(plan);
  });

  it('returns null for corrupted or invalid data', () => {
    const storage = stubLocalStorage();
    storage.setItem('mentora.revision-plan.bepc-mathematiques.v2', '{bad json');
    expect(loadRevisionPlan()).toBeNull();

    storage.setItem(
      'mentora.revision-plan.bepc-mathematiques.v2',
      JSON.stringify({ sessions: [] }),
    );
    expect(loadRevisionPlan()).toBeNull();
  });

  it('defaults validationAttempts to an empty array for sessions persisted before it existed', () => {
    const storage = stubLocalStorage();
    storage.setItem(
      'mentora.revision-plan.bepc-mathematiques.v2',
      JSON.stringify({
        ...plan,
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
            exitCriteria: [],
            status: 'not-started',
          },
        ],
      }),
    );

    expect(loadRevisionPlan()?.sessions[0].validationAttempts).toEqual([]);
  });

  it('clears the current plan', () => {
    stubLocalStorage();
    saveRevisionPlan(plan);
    clearRevisionPlan();
    expect(loadRevisionPlan()).toBeNull();
  });
});
