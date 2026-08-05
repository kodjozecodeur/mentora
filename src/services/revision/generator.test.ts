import { describe, expect, it } from 'vitest';
import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionUnit } from '@/types/revision';
import { generateRevisionPlan } from './generator';

const unit = (competencyId: string, competencyLabel = competencyId): RevisionUnit => ({
  id: `unit-${competencyId}`,
  competencyId,
  competencyLabel,
  objective: `Objectif ${competencyLabel}`,
  prerequisites: [],
  estimatedMinutes: 20,
  activities: [
    {
      id: `read-${competencyId}`,
      type: 'read-note',
      label: 'Relire la notion essentielle',
      estimatedMinutes: 5,
      required: true,
    },
    {
      id: `practice-${competencyId}`,
      type: 'independent-practice',
      label: 'S’entraîner',
      estimatedMinutes: 15,
      required: true,
    },
  ],
  exitCriteria: [
    {
      type: 'minimum-score',
      target: 70,
      description: 'Obtenir au moins 70 % à la vérification.',
    },
  ],
  contentVersion: 'bepc-mathematiques.v1',
});

const diagnostic = (overrides: Partial<DiagnosticResult> = {}): DiagnosticResult => ({
  responses: [],
  competencyMastery: [],
  readinessScore: 0,
  readinessLevel: 'priority',
  strengths: [],
  weaknesses: [],
  revisionPriorities: [],
  totalEarnedPoints: 0,
  totalMaxPoints: 0,
  completedAt: '2026-08-04T10:00:00.000Z',
  phase: 'initial',
  ...overrides,
});

describe('generateRevisionPlan', () => {
  it('creates a deterministic plan ordered from weakest to strongest', () => {
    const result = generateRevisionPlan({
      diagnosticId: 'diagnostic-1',
      generatedAt: '2026-08-04T10:30:00.000Z',
      diagnosticResult: diagnostic({
        competencyMastery: [
          {
            competencyId: 'equations',
            competencyLabel: 'Équations',
            pointsEarned: 1,
            pointsPossible: 2,
            masteryPercent: 50,
            readinessLevel: 'in-progress',
            confidence: 'medium',
          },
          {
            competencyId: 'calcul-litteral',
            competencyLabel: 'Calcul littéral',
            pointsEarned: 0,
            pointsPossible: 2,
            masteryPercent: 0,
            readinessLevel: 'priority',
            confidence: 'high',
          },
          {
            competencyId: 'statistiques',
            competencyLabel: 'Statistiques',
            pointsEarned: 2,
            pointsPossible: 2,
            masteryPercent: 100,
            readinessLevel: 'mastered',
            confidence: 'high',
          },
        ],
        revisionPriorities: [
          {
            competencyId: 'calcul-litteral',
            competencyLabel: 'Calcul littéral',
            masteryPercent: 0,
            readinessLevel: 'priority',
            explanation: 'Explication diagnostic',
            revisionExample: 'Exemple diagnostic',
          },
          {
            competencyId: 'equations',
            competencyLabel: 'Équations',
            masteryPercent: 50,
            readinessLevel: 'in-progress',
            explanation: 'Explication diagnostic',
            revisionExample: 'Exemple diagnostic',
          },
        ],
      }),
      revisionUnits: [unit('equations', 'Équations'), unit('calcul-litteral', 'Calcul littéral')],
    });

    expect(result).toMatchObject({
      id: 'revision-plan:diagnostic-1:revision-plan.v1:bepc-mathematiques.v1',
      diagnosticId: 'diagnostic-1',
      generatedAt: '2026-08-04T10:30:00.000Z',
      algorithmVersion: 'revision-plan.v1',
      contentVersion: 'bepc-mathematiques.v1',
      estimatedTotalMinutes: 40,
      estimatedDays: 2,
    });
    expect(result.sessions.map((session) => session.competencyId)).toEqual([
      'calcul-litteral',
      'equations',
    ]);
    expect(result.sessions[0]).toMatchObject({
      dayNumber: 1,
      order: 1,
      priorityLevel: 'critical',
      priorityReason:
        'Maîtrise estimée à 0 % avec une confiance élevée : reprendre les bases avant la pratique autonome.',
      masteryBefore: 0,
      targetMastery: 70,
      confidence: 'high',
      status: 'not-started',
      revisionUnitId: 'unit-calcul-litteral',
    });
    expect(result.sessions[1].dayNumber).toBe(2);
  });

  it('includes a mastered competency when its confidence is low', () => {
    const result = generateRevisionPlan({
      diagnosticId: 'diagnostic-2',
      generatedAt: '2026-08-04T10:30:00.000Z',
      diagnosticResult: diagnostic({
        competencyMastery: [
          {
            competencyId: 'fonctions-lineaires',
            competencyLabel: 'Fonctions linéaires',
            pointsEarned: 2,
            pointsPossible: 2,
            masteryPercent: 100,
            readinessLevel: 'mastered',
            confidence: 'low',
          },
        ],
      }),
      revisionUnits: [unit('fonctions-lineaires', 'Fonctions linéaires')],
    });

    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]).toMatchObject({
      priorityLevel: 'low',
      priorityReason:
        'Maîtrise estimée à 100 %, mais avec une confiance faible : une vérification est recommandée.',
      targetMastery: 90,
    });
  });

  it('falls back to low confidence when the current diagnostic result has no confidence field', () => {
    const result = generateRevisionPlan({
      diagnosticId: 'diagnostic-legacy',
      generatedAt: '2026-08-04T10:30:00.000Z',
      diagnosticResult: diagnostic({
        competencyMastery: [
          {
            competencyId: 'equations',
            competencyLabel: 'Équations',
            pointsEarned: 1,
            pointsPossible: 2,
            masteryPercent: 50,
            readinessLevel: 'in-progress',
          },
        ],
      }),
      revisionUnits: [unit('equations', 'Équations')],
    });

    expect(result.sessions[0].confidence).toBe('low');
  });

  it('fails explicitly when a required revision unit is missing', () => {
    expect(() =>
      generateRevisionPlan({
        diagnosticId: 'diagnostic-3',
        diagnosticResult: diagnostic({
          competencyMastery: [
            {
              competencyId: 'theoreme-thales',
              competencyLabel: 'Théorème de Thalès',
              pointsEarned: 0,
              pointsPossible: 2,
              masteryPercent: 0,
              readinessLevel: 'priority',
            },
          ],
        }),
        revisionUnits: [],
      }),
    ).toThrow('Aucune unité de révision trouvée pour la compétence « theoreme-thales »');
  });

  it('returns an empty plan when all competencies are mastered with sufficient confidence', () => {
    const result = generateRevisionPlan({
      diagnosticId: 'diagnostic-4',
      diagnosticResult: diagnostic({
        competencyMastery: [
          {
            competencyId: 'statistiques',
            competencyLabel: 'Statistiques',
            pointsEarned: 2,
            pointsPossible: 2,
            masteryPercent: 100,
            readinessLevel: 'mastered',
            confidence: 'high',
          },
        ],
      }),
      revisionUnits: [unit('statistiques', 'Statistiques')],
    });

    expect(result.sessions).toEqual([]);
    expect(result.estimatedTotalMinutes).toBe(0);
    expect(result.estimatedDays).toBe(0);
  });
});
