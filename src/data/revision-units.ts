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
    'revision-unit:calcul-litteral',
    'calcul-litteral',
    'Calcul littéral',
    'Développer et réduire correctement une expression.',
    'Réussir deux exercices consécutifs de calcul littéral.',
  ),
  unit(
    'revision-unit:equations',
    'equations',
    'Équations',
    'Isoler une inconnue et vérifier la solution.',
    'Réussir deux exercices consécutifs d’équations.',
  ),
  unit(
    'revision-unit:fonctions-lineaires',
    'fonctions-lineaires',
    'Fonctions linéaires',
    'Calculer une image ou un antécédent simple.',
    'Réussir deux exercices consécutifs de fonctions linéaires.',
  ),
  unit(
    'revision-unit:theoreme-pythagore',
    'theoreme-pythagore',
    'Théorème de Pythagore',
    'Identifier l’hypoténuse et appliquer le théorème.',
    'Réussir deux exercices consécutifs avec le théorème de Pythagore.',
  ),
  unit(
    'revision-unit:theoreme-thales',
    'theoreme-thales',
    'Théorème de Thalès',
    'Écrire les rapports correspondants et calculer une longueur.',
    'Réussir deux exercices consécutifs avec le théorème de Thalès.',
  ),
  unit(
    'revision-unit:statistiques',
    'statistiques',
    'Statistiques',
    'Calculer une moyenne simple ou pondérée.',
    'Réussir deux exercices consécutifs de statistiques.',
  ),
];
