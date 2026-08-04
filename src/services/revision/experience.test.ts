import { describe, expect, it } from 'vitest';
import type { RevisionNote, RevisionNoteRepository } from '@/services/revision-notes/types';
import type { RevisionPlan } from '@/types/revision';
import { resolveRevisionSessionContent } from './experience';

const note: RevisionNote = {
  id: 'calcul-litteral',
  competencyId: 'calcul-litteral',
  title: 'Calcul littéral',
  subject: 'Mathématiques',
  exam: 'BEPC',
  curriculumVersion: '2026',
  contentVersion: '1.0.0',
  teacherValidated: false,
  estimatedReadingMinutes: 8,
  difficulty: 'beginner',
  updatedAt: '2026-08-04',
  sections: [],
  workedExample: { title: 'Exemple', problem: 'p', steps: ['s'], conclusion: 'c' },
  commonMistakes: [],
  keyTakeaways: [],
  miniExercises: [],
};

const plan = {
  sessions: [
    {
      revisionUnitId: 'revision-unit:calcul-litteral',
      competencyId: 'calcul-litteral',
    },
  ],
} as Pick<RevisionPlan, 'sessions'>;

const repository: RevisionNoteRepository = {
  getRevisionNote: (idOrCompetencyId) => (idOrCompetencyId === 'calcul-litteral' ? note : null),
  getRevisionNotes: () => [note],
  getRevisionPack: () => ({
    id: 'pack',
    subject: 'Mathématiques',
    exam: 'BEPC',
    curriculumVersion: '2026',
    contentVersion: '1.0.0',
    notes: [note],
  }),
  getNotesForRevisionPlan: () => [note],
};

describe('resolveRevisionSessionContent', () => {
  it('resolves a note through revisionUnitId before using the unit competency relation', () => {
    const result = resolveRevisionSessionContent(
      plan,
      'revision-unit:calcul-litteral',
      repository,
      [
        {
          id: 'revision-unit:calcul-litteral',
          competencyId: 'calcul-litteral',
          competencyLabel: 'Calcul littéral',
          objective: 'Développer une expression.',
          prerequisites: [],
          estimatedMinutes: 20,
          activities: [],
          exitCriteria: [],
          contentVersion: '1.0.0',
        },
      ],
    );

    expect(result).toMatchObject({
      session: plan.sessions[0],
      unit: { id: 'revision-unit:calcul-litteral' },
      note: { id: 'calcul-litteral' },
    });
  });

  it('returns null when the revision unit or note cannot be resolved', () => {
    expect(resolveRevisionSessionContent(plan, 'missing-unit', repository, [])).toBeNull();
    expect(
      resolveRevisionSessionContent(
        plan,
        'revision-unit:calcul-litteral',
        { ...repository, getRevisionNote: () => null },
        [
          {
            id: 'revision-unit:calcul-litteral',
            competencyId: 'calcul-litteral',
            competencyLabel: 'Calcul littéral',
            objective: 'Développer une expression.',
            prerequisites: [],
            estimatedMinutes: 20,
            activities: [],
            exitCriteria: [],
            contentVersion: '1.0.0',
          },
        ],
      ),
    ).toBeNull();
  });
});
