import { describe, expect, it } from 'vitest';
import { parseRevisionNote } from './parser';
import { createRevisionNoteRepository } from './repository';
import { RevisionNoteParseError, RevisionNoteRepositoryError } from './errors';

const validNote = (id: string, competencyId = id) => `---
id: ${id}
competencyId: ${competencyId}
title: Note
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
Une notion.
# Exemple concret
**Situation :** Un exemple.
**Étape 1 :** Une étape.
**Conclusion :** Une conclusion.
# Les erreurs fréquentes
## Une erreur
- Erreur : une erreur.
- Pourquoi : une cause.
- Comment éviter : une solution.
# À retenir
- Une idée.
# Mini exercice
## Exercice 1
**Énoncé :** Une question.
**Réponse :** Une réponse.
**Correction :** Une correction.
## Exercice 2
**Énoncé :** Une autre question.
**Réponse :** Une autre réponse.
**Correction :** Une autre correction.
`;

const pack = {
  id: 'pack',
  subject: 'Mathématiques',
  exam: 'BEPC',
  curriculumVersion: '2026',
  contentVersion: '1.0.0',
};

const adapter = (...contents: string[]) => ({
  getSources: () => contents.map((content, index) => ({ sourceId: `${index}.md`, content })),
});

describe('typed revision note errors', () => {
  it('reports missing frontmatter with a stable parser error code', () => {
    expect(() => parseRevisionNote('# Comprendre simplement\nTexte')).toThrow(
      RevisionNoteParseError,
    );

    try {
      parseRevisionNote('# Comprendre simplement\nTexte');
    } catch (error) {
      expect(error).toMatchObject({
        name: 'RevisionNoteParseError',
        code: 'invalid-frontmatter',
        sourceId: 'revision-note.md',
      });
    }
  });

  it('reports a missing required frontmatter field explicitly', () => {
    expect(() =>
      parseRevisionNote(validNote('missing-title').replace('title: Note\n', '')),
    ).toThrow(RevisionNoteParseError);

    try {
      parseRevisionNote(validNote('missing-title').replace('title: Note\n', ''));
    } catch (error) {
      expect(error).toMatchObject({ code: 'missing-frontmatter-field' });
    }
  });

  it('reports duplicate section headings with a dedicated parser error code', () => {
    const duplicateSection = validNote('duplicate-section').replace(
      '# À retenir\n- Une idée.',
      '# À retenir\n- Une idée.\n# À retenir\n- Une autre idée.',
    );

    expect(() => parseRevisionNote(duplicateSection)).toThrow(RevisionNoteParseError);

    try {
      parseRevisionNote(duplicateSection);
    } catch (error) {
      expect(error).toMatchObject({ code: 'duplicate-section' });
    }
  });

  it('reports duplicate note ids with a dedicated repository error code', () => {
    expect(() =>
      createRevisionNoteRepository({
        sourceAdapter: adapter(validNote('same-id'), validNote('same-id')),
        pack,
      }),
    ).toThrow(RevisionNoteRepositoryError);

    try {
      createRevisionNoteRepository({
        sourceAdapter: adapter(validNote('same-id'), validNote('same-id')),
        pack,
      });
    } catch (error) {
      expect(error).toMatchObject({ code: 'duplicate-id' });
    }
  });

  it('reports duplicate competency ids as a typed repository error', () => {
    expect(() =>
      createRevisionNoteRepository({
        sourceAdapter: adapter(validNote('note-a', 'same'), validNote('note-b', 'same')),
        pack,
      }),
    ).toThrow(RevisionNoteRepositoryError);

    try {
      createRevisionNoteRepository({
        sourceAdapter: adapter(validNote('note-a', 'same'), validNote('note-b', 'same')),
        pack,
      });
    } catch (error) {
      expect(error).toMatchObject({
        name: 'RevisionNoteRepositoryError',
        code: 'duplicate-competency-id',
      });
    }
  });
});
