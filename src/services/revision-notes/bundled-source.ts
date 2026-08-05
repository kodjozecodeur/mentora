import calculLitteral from '@/content/revision-notes/bepc-mathematics/calcul-litteral.md?raw';
import equations from '@/content/revision-notes/bepc-mathematics/equations.md?raw';
import fonctionsLineaires from '@/content/revision-notes/bepc-mathematics/fonctions-lineaires.md?raw';
import polynomesDeveloppement from '@/content/revision-notes/bepc-mathematics/polynomes-developpement.md?raw';
import polynomesFactorisation from '@/content/revision-notes/bepc-mathematics/polynomes-factorisation.md?raw';
import polynomesIdentitesRemarquables from '@/content/revision-notes/bepc-mathematics/polynomes-identites-remarquables.md?raw';
import polynomesReduction from '@/content/revision-notes/bepc-mathematics/polynomes-reduction.md?raw';
import statistiques from '@/content/revision-notes/bepc-mathematics/statistiques.md?raw';
import theoremePythagore from '@/content/revision-notes/bepc-mathematics/theoreme-pythagore.md?raw';
import theoremeThales from '@/content/revision-notes/bepc-mathematics/theoreme-thales.md?raw';
import { createRevisionNotesEngine } from './notes-engine';
import type { RevisionNoteSourceAdapter } from './types';

export const bundledRevisionNoteSourceAdapter: RevisionNoteSourceAdapter = {
  getSources: () => [
    { sourceId: 'calcul-litteral.md', content: calculLitteral },
    { sourceId: 'equations.md', content: equations },
    { sourceId: 'fonctions-lineaires.md', content: fonctionsLineaires },
    { sourceId: 'polynomes-developpement.md', content: polynomesDeveloppement },
    { sourceId: 'polynomes-factorisation.md', content: polynomesFactorisation },
    { sourceId: 'polynomes-identites-remarquables.md', content: polynomesIdentitesRemarquables },
    { sourceId: 'polynomes-reduction.md', content: polynomesReduction },
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
