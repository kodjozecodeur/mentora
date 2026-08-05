import type { RevisionUnit } from '@/types/revision';

const contentVersion = '1.0.0';

function unit(
  id: string,
  competencyId: string,
  competencyLabel: string,
  objective: string,
  criterion: string,
): RevisionUnit {
  return {
    id,
    competencyId,
    competencyLabel,
    objective,
    prerequisites: [],
    estimatedMinutes: 20,
    activities: [
      {
        id: `${id}:read-note`,
        type: 'read-note',
        label: 'Lire la fiche de révision',
        estimatedMinutes: 8,
        required: true,
      },
      {
        id: `${id}:worked-example`,
        type: 'worked-example',
        label: 'Suivre l’exemple résolu',
        estimatedMinutes: 5,
        required: true,
      },
      {
        id: `${id}:mini-assessment`,
        type: 'mini-assessment',
        label: 'Faire les deux mini-exercices',
        estimatedMinutes: 7,
        required: true,
      },
    ],
    exitCriteria: [
      {
        type: 'consecutive-success',
        target: 2,
        description: criterion,
      },
    ],
    contentVersion,
  };
}

export const REVISION_UNITS: RevisionUnit[] = [
  unit(
    'revision-unit:polynomes-reduction',
    'polynomes-reduction',
    'Réduire une expression',
    'Développer et réduire correctement une expression littérale.',
    'Réussir deux exercices consécutifs de réduction d’expression.',
  ),
  unit(
    'revision-unit:polynomes-developpement',
    'polynomes-developpement',
    'Développer une expression',
    'Développer un produit de deux facteurs, y compris une somme de deux produits.',
    'Réussir deux exercices consécutifs de développement d’expression.',
  ),
  unit(
    'revision-unit:polynomes-factorisation',
    'polynomes-factorisation',
    'Factoriser une expression',
    'Reconnaître et sortir un facteur commun.',
    'Réussir deux exercices consécutifs de factorisation.',
  ),
  unit(
    'revision-unit:polynomes-identites-remarquables',
    'polynomes-identites-remarquables',
    'Identités remarquables',
    'Développer (a+b)², (a-b)² et (a+b)(a-b).',
    'Réussir deux exercices consécutifs d’identités remarquables.',
  ),
];
