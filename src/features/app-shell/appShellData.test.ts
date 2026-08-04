import { describe, expect, it } from 'vitest';
import type { RevisionPlan } from '@/types/revision';
import {
  getNextRevisionSession,
  getRevisionProgress,
  getRevisionUnitForSession,
  getShellStudentName,
  hasStartedRevision,
} from './appShellData';

const plan: RevisionPlan = {
  id: 'plan-1',
  diagnosticId: 'diagnostic-1',
  studentName: 'Awa',
  generatedAt: '2026-08-04T10:00:00.000Z',
  algorithmVersion: 'revision-plan.v1',
  contentVersion: '1.0.0',
  estimatedTotalMinutes: 60,
  estimatedDays: 3,
  sessions: [
    {
      id: 'session-1',
      dayNumber: 1,
      order: 1,
      competencyId: 'calcul-litteral',
      competencyLabel: 'Calcul littéral',
      priorityLevel: 'critical',
      priorityReason: 'Reprendre les bases.',
      estimatedMinutes: 20,
      masteryBefore: 20,
      targetMastery: 70,
      confidence: 'low',
      revisionUnitId: 'revision-unit:calcul-litteral',
      exitCriteria: [],
      status: 'completed',
    },
    {
      id: 'session-2',
      dayNumber: 2,
      order: 2,
      competencyId: 'equations',
      competencyLabel: 'Équations',
      priorityLevel: 'high',
      priorityReason: 'Consolider la méthode.',
      estimatedMinutes: 20,
      masteryBefore: 45,
      targetMastery: 70,
      confidence: 'low',
      revisionUnitId: 'revision-unit:equations',
      exitCriteria: [],
      status: 'in-progress',
    },
    {
      id: 'session-3',
      dayNumber: 3,
      order: 3,
      competencyId: 'statistiques',
      competencyLabel: 'Statistiques',
      priorityLevel: 'medium',
      priorityReason: 'Automatiser la méthode.',
      estimatedMinutes: 20,
      masteryBefore: 60,
      targetMastery: 80,
      confidence: 'low',
      revisionUnitId: 'revision-unit:statistiques',
      exitCriteria: [],
      status: 'not-started',
    },
  ],
};

describe('app shell data selectors', () => {
  it('selects the first session that is not completed', () => {
    expect(getNextRevisionSession(plan)?.id).toBe('session-2');
  });

  it('resolves a revision unit through the session relation', () => {
    expect(
      getRevisionUnitForSession(plan.sessions[1], [
        {
          id: 'revision-unit:equations',
          competencyId: 'equations',
          competencyLabel: 'Équations',
          objective: 'Isoler une inconnue.',
          prerequisites: [],
          estimatedMinutes: 20,
          activities: [],
          exitCriteria: [],
          contentVersion: '1.0.0',
        },
      ])?.objective,
    ).toBe('Isoler une inconnue.');
  });

  it('returns progress from existing session statuses and durations', () => {
    expect(getRevisionProgress(plan)).toEqual({
      completedSessions: 1,
      totalSessions: 3,
      completionPercent: 33,
      remainingMinutes: 40,
    });
  });

  it('reports a fresh plan as not started', () => {
    expect(
      hasStartedRevision({
        sessions: plan.sessions.map((session) => ({ ...session, status: 'not-started' })),
      }),
    ).toBe(false);
  });

  it('reports a plan as started after an in-progress or completed session', () => {
    expect(hasStartedRevision(plan)).toBe(true);
    expect(
      hasStartedRevision({
        sessions: plan.sessions.map((session) => ({ ...session, status: 'completed' })),
      }),
    ).toBe(true);
  });

  it('prefers the current name and falls back to the plan snapshot', () => {
    expect(getShellStudentName('  Koffi  ', plan)).toBe('Koffi');
    expect(getShellStudentName('', plan)).toBe('Awa');
    expect(getShellStudentName(undefined, { ...plan, studentName: undefined })).toBe('élève');
  });
});
