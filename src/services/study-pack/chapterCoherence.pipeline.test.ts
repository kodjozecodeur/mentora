import { describe, expect, it } from 'vitest';
import diagnosticQuestions from '@/data/diagnostic-questions.json';
import { REVISION_UNITS } from '@/data/revision-units';
import { runDiagnosticEngine } from '@/services/diagnostic/engine';
import { generateRevisionPlan } from '@/services/revision/generator';
import { getValidationQuestions } from '@/services/revision/validation';
import { bundledRevisionNotesEngine } from '@/services/revision-notes/bundled-source';
import { buildStudyPack } from './builder';
import { studyPackToDocumentModel } from './documentModel';
import { renderDocumentModelToHtml } from './htmlAdapter';
import type { DiagnosticQuestion, DiagnosticResponse } from '@/types/diagnostic';

const QUESTIONS = diagnosticQuestions as DiagnosticQuestion[];
const APPROVED_COMPETENCY_IDS = new Set([
  'polynomes-reduction',
  'polynomes-developpement',
  'polynomes-factorisation',
  'polynomes-identites-remarquables',
]);

/**
 * Full local pipeline, run with the *real* Polynômes chapter data (no synthetic fixtures):
 * diagnostic answers -> scoring -> plan -> validation bank -> study pack. Exercises the
 * chapter-scope guarantees end to end, the way selecting the Polynômes chapter in onboarding
 * actually does.
 */
function answerEverythingCorrectly(): DiagnosticResponse[] {
  return QUESTIONS.map((question) => ({
    questionId: question.id,
    competencyId: question.competencyId,
    optionId: question.correctOptionId,
    isCorrect: true,
    points: question.points,
  }));
}

describe('Polynômes chapter pipeline coherence', () => {
  const result = runDiagnosticEngine(QUESTIONS, answerEverythingCorrectly(), 'initial');

  it('scores only competencies from the Polynômes taxonomy', () => {
    expect(result.competencyMastery.length).toBeGreaterThan(0);
    for (const mastery of result.competencyMastery) {
      expect(APPROVED_COMPETENCY_IDS.has(mastery.competencyId)).toBe(true);
    }
  });

  const plan = generateRevisionPlan({
    diagnosticId: 'diagnostic:chapter-coherence-test',
    diagnosticResult: result,
    revisionUnits: REVISION_UNITS,
    generatedAt: '2026-08-05T09:00:00.000Z',
  });

  it('generates a plan containing only Polynômes sessions', () => {
    expect(plan.sessions.length).toBeGreaterThan(0);
    for (const session of plan.sessions) {
      expect(APPROVED_COMPETENCY_IDS.has(session.competencyId)).toBe(true);
    }
  });

  it('scopes validation questions to the same chapter and competency', () => {
    for (const session of plan.sessions) {
      const validationQuestions = getValidationQuestions(session.competencyId, QUESTIONS);
      expect(validationQuestions.length).toBeGreaterThan(0);
      for (const question of validationQuestions) {
        expect(question.competencyId).toBe(session.competencyId);
        expect(APPROVED_COMPETENCY_IDS.has(question.competencyId)).toBe(true);
      }
    }
  });

  const studyPack = buildStudyPack({
    diagnosticResult: result,
    revisionPlan: plan,
    revisionUnits: REVISION_UNITS,
    allRevisionNotes: bundledRevisionNotesEngine.getRevisionNotes(),
    studentName: 'Awa',
    subjectLabel: 'Mathématiques',
    examLabel: 'Polynômes du second degré',
    generatedAt: '2026-08-05T09:05:00.000Z',
  });

  it('builds a study pack whose notes and corrections stay within the chapter taxonomy', () => {
    const notesSection = studyPack.sections.find((section) => section.kind === 'revision-notes');
    if (notesSection?.kind !== 'revision-notes') throw new Error('revision-notes section missing');
    expect(notesSection.notes.length).toBeGreaterThan(0);
    for (const note of notesSection.notes) {
      expect(APPROVED_COMPETENCY_IDS.has(note.competencyId)).toBe(true);
    }

    const correctionsSection = studyPack.sections.find((section) => section.kind === 'corrections');
    if (correctionsSection?.kind !== 'corrections') throw new Error('corrections section missing');
    expect(correctionsSection.entries.length).toBe(notesSection.notes.length);
  });

  it('carries no visible BEPC/exam wording, only chapter framing, on the cover', () => {
    const cover = studyPack.sections.find((section) => section.kind === 'cover');
    if (cover?.kind !== 'cover') throw new Error('cover section missing');
    expect(cover.examLabel).not.toMatch(/BEPC/i);
    expect(cover.examLabel).not.toMatch(/Brevet/i);
    expect(cover.examLabel).toBe('Polynômes du second degré');
  });

  it('renders a printable document with no BEPC/exam wording and no unrelated chapter content', () => {
    const html = renderDocumentModelToHtml(studyPackToDocumentModel(studyPack));
    expect(html).not.toMatch(/BEPC/i);
    expect(html).not.toMatch(/Brevet d'études/i);
    expect(html).not.toMatch(/Th[aà]lès/i);
    expect(html).not.toMatch(/Statistiques/i);
    expect(html).not.toMatch(/Pythagore/i);
    expect(html).not.toMatch(/Fonctions linéaires/i);
  });
});
