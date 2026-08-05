# Mentora AI — Repositionnement produit (BEPC-prep → répétiteur intelligent) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe Mentora AI's copy and information hierarchy from "outil de préparation au BEPC" to "répétiteur intelligent qui prolonge le travail du professeur après les cours", without touching the diagnostic engine, scoring, persistence, or design system.

**Architecture:** This app has no URL routing beyond `/` — it's a single state-machine SPA (`OnboardingFlow.tsx`, a `switch(step)`) plus an in-shell tab nav (`AppShell.tsx`). There is no i18n/content-config layer; copy lives inline in JSX, with one existing precedent for a shared copy module: `src/features/diagnostic/resultCopy.ts`. This plan extends that existing pattern (adds pure functions to `resultCopy.ts`) rather than introducing a new content system — per the spec's explicit constraint not to build a parallel system.

**Tech Stack:** Next.js (client-only SPA shell), React, TypeScript, Vitest, Tailwind.

## Global Constraints

- Ne pas modifier les couleurs, les polices, ni le design system.
- Ne pas introduire de nouvelle dépendance.
- Ne pas faire de refactor massif ; changements petits, lisibles, réversibles.
- Ne pas supprimer de fonctionnalité existante, ne pas casser le diagnostic, la restauration de session (`useDiagnosticSession`, `OnboardingFlow.tsx` restore-on-mount effects), ni le flow onboarding.
- Ne pas modifier `src/services/diagnostic/scoring.ts`, `engine.ts`, `storage.ts`, ni `src/services/revision/*` business logic — presentation layer only.
- Tutoiement partout. Bannir : Faible, Mauvais résultat, Échec, Insuffisant, Lacunes graves, Verdict, Niveau critique, "Tu n'es pas prêt".
- Aucun test render (`*.test.tsx`) n'existe dans ce repo — seule la logique pure est testée (Vitest). Les tâches "copy only" ci-dessous n'ont donc pas de cycle red/green ; leur vérification est `npm run test`, `npm run lint`, `npm run format:check` + smoke manuel (voir Validation Technique du spec).
- Chaque tâche se termine par un commit séparé.

---

## Décisions et hors-scope (à confirmer avec l'utilisateur avant exécution)

Le spec laisse volontairement de la place au jugement produit dans deux cas ; ce plan tranche comme suit — à valider :

1. **Sélecteur d'"objectif" en onboarding** (spec §3) : ajouter un vrai écran de sélection d'objectif (Mieux comprendre mes cours / M'améliorer en maths / Préparer le BEPC) demanderait un nouveau step dans la state machine (`OnboardingFlow.tsx`) + un nouveau champ de données — ce n'est pas un simple changement de texte, et le spec offre lui-même l'échappatoire : _"conserver temporairement la valeur existante et modifier uniquement l'affichage."_ → **Reporté en "points en attente"**, car il n'y a aucun texte/affichage existant représentant un "objectif" à reformuler sans construire un nouvel écran (ce qui sort du périmètre "ne pas refaire l'interface").
2. **"Écran splash"** (spec §2) : aucun écran splash dédié n'existe. `WelcomeScreen.tsx` est à la fois le premier écran ET le formulaire de saisie du prénom. → Ce plan ajoute le tagline produit ("Continue d'apprendre après les cours.") **au-dessus** du champ prénom existant, sans toucher au champ/CTA fonctionnel (le CTA reste "Continuer", pas "Commencer", car il valide une saisie).
3. **État vide de l'accueil** (spec §4) : le texte suggéré _"Commence par vérifier ce que tu as compris en mathématiques"_ correspond à un utilisateur qui n'a pas encore fait de diagnostic — un état **impossible** dans ce codebase (`HomeScreen` n'est rendu qu'après un diagnostic complété, cf. `OnboardingFlow.tsx:92-97`). L'état vide actuel du composant signifie en réalité "plan de révision terminé" — un cas différent. → Ce plan ne remplace pas ce texte par celui du spec (ce serait un contresens) ; il ne fait qu'un ajustement de ton mineur, documenté au Task 5.
4. **Statuts de "Progression"** (spec §9) : `RevisionPlanScreen`'s `StatusBadge` (Terminée/En cours/Verrouillée/À commencer) encode un état de **workflow de session** (verrouillage séquentiel), pas un niveau de **maîtrise**. Les forcer vers Maîtrisé/En apprentissage/À renforcer serait trompeur (une session "Verrouillée" n'est pas "à renforcer"). → La demande spec de labels Maîtrisé/En apprentissage/À renforcer est satisfaite ailleurs, là où la donnée est réellement une maîtrise : les écrans de résultats (Task 3-4) et la carte d'accueil (Task 5), qui utilisent `CompetencyMastery.readinessLevel`. `RevisionPlanScreen` garde ses labels de statut de session tels quels — reporté en "points en attente" si le produit veut vraiment les fusionner.
5. **Regroupement "Préparation au BEPC"** (spec §11) : pas de nouvelle section — l'onglet "Diagnostic" existant (score + compétences + faiblesses) est renommé conceptuellement "Préparation au BEPC" (Task 7), conformément à _"garder les routes existantes et simplement modifier les titres et points d'entrée."_

