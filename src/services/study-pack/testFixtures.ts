import type {
  CompetencyMastery,
  DiagnosticResult,
  RevisionRecommendation,
} from '@/types/diagnostic';
import type { RevisionPlan, RevisionUnit } from '@/types/revision';
import type { RevisionNote } from '@/services/revision-notes/types';
import type { BuildStudyPackInput } from '@/types/study-pack';

const masteryCalculLitteral: CompetencyMastery = {
  competencyId: 'calcul-litteral',
  competencyLabel: 'Calcul littéral',
  pointsEarned: 1,
  pointsPossible: 3,
  masteryPercent: 33,
  readinessLevel: 'priority',
};

const masteryEquations: CompetencyMastery = {
  competencyId: 'equations',
  competencyLabel: 'Équations',
  pointsEarned: 3,
  pointsPossible: 3,
  masteryPercent: 100,
  readinessLevel: 'mastered',
};

const priorityCalculLitteral: RevisionRecommendation = {
  competencyId: 'calcul-litteral',
  competencyLabel: 'Calcul littéral',
  masteryPercent: 33,
  readinessLevel: 'priority',
  explanation: 'Explication test',
  revisionExample: 'Exemple test',
};

export const fixtureDiagnosticResult: DiagnosticResult = {
  responses: [],
  competencyMastery: [masteryCalculLitteral, masteryEquations],
  readinessScore: 67,
  readinessLevel: 'in-progress',
  strengths: [masteryEquations],
  weaknesses: [masteryCalculLitteral],
  revisionPriorities: [priorityCalculLitteral],
  totalEarnedPoints: 4,
  totalMaxPoints: 6,
  completedAt: '2026-08-04T10:00:00.000Z',
};

const revisionUnitCalculLitteral: RevisionUnit = {
  id: 'revision-unit:calcul-litteral',
  competencyId: 'calcul-litteral',
  competencyLabel: 'Calcul littéral',
  objective: 'Développer et réduire correctement une expression.',
  prerequisites: [],
  estimatedMinutes: 20,
  activities: [],
  exitCriteria: [
    {
      type: 'consecutive-success',
      target: 2,
      description: 'Réussir deux exercices consécutifs de calcul littéral.',
    },
  ],
  contentVersion: '1.0.0',
};

const revisionUnitEquations: RevisionUnit = {
  id: 'revision-unit:equations',
  competencyId: 'equations',
  competencyLabel: 'Équations',
  objective: 'Résoudre une équation du premier degré à une inconnue.',
  prerequisites: [],
  estimatedMinutes: 15,
  activities: [],
  exitCriteria: [
    {
      type: 'consecutive-success',
      target: 2,
      description: 'Réussir deux exercices consécutifs sur les équations.',
    },
  ],
  contentVersion: '1.0.0',
};

export const fixtureRevisionUnits: RevisionUnit[] = [
  revisionUnitCalculLitteral,
  revisionUnitEquations,
];

export const fixtureRevisionPlan: RevisionPlan = {
  id: 'revision-plan:diagnostic:test:study-pack.v1:1.0.0',
  diagnosticId: 'diagnostic:test',
  studentName: 'Awa',
  generatedAt: '2026-08-04T10:05:00.000Z',
  algorithmVersion: 'revision-plan.v1',
  contentVersion: '1.0.0',
  estimatedTotalMinutes: 20,
  estimatedDays: 1,
  sessions: [
    {
      id: 'revision-session:diagnostic:test:1',
      dayNumber: 1,
      order: 1,
      competencyId: 'calcul-litteral',
      competencyLabel: 'Calcul littéral',
      priorityLevel: 'critical',
      priorityReason: 'Raison test',
      estimatedMinutes: 20,
      masteryBefore: 33,
      targetMastery: 70,
      confidence: 'low',
      revisionUnitId: 'revision-unit:calcul-litteral',
      exitCriteria: [
        {
          type: 'consecutive-success',
          target: 2,
          description: 'Réussir deux exercices consécutifs de calcul littéral.',
        },
      ],
      status: 'not-started',
    },
  ],
};

const revisionSessionCalculLitteral = fixtureRevisionPlan.sessions[0];

const revisionSessionEquations: RevisionPlan['sessions'][number] = {
  id: 'revision-session:diagnostic:test:2',
  dayNumber: 2,
  order: 2,
  competencyId: 'equations',
  competencyLabel: 'Équations',
  priorityLevel: 'medium',
  priorityReason: 'Raison test équations',
  estimatedMinutes: 15,
  masteryBefore: 100,
  targetMastery: 100,
  confidence: 'high',
  revisionUnitId: 'revision-unit:equations',
  exitCriteria: [
    {
      type: 'consecutive-success',
      target: 2,
      description: 'Réussir deux exercices consécutifs sur les équations.',
    },
  ],
  status: 'not-started',
};

