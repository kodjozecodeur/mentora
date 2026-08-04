import calculLitteral from '@/content/revision-notes/bepc-mathematics/calcul-litteral.md';
import equations from '@/content/revision-notes/bepc-mathematics/equations.md';
import fonctionsLineaires from '@/content/revision-notes/bepc-mathematics/fonctions-lineaires.md';
import statistiques from '@/content/revision-notes/bepc-mathematics/statistiques.md';
import theoremePythagore from '@/content/revision-notes/bepc-mathematics/theoreme-pythagore.md';
import theoremeThales from '@/content/revision-notes/bepc-mathematics/theoreme-thales.md';
import { createRevisionNotesEngine } from './notes-engine';
import type { RevisionNoteSourceAdapter } from './types';

export const bundledRevisionNoteSourceAdapter: RevisionNoteSourceAdapter = {
  getSources: () => [
    { sourceId: 'calcul-litteral.md', content: calculLitteral },
    { sourceId: 'equations.md', content: equations },
    { sourceId: 'fonctions-lineaires.md', content: fonctionsLineaires },
    { sourceId: 'theoreme-pythagore.md', content: theoremePythagore },
    { sourceId: 'theoreme-thales.md', content: theoremeThales },
    { sourceId: 'statistiques.md', content: statistiques },
  ],
};

export const bundledRevisionNotesEngine = createRevisionNotesEngine({
  sourceAdapter: bundledRevisionNoteSourceAdapter,
  pack: {
    id: 'bepc-mathematics-2026',
    subject: 'Mathématiques',
    exam: 'BEPC',
    curriculumVersion: '2026',
    contentVersion: '1.0.0',
  },
});
