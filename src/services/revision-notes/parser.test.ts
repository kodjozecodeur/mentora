import { describe, expect, it } from 'vitest';
import { parseRevisionFrontmatter, parseRevisionNote } from './parser';

const markdown = `---
id: calcul-litteral
competencyId: calcul-litteral
title: Calcul littéral
subject: Mathématiques
exam: BEPC
curriculumVersion: 2026
contentVersion: 1.0.0
teacherValidated: false
estimatedReadingMinutes: 8
difficulty: beginner
updatedAt: 2026-08-04
---

# Comprendre simplement

On développe une expression en distribuant chaque facteur.

# Exemple concret

**Situation :** Développer \`3(x + 2)\`.

**Étape 1 :** Multiplier 3 par x.

**Étape 2 :** Multiplier 3 par 2.

**Conclusion :** \`3(x + 2) = 3x + 6\`.

# Les erreurs fréquentes

## Oublier un terme

- Erreur : écrire \`3x + 2\`.
- Pourquoi : on ne distribue pas le facteur à toute la parenthèse.
- Comment éviter : vérifier chaque terme avant de réduire.

# À retenir

- Distribuer le facteur à chaque terme.
- Réduire seulement les termes semblables.

# Mini exercice

## Exercice 1

**Énoncé :** Développer \`2(x + 4)\`.

**Réponse :** \`2x + 8\`.

**Correction :** On calcule \`2 × x\` et \`2 × 4\`, donc \`2x + 8\`.

## Exercice 2

**Énoncé :** Développer \`5(x - 1)\`.

**Réponse :** \`5x - 5\`.

**Correction :** Le facteur 5 multiplie x puis -1 : \`5x - 5\`.
`;

describe('parseRevisionFrontmatter', () => {
  it('parses typed metadata without exposing raw YAML strings', () => {
    const frontmatter = `id: test
competencyId: test
title: Test
subject: Mathématiques
exam: BEPC
curriculumVersion: 2026
contentVersion: 1.0.0
teacherValidated: true
estimatedReadingMinutes: 5
difficulty: beginner
updatedAt: 2026-08-04`;

    expect(parseRevisionFrontmatter(frontmatter)).toEqual({
      id: 'test',
      competencyId: 'test',
      title: 'Test',
      subject: 'Mathématiques',
      exam: 'BEPC',
      curriculumVersion: '2026',
      contentVersion: '1.0.0',
      teacherValidated: true,
      estimatedReadingMinutes: 5,
      difficulty: 'beginner',
      updatedAt: '2026-08-04',
    });
  });
});

describe('parseRevisionNote', () => {
  it('converts the canonical Markdown structure into domain objects', () => {
    const result = parseRevisionNote(markdown, 'calcul-litteral.md');

    expect(result).toMatchObject({
      id: 'calcul-litteral',
      competencyId: 'calcul-litteral',
      title: 'Calcul littéral',
      teacherValidated: false,
      estimatedReadingMinutes: 8,
      sections: [
        { id: 'comprendre-simplement', title: 'Comprendre simplement', order: 1 },
        { id: 'exemple-concret', title: 'Exemple concret', order: 2 },
        { id: 'les-erreurs-frequentes', title: 'Les erreurs fréquentes', order: 3 },
        { id: 'a-retenir', title: 'À retenir', order: 4 },
        { id: 'mini-exercice', title: 'Mini exercice', order: 5 },
      ],
      workedExample: {
        title: 'Exemple concret',
        problem: 'Développer `3(x + 2)`.',
        steps: ['Multiplier 3 par x.', 'Multiplier 3 par 2.'],
        conclusion: '`3(x + 2) = 3x + 6`.',
      },
      commonMistakes: [
        {
          title: 'Oublier un terme',
          error: 'écrire `3x + 2`.',
          whyItHappens: 'on ne distribue pas le facteur à toute la parenthèse.',
          howToAvoid: 'vérifier chaque terme avant de réduire.',
        },
      ],
      keyTakeaways: [
        'Distribuer le facteur à chaque terme.',
        'Réduire seulement les termes semblables.',
      ],
      miniExercises: [
        {
          id: 'calcul-litteral-exercise-1',
          order: 1,
          statement: 'Développer `2(x + 4)`.',
          answer: '`2x + 8`.',
          correction: 'On calcule `2 × x` et `2 × 4`, donc `2x + 8`.',
        },
        {
          id: 'calcul-litteral-exercise-2',
          order: 2,
          statement: 'Développer `5(x - 1)`.',
          answer: '`5x - 5`.',
          correction: 'Le facteur 5 multiplie x puis -1 : `5x - 5`.',
        },
      ],
    });
  });

  it('rejects missing or duplicated canonical sections', () => {
    expect(() =>
      parseRevisionNote(markdown.replace('# À retenir', '# À retenir\n\n# À retenir')),
    ).toThrow('Section Markdown dupliquée');
    expect(() =>
      parseRevisionNote(markdown.replace('# Mini exercice', '# Mini exercice supprimé')),
    ).toThrow('Section Markdown manquante');
  });
});
