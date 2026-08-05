import { describe, expect, it } from 'vitest';
import diagnosticQuestions from './diagnostic-questions.json';
import type { DiagnosticQuestion } from '@/types/diagnostic';

const QUESTIONS = diagnosticQuestions as DiagnosticQuestion[];

const APPROVED_CHAPTER_ID = 'polynomes-second-degre';

const APPROVED_COMPETENCY_IDS = new Set([
  'polynomes-reduction',
  'polynomes-developpement',
  'polynomes-factorisation',
  'polynomes-identites-remarquables',
]);

// Any of these topic markers slipping into the bank means an unrelated chapter's content
// (Thalès, Statistiques, Pythagore, Fonctions linéaires, Équations) leaked back in.
const FORBIDDEN_TOPIC_IDS = [
  'thales',
  'statistiques',
  'pythagore',
  'fonctions-lineaires',
  'equations',
  'calcul-litteral',
];

describe('diagnostic-questions.json — Polynômes chapter coherence', () => {
  it('has between 8 and 12 questions for the demo', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(8);
    expect(QUESTIONS.length).toBeLessThanOrEqual(12);
  });

  it('tags every question with the Polynômes chapter only', () => {
    for (const question of QUESTIONS) {
      expect(question.chapterId).toBe(APPROVED_CHAPTER_ID);
    }
  });

  it('only uses competencyIds from the approved Polynômes taxonomy', () => {
    for (const question of QUESTIONS) {
      expect(APPROVED_COMPETENCY_IDS.has(question.competencyId)).toBe(true);
    }
  });

  it('never references a forbidden (unrelated-chapter) competencyId', () => {
    for (const question of QUESTIONS) {
      expect(FORBIDDEN_TOPIC_IDS).not.toContain(question.competencyId);
    }
  });

  it('covers every competency in the taxonomy at least once', () => {
    const seen = new Set(QUESTIONS.map((question) => question.competencyId));
    for (const competencyId of APPROVED_COMPETENCY_IDS) {
      expect(seen.has(competencyId)).toBe(true);
    }
  });

  it('has a unique id and correctOptionId present among its own options for every question', () => {
    const ids = new Set<string>();
    for (const question of QUESTIONS) {
      expect(ids.has(question.id)).toBe(false);
      ids.add(question.id);
      expect(question.options.map((option) => option.id)).toContain(question.correctOptionId);
    }
  });
});