---

## File Structure

Fichiers modifiés (aucun nouveau fichier créé) :

- `src/features/onboarding/WelcomeScreen.tsx` — tagline produit ajoutée
- `src/features/onboarding/DiagnosticIntroScreen.tsx` — titre/description repositionnés
- `src/features/onboarding/PreparingScreen.tsx` — messages de chargement repositionnés
- `src/features/diagnostic/DiagnosticAnalysisScreen.tsx` — messages d'analyse repositionnés
- `src/features/diagnostic/resultCopy.ts` — nouvelles fonctions pures : `partitionByReadinessLevel`, `getMasteryStatusLabel`, `PROGRESSION_GLOBALE_LABEL`, `PREPARATION_BEPC_LABEL`
- `src/features/diagnostic/resultCopy.test.ts` — tests pour les nouvelles fonctions
- `src/features/diagnostic/DiagnosticCompleteScreen.tsx` — sections réordonnées (maîtrise avant score)
- `src/features/diagnostic/FinalDiagnosticResultScreen.tsx` — idem
- `src/features/app-shell/HomeScreen.tsx` — "Objectif du jour" → "Continuer mon apprentissage", carte principale restructurée
- `src/features/app-shell/DiagnosticScreen.tsx` — "Mon diagnostic" → "Préparation au BEPC", score en secondaire
- `src/components/app-shell/BottomNavigation.tsx` — label d'onglet "Diagnostic" → "Préparation BEPC"
- `src/features/app-shell/AppShell.tsx` — `getTabTitle('diagnostic')` aligné
- `src/features/revision/RevisionPlanScreen.tsx` — titre "Mon plan personnalisé" → "Mon parcours"

---

### Task 1: Splash/bienvenue + intro diagnostic (Priorité 1)

**Files:**

- Modify: `src/features/onboarding/WelcomeScreen.tsx:38-40`
- Modify: `src/features/onboarding/DiagnosticIntroScreen.tsx:27-31`

**Interfaces:** Aucune — copy only, props inchangées.

- [ ] **Step 1: Ajouter le tagline produit sur `WelcomeScreen.tsx`**

Dans `src/features/onboarding/WelcomeScreen.tsx`, remplacer (lignes 38-40) :

```tsx
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12">
        <AppLogo size="lg" />
        <h1 className="text-center text-2xl font-bold text-foreground">Quel est ton nom ?</h1>
```

par :

```tsx
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12">
        <AppLogo size="lg" />
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-muted text-sm font-bold">Continue d&apos;apprendre après les cours.</p>
          <p className="text-muted max-w-[280px] text-sm font-medium">
            Retrouve les notions vues en classe, comprends-les à ton rythme et progresse avec
            Mentora AI.
          </p>
        </div>
        <h1 className="text-center text-2xl font-bold text-foreground">Quel est ton nom ?</h1>
```

- [ ] **Step 2: Repositionner l'intro du diagnostic**

Dans `src/features/onboarding/DiagnosticIntroScreen.tsx`, remplacer (lignes 27-31) :

```tsx
        <h1 className="text-foreground text-2xl font-bold">{subjectLabel}</h1>
        <p className="text-muted text-base font-medium">
          Nous allons commencer par un diagnostic pour comprendre ton niveau actuel en{' '}
          {subjectLabel.toLowerCase()}.
        </p>
```

par :

```tsx
        <h1 className="text-foreground text-2xl font-bold">Vérifions ensemble</h1>
        <p className="text-muted text-base font-medium">
          Réponds à quelques questions sur {subjectLabel.toLowerCase()} pour permettre à Mentora
          d&apos;identifier ce que tu maîtrises déjà et ce que tu dois encore renforcer.
        </p>
```

(Le CTA `Commencer` ligne 35 est déjà conforme au spec — inchangé.)

- [ ] **Step 3: Vérifier**

Run: `npm run lint && npm run format:check`
Expected: no errors.

Run: `npm run dev`, ouvrir l'app, vérifier visuellement l'écran de bienvenue et l'intro diagnostic (nom → matière → intro).

- [ ] **Step 4: Commit**

```bash
git add src/features/onboarding/WelcomeScreen.tsx src/features/onboarding/DiagnosticIntroScreen.tsx
git commit -m "feat(onboarding): reposition welcome and diagnostic-intro copy toward tutoring framing"
```

---

### Task 2: Écrans de chargement (Priorité 1)

**Files:**

- Modify: `src/features/onboarding/PreparingScreen.tsx:8-13,84-85`
- Modify: `src/features/diagnostic/DiagnosticAnalysisScreen.tsx:11-16,73-76,121`

**Interfaces:** Aucune — copy only.

- [ ] **Step 1: Reformuler `PREPARATION_MESSAGES` et le titre de `PreparingScreen.tsx`**

Remplacer (lignes 8-13) :

```tsx
const PREPARATION_MESSAGES = [
  'Analyse du programme de mathématiques…',
  'Sélection des compétences à évaluer…',
  'Préparation de tes exercices…',
  'Ton évaluation est presque prête.',
];
```

par :

