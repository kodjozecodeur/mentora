import { describe, expect, it } from 'vitest';
import type { RevisionPlan } from '@/types/revision';
import { createRevisionNoteRepository } from './repository';
import { createFilesystemRevisionNoteSourceAdapter } from './source-loader';

const pack = {
  id: 'bepc-mathematics-2026',
  subject: 'Mathématiques',
  exam: 'BEPC',
  curriculumVersion: '2026',
  contentVersion: '1.0.0',
};

const source = (id: string, title = id) => ({
  sourceId: `${id}.md`,
  content: `---
id: ${id}
competencyId: ${id}
title: ${title}
subject: Mathématiques
exam: BEPC
curriculumVersion: 2026
contentVersion: 1.0.0
teacherValidated: false
estimatedReadingMinutes: 5
difficulty: beginner
updatedAt: 2026-08-04
---

# Comprendre simplement
Comprendre ${title}.

# Exemple concret
**Situation :** Résoudre une situation.
**Étape 1 :** Appliquer la méthode.
**Conclusion :** La réponse est obtenue.

# Les erreurs fréquentes
## Erreur classique
- Erreur : oublier une étape.
- Pourquoi : aller trop vite.
- Comment éviter : relire son calcul.

# À retenir
- Appliquer la méthode.

# Mini exercice
## Exercice 1
**Énoncé :** Faire un calcul.
**Réponse :** 1.
**Correction :** Le calcul donne 1.
## Exercice 2
**Énoncé :** Faire un autre calcul.
**Réponse :** 2.
**Correction :** Le calcul donne 2.
`,
});

describe('createRevisionNoteRepository', () => {
  it('returns null for an unknown competency and indexes known notes', () => {
    const repository = createRevisionNoteRepository({
      sourceAdapter: { getSources: () => [source('equations', 'Équations')] },
      pack,
    });

    expect(repository.getRevisionNote('unknown')).toBeNull();
    expect(repository.getRevisionNote('equations')?.title).toBe('Équations');
    expect(repository.getRevisionNote('unit-id-that-does-not-exist')).toBeNull();
  });

  it('rejects duplicate note identities', () => {
    expect(() =>
      createRevisionNoteRepository({
        sourceAdapter: { getSources: () => [source('equations'), source('equations')] },
        pack,
      }),
    ).toThrow('Identifiant de fiche dupliqué');
  });

  it('returns independent object graphs on every read', () => {
    const repository = createRevisionNoteRepository({
      sourceAdapter: { getSources: () => [source('equations')] },
      pack,
    });

    const first = repository.getRevisionNote('equations');
    const second = repository.getRevisionNote('equations');
    expect(first).not.toBe(second);
    expect(first?.sections).not.toBe(second?.sections);
    expect(first?.miniExercises).not.toBe(second?.miniExercises);

    first!.keyTakeaways[0] = 'Modification locale';
    expect(repository.getRevisionNote('equations')?.keyTakeaways[0]).toBe('Appliquer la méthode.');
  });

  it('returns plan notes once, in session order', () => {
    const repository = createRevisionNoteRepository({
      sourceAdapter: {
        getSources: () => [
          source('equations', 'Équations'),
          source('calcul-litteral', 'Calcul littéral'),
        ],
      },
      pack,
    });
    const plan = {
      sessions: [
        { competencyId: 'equations' },
        { competencyId: 'equations' },
        { competencyId: 'calcul-litteral' },
      ],
    } as Pick<RevisionPlan, 'sessions'>;

    expect(repository.getNotesForRevisionPlan(plan).map((note) => note.competencyId)).toEqual([
      'equations',
      'calcul-litteral',
    ]);
  });

  it('loads the complete local BEPC mathematics pack', () => {
    const repository = createRevisionNoteRepository({
      sourceAdapter: createFilesystemRevisionNoteSourceAdapter(),
      pack,
    });

    const result = repository.getRevisionPack();
    expect(result.notes.map((note) => note.competencyId)).toEqual([
      'calcul-litteral',
      'equations',
      'fonctions-lineaires',
      'polynomes-developpement',
      'polynomes-factorisation',
      'polynomes-identites-remarquables',
      'polynomes-reduction',
      'statistiques',
      'theoreme-pythagore',
      'theoreme-thales',
    ]);
    expect(result.notes).toHaveLength(10);
    expect(result.notes.every((note) => note.contentVersion === '1.0.0')).toBe(true);
  });
});
