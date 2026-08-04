import { describe, expect, it } from 'vitest';
import { buildStudyPack } from './builder';
import { studyPackToDocumentModel } from './documentModel';
import { fixtureBuildStudyPackInput } from './testFixtures';

function buildFixtureDocument() {
  const pack = buildStudyPack(fixtureBuildStudyPackInput);
  return studyPackToDocumentModel(pack);
}

describe('studyPackToDocumentModel', () => {
  it('produces one section per fixed content area, plus one section per fiche', () => {
    const document = buildFixtureDocument();
    // cover, diagnostic-summary, revision-plan, 1 fiche (calcul-litteral), corrections
    expect(document.sections.map((section) => section.id)).toEqual([
      'cover',
      'diagnostic-summary',
      'revision-plan',
      'fiche-calcul-litteral',
      'corrections',
    ]);
  });

  it('marks cover with pageBreakAfter instead of marking the next section pageBreakBefore', () => {
    const document = buildFixtureDocument();
    expect(document.sections[0].id).toBe('cover');
    expect(document.sections[0].pageBreakAfter).toBe(true);
    expect(document.sections[0].pageBreakBefore).toBeFalsy();
    expect(document.sections[1].pageBreakBefore).toBeFalsy();
  });

  it('forces a page break on every fiche section and on corrections', () => {
    const document = buildFixtureDocument();
    const fiche = document.sections.find((section) => section.id === 'fiche-calcul-litteral');
    const corrections = document.sections.find((section) => section.id === 'corrections');
    expect(fiche?.pageBreakBefore).toBe(true);
    expect(corrections?.pageBreakBefore).toBe(true);
  });

  it('strips inline markdown from fiche content', () => {
    const document = buildFixtureDocument();
    const fiche = document.sections.find((section) => section.id === 'fiche-calcul-litteral');
    const flat = JSON.stringify(fiche);
    expect(flat).not.toContain('**');
    expect(flat).not.toMatch(/`[^`]+`/);
    expect(flat).toContain("c'est distribuer");
  });

  it('never includes an exercise answer or correction inside a fiche section', () => {
    const document = buildFixtureDocument();
    const fiche = document.sections.find((section) => section.id === 'fiche-calcul-litteral');
    const flat = JSON.stringify(fiche);
    expect(flat).not.toContain('x + 6');
    expect(flat).not.toContain('3x - 12');
    expect(flat).toContain('Développer 2(x + 3) - x');
  });

  it('includes both the statement and the answer/correction inside corrections', () => {
    const document = buildFixtureDocument();
    const corrections = document.sections.find((section) => section.id === 'corrections');
    const flat = JSON.stringify(corrections);
    expect(flat).toContain('Développer 2(x + 3) - x');
    expect(flat).toContain('x + 6');
    expect(flat).toContain('2x + 6 - x = x + 6');
  });

  it('renders the revision plan as a table with one row per session', () => {
    const document = buildFixtureDocument();
    const planSection = document.sections.find((section) => section.id === 'revision-plan');
    const table = planSection?.blocks.find((block) => block.kind === 'table');
    if (!table || table.kind !== 'table') throw new Error('expected a table block');
    expect(table.headers).toEqual([
      'Jour',
      'Compétence',
      'Objectif',
      'Durée',
      'Critère de réussite',
    ]);
    expect(table.rows).toEqual([
      [
        '1',
        'Calcul littéral',
        'Développer et réduire correctement une expression.',
        '20 min',
        'Réussir deux exercices consécutifs de calcul littéral.',
      ],
    ]);
  });

  it('is deterministic: same StudyPack in, structurally identical DocumentModel out', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    const first = studyPackToDocumentModel(pack);
    const second = studyPackToDocumentModel(pack);
    expect(first).toEqual(second);
  });

  it('marks every card block as break-avoiding', () => {
    const document = buildFixtureDocument();
    const cards = document.sections.flatMap((section) =>
      section.blocks.filter((block) => block.kind === 'card'),
    );
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      if (card.kind !== 'card') throw new Error('expected a card block');
      expect(card.avoidBreak).toBe(true);
    }
  });
});