```tsx
const PREPARATION_MESSAGES = [
  'Nous préparons ton parcours…',
  'Sélection des compétences à vérifier…',
  'Préparation de tes exercices…',
  'Ton accompagnement personnalisé arrive.',
];
```

Remplacer (ligne 84) :

```tsx
<h1 className="text-foreground text-2xl font-bold">Nous préparons ton évaluation…</h1>
```

par :

```tsx
<h1 className="text-foreground text-2xl font-bold">Nous préparons ton parcours…</h1>
```

- [ ] **Step 2: Reformuler `ANALYSIS_STEPS` et le message de fin de `DiagnosticAnalysisScreen.tsx`**

Remplacer (lignes 11-16) :

```tsx
const ANALYSIS_STEPS = [
  'Calcul de ton niveau de préparation…',
  'Analyse de tes compétences…',
  'Identification de tes points forts…',
  'Préparation de tes priorités de révision…',
];
```

par :

```tsx
const ANALYSIS_STEPS = [
  'Nous analysons tes réponses…',
  'Nous identifions les notions à renforcer…',
  'Identification de tes points forts…',
  'Construction de ton parcours personnalisé…',
];
```

Le titre (ligne 73, `"Nous analysons tes réponses…"`) et le sous-titre (ligne 74-76, `"Mentora prépare ton bilan personnalisé."`) sont déjà conformes — inchangés. Le message final ligne 121 (`"Ton bilan est prêt !"`) reste inchangé (ton neutre, pas de verdict).

- [ ] **Step 3: Vérifier**

Run: `npm run lint && npm run format:check`
Expected: no errors.

Manuel : lancer un diagnostic complet, observer les deux écrans de chargement (préparation avant les questions, analyse après la dernière question).

- [ ] **Step 4: Commit**

```bash
git add src/features/onboarding/PreparingScreen.tsx src/features/diagnostic/DiagnosticAnalysisScreen.tsx
git commit -m "feat(diagnostic): reword loading screens away from exam-scoring language"
```

---

### Task 3: `resultCopy.ts` — helpers de regroupement par maîtrise (Priorité 1, TDD)

**Files:**

- Modify: `src/features/diagnostic/resultCopy.ts`
- Test: `src/features/diagnostic/resultCopy.test.ts`

**Interfaces:**

- Consumes: `CompetencyMastery`, `ReadinessLevel` from `@/types/diagnostic` (already imported in `resultCopy.ts`).
- Produces (used by Task 4 and Task 5):
  - `partitionByReadinessLevel(mastery: CompetencyMastery[]): { mastered: CompetencyMastery[]; inProgress: CompetencyMastery[]; priority: CompetencyMastery[] }` — mastered sorted by masteryPercent descending, inProgress/priority sorted ascending (weakest first, mirrors existing `rankRevisionPriorities` ordering).
  - `getMasteryStatusLabel(level: ReadinessLevel): string` — `'mastered' → 'Maîtrisé'`, `'in-progress' → 'En apprentissage'`, `'priority' → 'À renforcer'`.
  - `PROGRESSION_GLOBALE_LABEL = 'Progression globale'`
  - `PREPARATION_BEPC_LABEL = 'Préparation au BEPC'`

- [ ] **Step 1: Write the failing tests**

Append to `src/features/diagnostic/resultCopy.test.ts` (add `partitionByReadinessLevel`, `getMasteryStatusLabel`, `PROGRESSION_GLOBALE_LABEL`, `PREPARATION_BEPC_LABEL` to the existing import on line 2-7):

```ts
import {
  getGreeting,
  getMasteryStatusLabel,
  getReadinessLevelLabel,
  getReadinessMessage,
  getWeaknessBadgeLabel,
  partitionByReadinessLevel,
  PREPARATION_BEPC_LABEL,
  PROGRESSION_GLOBALE_LABEL,
} from './resultCopy';
import type { CompetencyMastery } from '@/types/diagnostic';
```

Then append at the end of the file:

```ts
function mastery(overrides: Partial<CompetencyMastery>): CompetencyMastery {
  return {
    competencyId: 'c1',
    competencyLabel: 'Compétence',
    pointsEarned: 0,
    pointsPossible: 10,
    masteryPercent: 0,
    readinessLevel: 'priority',
    ...overrides,
  };
}

describe('partitionByReadinessLevel', () => {
  it('splits competencies into mastered, in-progress and priority buckets', () => {
    const input = [
      mastery({ competencyId: 'a', readinessLevel: 'mastered', masteryPercent: 80 }),
      mastery({ competencyId: 'b', readinessLevel: 'in-progress', masteryPercent: 50 }),
      mastery({ competencyId: 'c', readinessLevel: 'priority', masteryPercent: 20 }),
    ];

    const result = partitionByReadinessLevel(input);

    expect(result.mastered.map((m) => m.competencyId)).toEqual(['a']);
    expect(result.inProgress.map((m) => m.competencyId)).toEqual(['b']);
    expect(result.priority.map((m) => m.competencyId)).toEqual(['c']);
  });

  it('orders mastered competencies strongest-first', () => {
    const input = [
      mastery({ competencyId: 'a', readinessLevel: 'mastered', masteryPercent: 75 }),
      mastery({ competencyId: 'b', readinessLevel: 'mastered', masteryPercent: 95 }),
    ];

    expect(partitionByReadinessLevel(input).mastered.map((m) => m.competencyId)).toEqual([
      'b',
      'a',
    ]);
  });

  it('orders in-progress and priority competencies weakest-first', () => {
    const input = [
      mastery({ competencyId: 'a', readinessLevel: 'priority', masteryPercent: 30 }),
      mastery({ competencyId: 'b', readinessLevel: 'priority', masteryPercent: 10 }),
    ];

    expect(partitionByReadinessLevel(input).priority.map((m) => m.competencyId)).toEqual([
      'b',
      'a',
    ]);
  });
});

describe('getMasteryStatusLabel', () => {
  it('labels each readiness level', () => {
    expect(getMasteryStatusLabel('mastered')).toBe('Maîtrisé');
    expect(getMasteryStatusLabel('in-progress')).toBe('En apprentissage');
    expect(getMasteryStatusLabel('priority')).toBe('À renforcer');
  });
});

describe('progression labels', () => {
  it('exposes the repositioned score labels', () => {
    expect(PROGRESSION_GLOBALE_LABEL).toBe('Progression globale');
    expect(PREPARATION_BEPC_LABEL).toBe('Préparation au BEPC');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/diagnostic/resultCopy.test.ts`
