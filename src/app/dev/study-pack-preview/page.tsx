import { notFound } from 'next/navigation';
import { REVISION_UNITS } from '@/data/revision-units';
import { generateRevisionPlan } from '@/services/revision/generator';
import { bundledRevisionNotesEngine } from '@/services/revision-notes/bundled-source';
import {
  buildStudyPack,
  renderDocumentModelToHtml,
  studyPackToDocumentModel,
} from '@/services/study-pack';
import type { DiagnosticResult } from '@/types/diagnostic';

const SAMPLE_DIAGNOSTIC_RESULT: DiagnosticResult = {
  responses: [],
  competencyMastery: [
    {
      competencyId: 'calcul-litteral',
      competencyLabel: 'Calcul littéral',
      pointsEarned: 1,
      pointsPossible: 3,
      masteryPercent: 33,
      readinessLevel: 'priority',
      confidence: 'low',
    },
    {
      competencyId: 'equations',
      competencyLabel: 'Équations',
      pointsEarned: 2,
      pointsPossible: 3,
      masteryPercent: 55,
      readinessLevel: 'in-progress',
      confidence: 'medium',
    },
    {
      competencyId: 'fonctions-lineaires',
      competencyLabel: 'Fonctions linéaires',
      pointsEarned: 3,
      pointsPossible: 3,
      masteryPercent: 85,
      readinessLevel: 'mastered',
      confidence: 'high',
    },
  ],
  readinessScore: 58,
  readinessLevel: 'in-progress',
  strengths: [
    {
      competencyId: 'fonctions-lineaires',
      competencyLabel: 'Fonctions linéaires',
      pointsEarned: 3,
      pointsPossible: 3,
      masteryPercent: 85,
      readinessLevel: 'mastered',
      confidence: 'high',
    },
  ],
  weaknesses: [
    {
      competencyId: 'calcul-litteral',
      competencyLabel: 'Calcul littéral',
      pointsEarned: 1,
      pointsPossible: 3,
      masteryPercent: 33,
      readinessLevel: 'priority',
      confidence: 'low',
    },
    {
      competencyId: 'equations',
      competencyLabel: 'Équations',
      pointsEarned: 2,
      pointsPossible: 3,
      masteryPercent: 55,
      readinessLevel: 'in-progress',
      confidence: 'medium',
    },
  ],
  revisionPriorities: [
    {
      competencyId: 'calcul-litteral',
      competencyLabel: 'Calcul littéral',
      masteryPercent: 33,
      readinessLevel: 'priority',
      explanation: 'Maîtrise estimée à 33 % : reprendre les bases avant la pratique autonome.',
      revisionExample: 'Développer et réduire 3(2x - 1) - 4(x + 2).',
    },
    {
      competencyId: 'equations',
      competencyLabel: 'Équations',
      masteryPercent: 55,
      readinessLevel: 'in-progress',
      explanation: 'Maîtrise estimée à 55 % : consolider la méthode.',
      revisionExample: 'Résoudre 3x + 5 = 2x - 1.',
    },
  ],
  totalEarnedPoints: 6,
  totalMaxPoints: 9,
  completedAt: '2026-08-04T09:00:00.000Z',
  phase: 'initial',
};

export default function StudyPackPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const revisionPlan = generateRevisionPlan({
    diagnosticId: 'diagnostic:dev-preview',
    diagnosticResult: SAMPLE_DIAGNOSTIC_RESULT,
    revisionUnits: REVISION_UNITS,
    studentName: 'Awa',
    generatedAt: '2026-08-04T09:00:00.000Z',
  });

  const studyPack = buildStudyPack({
    diagnosticResult: SAMPLE_DIAGNOSTIC_RESULT,
    revisionPlan,
    revisionUnits: REVISION_UNITS,
    allRevisionNotes: bundledRevisionNotesEngine.getRevisionNotes(),
    studentName: 'Awa',
    subjectLabel: 'Mathématiques',
    examLabel: "Brevet d'études du premier cycle (BEPC)",
    generatedAt: '2026-08-04T09:05:00.000Z',
  });

  const html = renderDocumentModelToHtml(studyPackToDocumentModel(studyPack));

  return (
    <iframe
      title="Aperçu du Study Pack"
      srcDoc={html}
      style={{ width: '100%', height: '100vh', border: 'none' }}
    />
  );
}
