import { describe, expect, it } from 'vitest';
import { createRevisionNotesEngine } from './notes-engine';

const content = `---
id: equations
competencyId: equations
title: Équations
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
Une équation contient une inconnue.
# Exemple concret
**Situation :** Résoudre x + 2 = 5.
**Étape 1 :** Soustraire 2 aux deux membres.
**Conclusion :** x = 3.
# Les erreurs fréquentes
## Changer un seul membre
- Erreur : soustraire 2 d'un seul côté.
- Pourquoi : oublier l'égalité.
- Comment éviter : faire la même opération des deux côtés.
# À retenir
- Une égalité reste équilibrée.
# Mini exercice
## Exercice 1
**Énoncé :** Résoudre x + 1 = 4.
**Réponse :** x = 3.
**Correction :** On soustrait 1 aux deux membres.
## Exercice 2
**Énoncé :** Résoudre x - 2 = 5.
**Réponse :** x = 7.
**Correction :** On ajoute 2 aux deux membres.
`;

describe('createRevisionNotesEngine', () => {
  it('exposes the domain operations without exposing Markdown sources', () => {
    const engine = createRevisionNotesEngine({
      sourceAdapter: { getSources: () => [{ sourceId: 'equations.md', content }] },
      pack: {
        id: 'bepc-mathematics-2026',
        subject: 'Mathématiques',
        exam: 'BEPC',
        curriculumVersion: '2026',
        contentVersion: '1.0.0',
      },
    });

    expect(Object.keys(engine).sort()).toEqual([
      'getNotesForRevisionPlan',
      'getRevisionNote',
      'getRevisionNotes',
      'getRevisionPack',
    ]);
    expect(engine.getRevisionNote('equations')).toMatchObject({
      id: 'equations',
      title: 'Équations',
    });
  });
});