Expected: FAIL — `partitionByReadinessLevel`, `getMasteryStatusLabel`, `PROGRESSION_GLOBALE_LABEL`, `PREPARATION_BEPC_LABEL` are not exported.

- [ ] **Step 3: Implement**

In `src/features/diagnostic/resultCopy.ts`, replace line 1:

```ts
import type { ReadinessLevel } from '@/types/diagnostic';
```

with:

```ts
import type { CompetencyMastery, ReadinessLevel } from '@/types/diagnostic';
```

Append at the end of the file:

```ts
export const PROGRESSION_GLOBALE_LABEL = 'Progression globale';
export const PREPARATION_BEPC_LABEL = 'Préparation au BEPC';

export function getMasteryStatusLabel(level: ReadinessLevel): string {
  if (level === 'mastered') return 'Maîtrisé';
  if (level === 'in-progress') return 'En apprentissage';
  return 'À renforcer';
}

function byMasteryPercent(order: 'asc' | 'desc') {
  return (a: CompetencyMastery, b: CompetencyMastery) =>
    order === 'asc'
      ? a.masteryPercent - b.masteryPercent || a.competencyId.localeCompare(b.competencyId)
      : b.masteryPercent - a.masteryPercent || a.competencyId.localeCompare(b.competencyId);
}

export function partitionByReadinessLevel(mastery: CompetencyMastery[]): {
  mastered: CompetencyMastery[];
  inProgress: CompetencyMastery[];
  priority: CompetencyMastery[];
} {
  return {
    mastered: mastery.filter((m) => m.readinessLevel === 'mastered').sort(byMasteryPercent('desc')),
    inProgress: mastery
      .filter((m) => m.readinessLevel === 'in-progress')
      .sort(byMasteryPercent('asc')),
    priority: mastery.filter((m) => m.readinessLevel === 'priority').sort(byMasteryPercent('asc')),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/diagnostic/resultCopy.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/features/diagnostic/resultCopy.ts src/features/diagnostic/resultCopy.test.ts
git commit -m "feat(diagnostic): add mastery-bucket partitioning and progression labels to resultCopy"
```

---

### Task 4: Écrans de résultats — maîtrise avant score (Priorité 1)

**Files:**

- Modify: `src/features/diagnostic/DiagnosticCompleteScreen.tsx`
- Modify: `src/features/diagnostic/FinalDiagnosticResultScreen.tsx`

**Interfaces:**

- Consumes: `partitionByReadinessLevel`, `PROGRESSION_GLOBALE_LABEL` from `./resultCopy` (Task 3).
- `CompetencyRow` (already defined in both files) keeps its existing signature — `badgeTone: 'mastered' | 'priority' | 'in-progress'`.

- [ ] **Step 1: Reorder `DiagnosticCompleteScreen.tsx`**

Replace the import line 8:

```tsx
import { getGreeting, getReadinessMessage, getWeaknessBadgeLabel } from './resultCopy';
```

with:

```tsx
import { getGreeting, PROGRESSION_GLOBALE_LABEL, partitionByReadinessLevel } from './resultCopy';
```

Replace lines 21-52 (the two `const top...` lines plus the ring block) — old:

```tsx
  const topStrengths = result.strengths.slice(0, 3);
  const topWeaknesses = result.weaknesses.slice(0, 3);
  const topPriority = result.revisionPriorities[0];

  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <div className="flex flex-col items-center gap-2 pb-4 text-center">
        <AppLogo size="sm" />
        <p className="text-muted text-xs font-bold tracking-wide uppercase">
          Ton diagnostic est terminé
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 pb-6 text-center">
        <h1 className="text-foreground text-2xl font-bold">
          {getGreeting(firstName, result.readinessScore)}
        </h1>
        <p className="text-muted text-base font-medium">
          Voici ton niveau de préparation au BEPC en mathématiques.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 pb-8 text-center">
        <ReadinessScoreRing score={result.readinessScore} />
        <p className="text-foreground text-sm font-bold">Niveau de préparation</p>
        <p className="text-muted max-w-[280px] text-sm font-medium">
          {getReadinessMessage(result.readinessScore)}
        </p>
        <p className="text-muted text-sm font-semibold">
          {result.totalEarnedPoints} points sur {result.totalMaxPoints}
        </p>
      </div>
```