export const fixtureRevisionPlanWithTwoSessions: RevisionPlan = {
  ...fixtureRevisionPlan,
  estimatedTotalMinutes: 35,
  estimatedDays: 2,
  sessions: [revisionSessionCalculLitteral, revisionSessionEquations],
};

export const fixtureRevisionNotes: RevisionNote[] = [
  {
    id: 'calcul-litteral',
    competencyId: 'calcul-litteral',
    title: 'Calcul littéral',
    subject: 'Mathématiques',
    exam: 'BEPC',
    curriculumVersion: '2026',
    contentVersion: '1.0.0',
    teacherValidated: false,
    estimatedReadingMinutes: 8,
    difficulty: 'beginner',
    updatedAt: '2026-08-04',
    sections: [
      {
        id: 'comprendre-simplement',
        title: 'Comprendre simplement',
        order: 1,
        content:
          "Une expression littérale contient des nombres, des lettres et des opérations.\n\nDévelopper, c'est **distribuer**.",
      },
    ],
    workedExample: {
      title: 'Exemple concret',
      problem: 'Développer `3(2x - 1)`.',
      steps: ['Distribuer 3 : `6x - 3`.'],
      conclusion: '`3(2x - 1) = 6x - 3`.',
    },
    commonMistakes: [
      {
        title: 'Oublier un terme',
        error: 'Distribuer le facteur seulement au premier terme.',
        whyItHappens: 'On lit la parenthèse trop vite.',
        howToAvoid: 'Relier le facteur à chacun des termes.',
      },
    ],
    keyTakeaways: ['Distribuer le facteur à chaque terme.'],
    miniExercises: [
      {
        id: 'calcul-litteral-exercise-1',
        order: 1,
        statement: 'Développer `2(x + 3) - x`.',
        answer: '`x + 6`.',
        correction: '`2(x + 3) - x = 2x + 6 - x = x + 6`.',
      },
      {
        id: 'calcul-litteral-exercise-2',
        order: 2,
        statement: 'Développer `5(x - 2) - 2(x + 1)`.',
        answer: '`3x - 12`.',
        correction: '`5x - 10 - 2x - 2 = 3x - 12`.',
      },
    ],
  },
];

const fixtureRevisionNoteEquations: RevisionNote = {
  id: 'equations',
  competencyId: 'equations',
  title: 'Équations',
  subject: 'Mathématiques',
  exam: 'BEPC',
  curriculumVersion: '2026',
  contentVersion: '1.0.0',
  teacherValidated: false,
  estimatedReadingMinutes: 6,
  difficulty: 'beginner',
  updatedAt: '2026-08-04',
  sections: [
    {
      id: 'comprendre-simplement',
      title: 'Comprendre simplement',
      order: 1,
      content:
        "Une équation exprime une égalité entre deux quantités.\n\nRésoudre, c'est **isoler** l'inconnue.",
    },
  ],
  workedExample: {
    title: 'Exemple concret',
    problem: 'Résoudre `2x + 3 = 9`.',
    steps: ['Soustraire 3 : `2x = 6`.', 'Diviser par 2 : `x = 3`.'],
    conclusion: '`2x + 3 = 9` a pour solution `x = 3`.',
  },
  commonMistakes: [
    {
      title: 'Oublier de changer de signe',
      error: 'Faire passer un terme sans changer son signe.',
      whyItHappens: "On confond avec l'opération inverse.",
      howToAvoid: "Toujours changer le signe en changeant de côté de l'égalité.",
    },
  ],
  keyTakeaways: ["Isoler l'inconnue en appliquant la même opération des deux côtés."],
  miniExercises: [
    {
      id: 'equations-exercise-1',
      order: 1,
      statement: 'Résoudre `3x - 4 = 11`.',
      answer: '`x = 5`.',
      correction: '`3x - 4 = 11 → 3x = 15 → x = 5`.',
    },
  ],
};

export const fixtureRevisionNotesForTwoSessions: RevisionNote[] = [
  fixtureRevisionNoteEquations,
  ...fixtureRevisionNotes,
];

export const fixtureBuildStudyPackInput: BuildStudyPackInput = {
  diagnosticResult: fixtureDiagnosticResult,
  revisionPlan: fixtureRevisionPlan,
  revisionUnits: fixtureRevisionUnits,
  allRevisionNotes: fixtureRevisionNotes,
  studentName: 'Awa',
  subjectLabel: 'Mathématiques',
  examLabel: "Brevet d'études du premier cycle (BEPC)",
  generatedAt: '2026-08-04T10:10:00.000Z',
  algorithmVersion: 'study-pack.v1',
};
