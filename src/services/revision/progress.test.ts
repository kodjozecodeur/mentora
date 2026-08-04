import { describe, expect, it } from 'vitest';
import type { RevisionPlan, RevisionSession, ValidationAttempt } from '@/types/revision';
import {
  getCompetencyStatuses,
  isReadyForExam,
  recordValidationAttempt,
  updateRevisionSessionStatus,
} from './progress';

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
      validationAttempts: [],
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

function sequentialSession(overrides: Partial<RevisionSession>): RevisionSession {
  return {
    id: 'session',
    dayNumber: 1,
    order: 1,
    competencyId: 'competency',
    competencyLabel: 'Compétence',
    priorityLevel: 'critical',
    priorityReason: 'Priorité',
    estimatedMinutes: 20,
    masteryBefore: 0,
    targetMastery: 70,
    confidence: 'low',
    revisionUnitId: 'revision-unit:competency',
    exitCriteria: [],
    status: 'not-started',
    validationAttempts: [],
    ...overrides,
  };
}

function attempt(overrides: Partial<ValidationAttempt>): ValidationAttempt {
  return {
    id: 'attempt-1',
    competencyId: 'competency',
    revisionUnitId: 'revision-unit:competency',
    attemptNumber: 1,
    responses: [],
    scorePercent: 0,
    passed: false,
    startedAt: '2026-08-04T10:00:00.000Z',
    completedAt: '2026-08-04T10:05:00.000Z',
    ...overrides,
  };
}

const sequentialPlan: RevisionPlan = {
  id: 'plan-1',
  diagnosticId: 'diagnostic-1',
  generatedAt: '2026-08-04T10:00:00.000Z',
  algorithmVersion: 'revision-plan.v1',
  contentVersion: '1.0.0',
  estimatedTotalMinutes: 60,
  estimatedDays: 3,
  sessions: [
    sequentialSession({
      id: 'session-1',
      order: 1,
      competencyId: 'calcul-litteral',
      revisionUnitId: 'revision-unit:calcul-litteral',
      status: 'completed',
    }),
    sequentialSession({
      id: 'session-2',
      order: 2,
      competencyId: 'equations',
      revisionUnitId: 'revision-unit:equations',
      status: 'in-progress',
    }),
    sequentialSession({
      id: 'session-3',
      order: 3,
      competencyId: 'statistiques',
      revisionUnitId: 'revision-unit:statistiques',
      status: 'not-started',
    }),
  ],
};

describe('getCompetencyStatuses', () => {
  it('derives locked/available/in-progress/validated from sequence + validation, never from stored state', () => {
    expect(getCompetencyStatuses(sequentialPlan)).toEqual(['validated', 'in-progress', 'locked']);
  });

  it('marks only the first competency as available when nothing has started', () => {
    const freshPlan: RevisionPlan = {
      ...sequentialPlan,
      sessions: sequentialPlan.sessions.map((session) => ({ ...session, status: 'not-started' })),
    };
    expect(getCompetencyStatuses(freshPlan)).toEqual(['available', 'locked', 'locked']);
  });
});

describe('isReadyForExam', () => {
  it('is false while any competency remains unvalidated', () => {
    expect(isReadyForExam(sequentialPlan)).toBe(false);
  });

  it('is true once every competency is validated', () => {
    const allValidated: RevisionPlan = {
      ...sequentialPlan,
      sessions: sequentialPlan.sessions.map((session) => ({ ...session, status: 'completed' })),
    };
    expect(isReadyForExam(allValidated)).toBe(true);
  });

  it('is vacuously true when there are no competencies to revise (edge case: all mastered)', () => {
    expect(isReadyForExam({ sessions: [] })).toBe(true);
  });
});

describe('recordValidationAttempt', () => {
  it('validates the competency and does not mutate the plan on a passing attempt', () => {
    const passingAttempt = attempt({
      revisionUnitId: 'revision-unit:equations',
      competencyId: 'equations',
      scorePercent: 100,
      passed: true,
    });

    const updated = recordValidationAttempt(
      sequentialPlan,
      'revision-unit:equations',
      passingAttempt,
    );

    expect(updated.sessions[1].status).toBe('completed');
    expect(updated.sessions[1].validationAttempts).toEqual([passingAttempt]);
    expect(sequentialPlan.sessions[1].status).toBe('in-progress');
    expect(sequentialPlan.sessions[1].validationAttempts).toEqual([]);
    // Passing unlocks the next competency; it never skips straight to validated (Decision 7).
    expect(getCompetencyStatuses(updated)).toEqual(['validated', 'validated', 'available']);
  });

  it('keeps the competency in-progress and the next one locked on a failing attempt', () => {
    const failingAttempt = attempt({
      revisionUnitId: 'revision-unit:equations',
      competencyId: 'equations',
      scorePercent: 50,
      passed: false,
    });

    const updated = recordValidationAttempt(
      sequentialPlan,
      'revision-unit:equations',
      failingAttempt,
    );

    expect(updated.sessions[1].status).toBe('in-progress');
    expect(updated.sessions[1].validationAttempts).toEqual([failingAttempt]);
    expect(getCompetencyStatuses(updated)).toEqual(['validated', 'in-progress', 'locked']);
  });

  it('appends to attempt history rather than replacing it', () => {
    const firstAttempt = attempt({
      revisionUnitId: 'revision-unit:equations',
      competencyId: 'equations',
      attemptNumber: 1,
      passed: false,
    });
    const secondAttempt = attempt({
      id: 'attempt-2',
      revisionUnitId: 'revision-unit:equations',
      competencyId: 'equations',
      attemptNumber: 2,
      passed: true,
    });

    const afterFirst = recordValidationAttempt(
      sequentialPlan,
      'revision-unit:equations',
      firstAttempt,
    );
    const afterSecond = recordValidationAttempt(
      afterFirst,
      'revision-unit:equations',
      secondAttempt,
    );

    expect(afterSecond.sessions[1].validationAttempts).toEqual([firstAttempt, secondAttempt]);
    expect(afterSecond.sessions[1].status).toBe('completed');
  });

  it('throws when the revision unit is not part of the plan', () => {
    expect(() => recordValidationAttempt(sequentialPlan, 'missing-unit', attempt({}))).toThrow(
      'Aucune session trouvée pour l’unité de révision « missing-unit »',
    );
  });
});