new:

```tsx
  const { mastered, inProgress, priority } = partitionByReadinessLevel(result.competencyMastery);
  const topMastered = mastered.slice(0, 3);
  const topInProgress = inProgress.slice(0, 3);
  const topPriority = priority.slice(0, 3);
  const nextRecommendation = result.revisionPriorities[0];

  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <div className="flex flex-col items-center gap-2 pb-4 text-center">
        <AppLogo size="sm" />
        <p className="text-muted text-xs font-bold tracking-wide uppercase">
          Ton diagnostic est terminé
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 pb-6 text-center">
        <h1 className="text-foreground text-2xl font-bold">
          {getGreeting(firstName, result.readinessScore)}
        </h1>
        <p className="text-muted text-base font-medium">
          Chaque notion renforcée te rapproche de la maîtrise et de la réussite au BEPC.
        </p>
      </div>
```

Replace the two sections "Tes points forts" (lines 54-74) and "À renforcer" (lines 76-98) — old:

```tsx
      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">Tes points forts</h2>
        {topStrengths.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topStrengths.map((strength) => (
              <CompetencyRow
                key={strength.competencyId}
                label={strength.competencyLabel}
                percent={strength.masteryPercent}
                badgeLabel="Maîtrisée"
                badgeTone="mastered"
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Aucune compétence n&apos;est encore totalement maîtrisée, mais ton plan va t&apos;aider
            à progresser.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">À renforcer</h2>
        {topWeaknesses.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topWeaknesses.map((weakness) => {
              const badgeLabel = getWeaknessBadgeLabel(weakness.readinessLevel);
              return (
                <CompetencyRow
                  key={weakness.competencyId}
                  label={weakness.competencyLabel}
                  percent={weakness.masteryPercent}
                  badgeLabel={badgeLabel}
                  badgeTone={badgeLabel === 'Prioritaire' ? 'priority' : 'in-progress'}
                />
              );
            })}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Bravo, aucune faiblesse identifiée pour l&apos;instant.
          </p>
        )}
      </section>
```

new:

```tsx
      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">Tu maîtrises déjà</h2>
        {topMastered.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topMastered.map((competency) => (
              <CompetencyRow
                key={competency.competencyId}
                label={competency.competencyLabel}
                percent={competency.masteryPercent}
                badgeLabel="Maîtrisé"
                badgeTone="mastered"
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Aucune compétence n&apos;est encore totalement maîtrisée, mais ton parcours va
            t&apos;aider à progresser.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">En cours d&apos;apprentissage</h2>
        {topInProgress.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topInProgress.map((competency) => (
              <CompetencyRow
                key={competency.competencyId}
                label={competency.competencyLabel}
                percent={competency.masteryPercent}
                badgeLabel="En apprentissage"
                badgeTone="in-progress"
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Rien en cours d&apos;apprentissage pour l&apos;instant.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">À renforcer</h2>
        {topPriority.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topPriority.map((competency) => (
              <CompetencyRow
                key={competency.competencyId}
                label={competency.competencyLabel}
                percent={competency.masteryPercent}
                badgeLabel="À renforcer"
                badgeTone="priority"
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Bravo, aucune notion prioritaire à renforcer pour l&apos;instant.
          </p>
        )}
      </section>
```

Replace the "Ta priorité" section (lines 100-121) — old:

```tsx
<section className="flex flex-col gap-3 pb-8">
  <h2 className="text-foreground text-lg font-bold">Ta priorité</h2>
  {topPriority ? (
    <div className="border-highlight bg-highlight/10 flex flex-col gap-1 rounded-2xl border-2 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-foreground text-base font-bold">{topPriority.competencyLabel}</span>
        <span className="text-highlight text-sm font-bold">{topPriority.masteryPercent}%</span>
      </div>
      <p className="text-foreground text-sm font-medium">
        Commence par cette compétence pour progresser plus rapidement.
      </p>
    </div>
  ) : (
    <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
      Tu as maîtrisé toutes les compétences évaluées.
    </p>
  )}
</section>
```

new:

```tsx
      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">Prochaine étape recommandée</h2>
        {nextRecommendation ? (
          <div className="border-highlight bg-highlight/10 flex flex-col gap-1 rounded-2xl border-2 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground text-base font-bold">
                {nextRecommendation.competencyLabel}
              </span>
              <span className="text-highlight text-sm font-bold">
                {nextRecommendation.masteryPercent}%
              </span>
            </div>
            <p className="text-foreground text-sm font-medium">
              Commence par cette compétence pour progresser plus rapidement.
            </p>
          </div>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Tu as maîtrisé toutes les compétences évaluées.
          </p>
        )}
      </section>

      <section className="flex flex-col items-center gap-2 pb-8 text-center">
        <ReadinessScoreRing score={result.readinessScore} />
        <p className="text-foreground text-sm font-bold">{PROGRESSION_GLOBALE_LABEL}</p>
        <p className="text-muted text-xs font-semibold">
          Préparation au BEPC — {result.totalEarnedPoints} points sur {result.totalMaxPoints}
        </p>
      </section>
```

