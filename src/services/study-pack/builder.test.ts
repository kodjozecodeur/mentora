import { describe, expect, it } from 'vitest';
import { buildStudyPack } from './builder';
import {
  fixtureBuildStudyPackInput,
  fixtureRevisionNotes,
  fixtureRevisionNotesForTwoSessions,
  fixtureRevisionPlanWithTwoSessions,
} from './testFixtures';
import type { StudyPackSection } from '@/types/study-pack';

function expectKind<K extends StudyPackSection['kind']>(
  section: StudyPackSection,
  kind: K,
): asserts section is Extract<StudyPackSection, { kind: K }> {
  expect(section.kind).toBe(kind);
}

describe('buildStudyPack', () => {
  it('builds the fixed section order with correctly derived cover content', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);

    expect(pack.sections.map((section) => section.kind)).toEqual([
      'cover',
      'diagnostic-summary',
      'revision-plan',
      'revision-notes',
      'corrections',
    ]);

    const cover = pack.sections[0];
    expectKind(cover, 'cover');
    expect(cover.studentName).toBe('Awa');
    expect(cover.subjectLabel).toBe('Mathématiques');
    expect(cover.examLabel).toBe("Brevet d'études du premier cycle (BEPC)");
    expect(cover.readinessScore).toBe(67);
    expect(cover.diagnosticSummary).toBe(
      '1 point fort, 1 compétence à renforcer, priorité : Calcul littéral',
    );
  });

  it('falls back to a null student name when none is given', () => {
    const pack = buildStudyPack({ ...fixtureBuildStudyPackInput, studentName: undefined });
    const cover = pack.sections[0];
    expectKind(cover, 'cover');
    expect(cover.studentName).toBeNull();
  });

  it('trims a whitespace-only student name to null', () => {
    const pack = buildStudyPack({ ...fixtureBuildStudyPackInput, studentName: '   ' });
    const cover = pack.sections[0];
    expectKind(cover, 'cover');
    expect(cover.studentName).toBeNull();
  });

  it('carries diagnostic summary counts and revision plan totals', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    const summary = pack.sections[1];
    expectKind(summary, 'diagnostic-summary');
    expect(summary.strengths).toHaveLength(1);
    expect(summary.weaknesses).toHaveLength(1);
    expect(summary.topPriority?.competencyLabel).toBe('Calcul littéral');
    expect(summary.estimatedDays).toBe(1);
    expect(summary.estimatedTotalMinutes).toBe(20);
  });

  it('joins each session to its unit objective and success criterion', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    const plan = pack.sections[2];
    expectKind(plan, 'revision-plan');
    expect(plan.items).toEqual([
      {
        dayNumber: 1,
        competencyLabel: 'Calcul littéral',
        objective: 'Développer et réduire correctement une expression.',
        estimatedMinutes: 20,
        successCriterion: 'Réussir deux exercices consécutifs de calcul littéral.',
      },
    ]);
  });

  it('includes only the notes referenced by the plan, in plan order, deduped', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    const notesSection = pack.sections[3];
    expectKind(notesSection, 'revision-notes');
    expect(notesSection.notes.map((note) => note.competencyId)).toEqual(['calcul-litteral']);
  });

  it('throws when the plan references a competency with no matching note', () => {
    expect(() => buildStudyPack({ ...fixtureBuildStudyPackInput, allRevisionNotes: [] })).toThrow(
      /calcul-litteral/,
    );
  });

  it('throws when a session references a revision unit that does not exist', () => {
    expect(() => buildStudyPack({ ...fixtureBuildStudyPackInput, revisionUnits: [] })).toThrow(
      /revision-session:diagnostic:test:1/,
    );
  });

  it('follows plan order for note selection, not the order notes appear in the catalog', () => {
    const pack = buildStudyPack({
      ...fixtureBuildStudyPackInput,
      revisionPlan: fixtureRevisionPlanWithTwoSessions,
      allRevisionNotes: fixtureRevisionNotesForTwoSessions,
    });
    const notesSection = pack.sections[3];
    expectKind(notesSection, 'revision-notes');
    expect(notesSection.notes.map((note) => note.competencyId)).toEqual([
      'calcul-litteral',
      'equations',
    ]);
  });

  it('dedupes notes when the plan references the same competency across multiple sessions', () => {
    const revisitedPlan = {
      ...fixtureBuildStudyPackInput.revisionPlan,
      sessions: [
        fixtureBuildStudyPackInput.revisionPlan.sessions[0],
        {
          ...fixtureBuildStudyPackInput.revisionPlan.sessions[0],
          id: 'revision-session:diagnostic:test:1-revisit',
          dayNumber: 2,
          order: 2,
        },
      ],
    };
    const pack = buildStudyPack({ ...fixtureBuildStudyPackInput, revisionPlan: revisitedPlan });
    const notesSection = pack.sections[3];
    expectKind(notesSection, 'revision-notes');
    expect(notesSection.notes).toHaveLength(1);
    expect(notesSection.notes[0].competencyId).toBe('calcul-litteral');
  });

  it('separates exercises from corrections: corrections carry statement, answer, and correction', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    const corrections = pack.sections[4];
    expectKind(corrections, 'corrections');
    expect(corrections.entries).toEqual([
      {
        competencyLabel: 'Calcul littéral',
        exercises: [
          {
            order: 1,
            statement: 'Développer `2(x + 3) - x`.',
            answer: '`x + 6`.',
            correction: '`2(x + 3) - x = 2x + 6 - x = x + 6`.',
          },
          {
            order: 2,
            statement: 'Développer `5(x - 2) - 2(x + 1)`.',
            answer: '`3x - 12`.',
            correction: '`5x - 10 - 2x - 2 = 3x - 12`.',
          },
        ],
      },
    ]);
  });

  it('carries version metadata for reproducibility', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    expect(pack.snapshot).toEqual({
      algorithmVersion: 'study-pack.v1',
      contentVersion: '1.0.0',
      diagnosticId: 'diagnostic:test',
      revisionPlanId: 'revision-plan:diagnostic:test:study-pack.v1:1.0.0',
      generatedAt: '2026-08-04T10:10:00.000Z',
    });
  });

  it('defaults generatedAt and algorithmVersion when not supplied', () => {
    const input = { ...fixtureBuildStudyPackInput };
    delete input.generatedAt;
    delete input.algorithmVersion;

    const pack = buildStudyPack(input);
    expect(pack.snapshot.algorithmVersion).toBe('study-pack.v1');
    expect(typeof pack.snapshot.generatedAt).toBe('string');
    expect(Number.isNaN(Date.parse(pack.snapshot.generatedAt))).toBe(false);
  });

  it('is deterministic: same input, same generatedAt, produces a deep-equal result', () => {
    const first = buildStudyPack(fixtureBuildStudyPackInput);
    const second = buildStudyPack(fixtureBuildStudyPackInput);
    expect(first).toEqual(second);
  });

  it('returns a frozen snapshot that cannot be mutated', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    expect(() => {
      // @ts-expect-error intentional mutation attempt for the frozen-snapshot test
      pack.snapshot.algorithmVersion = 'tampered';
    }).toThrow();
    expect(() => {
      // @ts-expect-error intentional mutation attempt for the frozen-snapshot test
      pack.sections.push(pack.sections[0]);
    }).toThrow();
  });

  it('is unaffected by mutating the caller input after the call', () => {
    const input = { ...fixtureBuildStudyPackInput, allRevisionNotes: [...fixtureRevisionNotes] };
    const pack = buildStudyPack(input);
    input.allRevisionNotes.push({ ...fixtureRevisionNotes[0], id: 'injected' });

    const notesSection = pack.sections[3];
    expectKind(notesSection, 'revision-notes');
    expect(notesSection.notes).toHaveLength(1);
  });

  it('does not freeze or otherwise mutate the caller-owned diagnostic result or notes catalog', () => {
    const input = {
      ...fixtureBuildStudyPackInput,
      allRevisionNotes: fixtureRevisionNotes.map((note) => ({ ...note })),
    };
    buildStudyPack(input);
    expect(Object.isFrozen(input.diagnosticResult.strengths)).toBe(false);
    expect(Object.isFrozen(input.diagnosticResult.strengths[0])).toBe(false);
    expect(Object.isFrozen(input.diagnosticResult.weaknesses[0])).toBe(false);
    expect(Object.isFrozen(input.diagnosticResult.revisionPriorities[0])).toBe(false);
    expect(Object.isFrozen(input.allRevisionNotes[0])).toBe(false);
  });
});
