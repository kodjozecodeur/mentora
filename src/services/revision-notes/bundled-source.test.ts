import { describe, expect, it } from 'vitest';
import { bundledRevisionNotesEngine } from './bundled-source';

describe('bundled revision note catalog', () => {
  it('exposes the complete local pack as domain objects', () => {
    const pack = bundledRevisionNotesEngine.getRevisionPack();

    expect(pack.id).toBe('bepc-mathematics-2026');
    expect(pack.notes).toHaveLength(6);
    expect(pack.notes.every((note) => note.contentVersion === '1.0.0')).toBe(true);
    expect(pack.notes.map((note) => note.competencyId)).toEqual([
      'calcul-litteral',
      'equations',
      'fonctions-lineaires',
      'statistiques',
      'theoreme-pythagore',
      'theoreme-thales',
    ]);
  });

  it('returns isolated note objects for each read', () => {
    const first = bundledRevisionNotesEngine.getRevisionNote('calcul-litteral');
    expect(first).not.toBeNull();
    if (!first) return;

    first.keyTakeaways.push('Modification locale de test');
    const second = bundledRevisionNotesEngine.getRevisionNote('calcul-litteral');

    expect(second?.keyTakeaways).not.toContain('Modification locale de test');
  });
});