- [ ] **Step 2: Apply the identical reorder to `FinalDiagnosticResultScreen.tsx`**

Same transformation, adapted to this file's absence of `revisionPriorities`/`topPriority` (there is no "Prochaine étape" section here per the existing Decision 9 comment — keep that omission). Replace import line 8:

```tsx
import { getGreeting, getReadinessMessage, getWeaknessBadgeLabel } from './resultCopy';
```

with:

```tsx
import { getGreeting, PROGRESSION_GLOBALE_LABEL, partitionByReadinessLevel } from './resultCopy';
```

Replace lines 23-53 (`topStrengths`/`topWeaknesses` + ring block) with the same pattern as Step 1 (partition + move ring to the bottom), keeping this file's subtitle text `"Voici ton niveau de préparation au BEPC en mathématiques après ta révision."` unchanged (still accurate — it's a post-revision comparison screen, not the first framing moment). Replace the "Tes points forts"/"À renforcer" sections (lines 55-98) with the same "Tu maîtrises déjà" / "En cours d'apprentissage" / "À renforcer" three-section pattern from Step 1, feeding `mastered`/`inProgress`/`priority` from `partitionByReadinessLevel(result.competencyMastery)`. Append the same `PROGRESSION_GLOBALE_LABEL` ring section at the end, before `<BottomCTA>`.

- [ ] **Step 3: Run tests and lint**

Run: `npm run test`
Expected: all existing suites still pass (no logic changed, only these two presentational components + the additive `resultCopy.ts` change from Task 3).

Run: `npm run lint`
Expected: no errors (watch for the now-unused `getReadinessMessage`/`getWeaknessBadgeLabel` imports — they're intentionally dropped from these two files; ESLint's unused-import rule would already have caught it if left in).

- [ ] **Step 4: Manual smoke**

Run: `npm run dev`, complete a diagnostic, confirm the result screen shows: "Tu maîtrises déjà" → "En cours d'apprentissage" → "À renforcer" → "Prochaine étape recommandée" → progression ring, in that order. Repeat for the final diagnostic (post-revision) path.

- [ ] **Step 5: Commit**

```bash
git add src/features/diagnostic/DiagnosticCompleteScreen.tsx src/features/diagnostic/FinalDiagnosticResultScreen.tsx
git commit -m "feat(diagnostic): reorder result screens to lead with mastery, score secondary"
```

---

### Task 5: Accueil — "Continuer mon apprentissage" (Priorité 1)

**Files:**

- Modify: `src/features/app-shell/HomeScreen.tsx`

**Interfaces:**

- Consumes: `getMasteryStatusLabel`, `PROGRESSION_GLOBALE_LABEL` from `@/features/diagnostic/resultCopy` (Task 3). `diagnosticResult.competencyMastery: CompetencyMastery[]` (already passed as a prop, type already imported).

- [ ] **Step 1: Rename the readiness card label**

Replace import line 6:

```tsx
import { getReadinessMessage } from '@/features/diagnostic/resultCopy';
```

with:

```tsx
import { getReadinessMessage, PROGRESSION_GLOBALE_LABEL } from '@/features/diagnostic/resultCopy';
```

Replace lines 52-54:

```tsx
<h2 id="home-readiness-title" className="text-foreground text-lg font-bold">
  Niveau actuel
</h2>
```

with:

```tsx
<h2 id="home-readiness-title" className="text-foreground text-lg font-bold">
  {PROGRESSION_GLOBALE_LABEL}
</h2>
```

- [ ] **Step 2: Restructure the main card — "Continuer mon apprentissage"**

Replace lines 61-103 — old:

```tsx
<section aria-labelledby="daily-goal-title" className="flex flex-col gap-3">
  <h2 id="daily-goal-title" className="sr-only">
    Objectif du jour
  </h2>

  {nextSession && nextUnit ? (
    <article className="border-primary flex flex-col gap-3 rounded-3xl border bg-amber-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-amber-800">
          <Flag className="size-4 fill-current" aria-hidden="true" />
          <span className="text-sm font-bold">Objectif du jour</span>
        </div>
        <span className="text-muted flex shrink-0 items-center gap-1 text-xs font-semibold">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {nextSession.estimatedMinutes} min
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-foreground min-w-0 text-xl font-extrabold wrap-break-word">
          {nextSession.competencyLabel}
        </h3>
        <p className="text-foreground/70 min-w-0 text-sm font-medium wrap-break-word">
          {nextUnit.objective}
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenRevision}
        className="border-border focus-visible:ring-highlight/40 text-foreground flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border bg-white text-sm font-bold focus-visible:ring-4 focus-visible:outline-none"
      >
        Voir les détails
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </article>
  ) : (
    <div className="bg-highlight/10 border-highlight flex items-center gap-3 rounded-3xl border-2 p-4">
      <CheckCircle2 className="text-highlight size-6 shrink-0" aria-hidden="true" />
      <p className="text-foreground text-sm font-semibold">
        Tu as terminé toutes les sessions de ton plan.
      </p>
    </div>
  )}
</section>
```

new:

```tsx
<section aria-labelledby="daily-goal-title" className="flex flex-col gap-3">
  <h2 id="daily-goal-title" className="text-foreground text-lg font-bold">
    Continuer mon apprentissage
  </h2>

  {nextSession && nextUnit ? (
    <article className="border-primary flex flex-col gap-3 rounded-3xl border bg-amber-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-amber-800">
          <Flag className="size-4 fill-current" aria-hidden="true" />
          <span className="text-sm font-bold">{subjectLabel}</span>
          <span className="text-xs font-bold">· {getMasteryStatusLabel(nextCompetencyStatus)}</span>
        </div>
        <span className="text-muted flex shrink-0 items-center gap-1 text-xs font-semibold">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {nextSession.estimatedMinutes} min
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-foreground min-w-0 text-xl font-extrabold wrap-break-word">
          {nextSession.competencyLabel}
        </h3>
        <p className="text-foreground/70 min-w-0 text-sm font-medium wrap-break-word">
          Continue là où tu t&apos;es arrêté.
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenRevision}
        className="border-border focus-visible:ring-highlight/40 text-foreground flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border bg-white text-sm font-bold focus-visible:ring-4 focus-visible:outline-none"
      >
        Continuer
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </article>
  ) : (
    <div className="bg-highlight/10 border-highlight flex items-center gap-3 rounded-3xl border-2 p-4">
      <CheckCircle2 className="text-highlight size-6 shrink-0" aria-hidden="true" />
      <p className="text-foreground text-sm font-semibold">
        Bravo, tu as terminé toutes les sessions de ton parcours actuel.
      </p>
    </div>
  )}
</section>
```

Add the status lookup right after the existing `revisionCtaLabel` block (after line 39, before the `return`):

```tsx
const nextCompetencyStatus =
  diagnosticResult.competencyMastery.find(
    (competency) => competency.competencyId === nextSession?.competencyId,
  )?.readinessLevel ?? 'priority';
```

Add `getMasteryStatusLabel` to the `resultCopy` import (combine with Step 1's import edit):

```tsx
import {
  getMasteryStatusLabel,
  getReadinessMessage,
  PROGRESSION_GLOBALE_LABEL,
} from '@/features/diagnostic/resultCopy';
```

- [ ] **Step 3: Run tests and lint**

Run: `npm run test -- appShellData` (data helpers this screen consumes are unchanged, but confirm no collateral breakage) and `npm run lint`.
Expected: pass, no errors. Note: `Flag` icon import (line 1) stays in use (still rendered); `nextUnit` prop stays declared in `HomeScreenProps` even though `nextUnit.objective` text is no longer displayed directly — do not remove the prop, `AppShell.tsx` still passes it and it may be used for the `onOpenRevision` target session lookup elsewhere. Verify with `npm run lint` that no `nextUnit`-unused warning appears (it's still used in the `nextSession && nextUnit` condition).

- [ ] **Step 4: Manual smoke**

Run: `npm run dev`, complete onboarding + diagnostic, check the Home tab shows "Continuer mon apprentissage" with matière + statut + compétence + "Continuer" CTA. Complete all revision sessions and confirm the completed-state message reads correctly.

- [ ] **Step 5: Commit**

```bash
git add src/features/app-shell/HomeScreen.tsx
git commit -m "feat(home): reframe daily-goal card as 'Continuer mon apprentissage' with mastery status"
```

---

### Task 6: Onglet Diagnostic — "Préparation au BEPC" (Priorité 1/2 — score secondaire + repositionnement titre)

**Files:**

- Modify: `src/features/app-shell/DiagnosticScreen.tsx`

**Interfaces:**

- Consumes: `PROGRESSION_GLOBALE_LABEL`, `PREPARATION_BEPC_LABEL` from `@/features/diagnostic/resultCopy` (Task 3).

- [ ] **Step 1: Rename header and score labels**

Replace import line 5:

```tsx
import { getReadinessMessage, getWeaknessBadgeLabel } from '@/features/diagnostic/resultCopy';
```

with:

```tsx
import {
  getReadinessMessage,
  getWeaknessBadgeLabel,
  PREPARATION_BEPC_LABEL,
  PROGRESSION_GLOBALE_LABEL,
} from '@/features/diagnostic/resultCopy';
```

Replace line 32:

```tsx
<h1 className="text-foreground text-2xl font-bold">Mon diagnostic</h1>
```

with:

```tsx
<h1 className="text-foreground text-2xl font-bold">{PREPARATION_BEPC_LABEL}</h1>
```

Replace lines 43-45:

```tsx
<h2 id="diagnostic-score-title" className="text-foreground text-base font-bold">
  Dernier score
</h2>
```

with:

```tsx
        <h2 id="diagnostic-score-title" className="text-foreground text-base font-bold">
          {PROGRESSION_GLOBALE_LABEL}
        </h2>
        <p className="text-muted text-xs font-semibold">{PREPARATION_BEPC_LABEL}</p>
```

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run format:check`
Expected: no errors.

Manuel : ouvrir l'onglet "Préparation BEPC" (ex-Diagnostic, renommé au Task 7) et vérifier l'affichage.

- [ ] **Step 3: Commit**

```bash
git add src/features/app-shell/DiagnosticScreen.tsx
git commit -m "feat(diagnostic-tab): reposition score as secondary under 'Préparation au BEPC'"
```

---

### Task 7: Point d'entrée secondaire "Préparation BEPC" (Priorité 2)

**Files:**

- Modify: `src/components/app-shell/BottomNavigation.tsx:12`
- Modify: `src/features/app-shell/AppShell.tsx:297`

**Interfaces:** Aucune — label only, `AppTab` union (`src/features/app-shell/types.ts`) inchangé (`'diagnostic'` id conservé, seul le libellé affiché change).

- [ ] **Step 1: Rename the nav label**

In `src/components/app-shell/BottomNavigation.tsx`, replace line 12:

```tsx
  { id: 'diagnostic', label: 'Diagnostic', icon: ClipboardCheck },
```

with:

```tsx
  { id: 'diagnostic', label: 'Préparation BEPC', icon: ClipboardCheck },
```

- [ ] **Step 2: Align `getTabTitle`**

In `src/features/app-shell/AppShell.tsx`, replace line 297:

```tsx
if (tab === 'diagnostic') return 'Diagnostic';
```

with:

```tsx
if (tab === 'diagnostic') return 'Préparation BEPC';
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run format:check`
Expected: no errors. Manuel : vérifier que le libellé de l'onglet dans la barre de navigation basse et l'en-tête de section correspondent.

- [ ] **Step 4: Commit**

```bash
git add src/components/app-shell/BottomNavigation.tsx src/features/app-shell/AppShell.tsx
git commit -m "feat(nav): rename Diagnostic tab to 'Préparation BEPC' as a secondary entry point"
```

---

### Task 8: Plan de révision → "Mon parcours" (Priorité 2)

**Files:**

- Modify: `src/features/revision/RevisionPlanScreen.tsx:45`

**Interfaces:** Aucune — titre uniquement, `RevisionPlanScreenProps` inchangé.

- [ ] **Step 1: Rename the screen title**

Replace line 45:

```tsx
<h1 className="text-foreground text-2xl font-bold">Mon plan personnalisé</h1>
```

with:

```tsx
<h1 className="text-foreground text-2xl font-bold">Mon parcours</h1>
```

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run format:check`
Expected: no errors. Manuel : ouvrir l'onglet Révision, vérifier le nouveau titre.

- [ ] **Step 3: Commit**

```bash
git add src/features/revision/RevisionPlanScreen.tsx
git commit -m "feat(revision): rename revision plan screen to 'Mon parcours'"
```

---

## Self-Review

**Spec coverage:**

- §1 Positionnement global → réalisé implicitement par l'ensemble des tâches (aucun écran ne se présente plus en premier lieu comme "test d'examen").
- §2 Splash/bienvenue → Task 1 (avec déviation documentée : pas de CTA "Commencer" séparé, cf. Décisions #2).
- §3 Onboarding/objectif → **reporté**, cf. Décisions #1.
- §4 Accueil → Task 5.
- §5 Diagnostic (intro) → Task 1.
- §6 Chargement → Task 2.
- §7 Résultats → Task 4.
- §8 Score de préparation → Task 3 (labels) + Task 4/5/6 (application).
- §9 Progression → couvert pour les écrans de résultats/accueil (Task 4/5) ; `RevisionPlanScreen` statuts de session laissés tels quels, cf. Décisions #4.
- §10 Plan de révision → Task 8.
- §11 Préparation BEPC → Task 7.
- §12 Ton rédactionnel → appliqué dans chaque tâche (vocabulaire "à renforcer/en apprentissage", pas de "verdict"/"échec").

**Placeholder scan:** aucun "TBD"/"handle it"/"similar to Task N" — chaque step contient le code exact à écrire ou le diff exact à appliquer.

**Type consistency:** `CompetencyMastery`, `ReadinessLevel` utilisés de façon cohérente entre Task 3 (définition) et Task 4/5 (consommation) ; `badgeTone: 'mastered' | 'priority' | 'in-progress'` de `CompetencyRow` déjà existant et réutilisé sans modification de signature.

---

## Points restant en attente (nécessitent une maquette ou une décision produit)

1. Sélecteur d'objectif en onboarding (Mieux comprendre mes cours / M'améliorer / Préparer le BEPC) — nécessite un nouveau step de state machine + décision sur la persistance de la donnée.
2. Regroupement visuel dédié "Préparation au BEPC" au-delà du renommage d'onglet (le spec accepte cette approche minimale pour ce sprint).
3. Fusion des statuts de session (`RevisionPlanScreen`) avec la taxonomie Maîtrisé/En apprentissage/À renforcer — actuellement deux taxonomies distinctes et sémantiquement différentes (workflow de session vs maîtrise) ; à trancher avec le produit avant de forcer un mapping.
4. Nouvelles maquettes du designer — l'ensemble de ce plan est un habillage texte/hiérarchie sur les composants existants, pas une refonte visuelle.
