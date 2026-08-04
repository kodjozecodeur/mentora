# Diagnostic Results Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `DiagnosticCompleteScreen` stub with a real, premium, mobile-first
results screen that answers "what's my level / strengths / weaknesses / top priority"
immediately, using only already-computed `DiagnosticResult` data.

**Architecture:** Two new pure, unit-testable logic units (`totalEarnedPoints`/
`totalMaxPoints` in the engine's result composition; greeting/message/badge copy helpers
in a new `resultCopy.ts`) feed a rewritten presentational `DiagnosticCompleteScreen`
component. `OnboardingFlow` forwards the already-collected first name into it. No new
dependencies; no scoring-algorithm changes.

**Tech Stack:** Next.js (App Router variant already in this repo), React 19, TypeScript,
Tailwind v4 theme tokens (`src/app/globals.css`), Vitest (`environment: 'node'`, no
DOM/testing-library available), existing `@/components/ui/*` atoms.

## Global Constraints

- Do not modify `computeCompetencyMastery`, `computeReadinessScore`, or
  `rankRevisionPriorities` (scoring algorithm) — only `engine.ts`'s result composition
  may gain two summed fields.
- Do not recompute anything in the UI component — all numbers come from `DiagnosticResult`
  or trivial display-only branching (score → message bucket) on a value already given.
- No new npm dependencies (no testing-library/jsdom, no charting lib, no icon lib beyond
  the already-installed `lucide-react`).
- Reuse existing design tokens only: `bg-background` (`#FDF2FF`), `bg-primary`/
  `text-primary-foreground` (`#F4CE1A`), `bg-highlight`/`text-highlight-foreground`
  (`#873694`), `text-foreground` (`#24152A`), `bg-surface`, `text-muted`, `bg-border`.
  Font is already wired (`Satoshi` via `--font-sans`). Do not add new colors.
- Reuse existing components: `ScreenContainer`, `BottomCTA`, `PrimaryButton`, `AppLogo`,
  `cn` from `@/lib/utils`. Do not create new shared UI atoms in `src/components/ui/`.
- Exact copy strings (French) are part of the contract — reproduce them verbatim,
  including the two empty-state strings decided in the design spec:
  - Strengths empty: `Aucune compétence n'est encore totalement maîtrisée, mais ton plan
    va t'aider à progresser.`
  - Weaknesses empty: `Bravo, aucune faiblesse identifiée pour l'instant.`
  - Priorities empty: `Tu as maîtrisé toutes les compétences évaluées.`
- No secondary "Revoir mes résultats" CTA (dropped per design spec — see
  `docs/superpowers/specs/2026-08-04-diagnostic-results-screen-design.md`).
- Lists (`strengths`, `weaknesses`) render at most 3 items via `.slice(0, 3)`, in the
  order the engine already provides (never re-sort).
- Design spec of record: `docs/superpowers/specs/2026-08-04-diagnostic-results-screen-design.md`.

---

### Task 1: Add `totalEarnedPoints`/`totalMaxPoints` to `DiagnosticResult`

**Files:**
- Modify: `src/types/diagnostic.ts:54-63` (the `DiagnosticResult` interface)
- Modify: `src/services/diagnostic/engine.ts:22-51` (`runDiagnosticEngine`)
- Test: `src/services/diagnostic/engine.test.ts:37-74` (existing test, extended)

**Interfaces:**
- Consumes: existing `CompetencyMastery` shape (`pointsEarned: number`,
  `pointsPossible: number`), already computed by `computeCompetencyMastery` (untouched).
- Produces: `DiagnosticResult.totalEarnedPoints: number`,
  `DiagnosticResult.totalMaxPoints: number` — consumed by Task 3's component.

- [ ] **Step 1: Extend the existing engine test with the new assertions**

Edit `src/services/diagnostic/engine.test.ts`, adding these two lines right after the
`result.revisionPriorities` assertion block (after the closing `]);` around line 68),
before the `expect(result.responses)` line:

```ts
    expect(result.totalEarnedPoints).toBe(2); // q1 correct (1pt) + q3 correct (1pt)
    expect(result.totalMaxPoints).toBe(3); // 3 questions, 1 point each
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/services/diagnostic/engine.test.ts`
Expected: FAIL — `result.totalEarnedPoints` is `undefined`, not `2`.

- [ ] **Step 3: Add the fields to the type**

In `src/types/diagnostic.ts`, update the `DiagnosticResult` interface (currently lines
54-63) to:

```ts
export interface DiagnosticResult {
  responses: DiagnosticResponse[];
  competencyMastery: CompetencyMastery[];
  readinessScore: number;
  readinessLevel: ReadinessLevel;
  strengths: CompetencyMastery[];
  weaknesses: CompetencyMastery[];
  revisionPriorities: RevisionRecommendation[];
  totalEarnedPoints: number;
  totalMaxPoints: number;
  completedAt: string;
}
```

- [ ] **Step 4: Compute and return the fields in the engine**

In `src/services/diagnostic/engine.ts`, the current end of `runDiagnosticEngine` reads:

```ts
  return {
    responses,
    competencyMastery,
    readinessScore,
    readinessLevel,
    strengths,
    weaknesses,
    revisionPriorities,
    completedAt: new Date().toISOString(),
  };
}
```

Replace it with:

```ts
  const totalEarnedPoints = competencyMastery.reduce((sum, m) => sum + m.pointsEarned, 0);
  const totalMaxPoints = competencyMastery.reduce((sum, m) => sum + m.pointsPossible, 0);

  return {
    responses,
    competencyMastery,
    readinessScore,
    readinessLevel,
    strengths,
    weaknesses,
    revisionPriorities,
    totalEarnedPoints,
    totalMaxPoints,
    completedAt: new Date().toISOString(),
  };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/services/diagnostic/engine.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types/diagnostic.ts src/services/diagnostic/engine.ts src/services/diagnostic/engine.test.ts
git commit -m "feat(diagnostic): add totalEarnedPoints/totalMaxPoints to DiagnosticResult"
```

---

### Task 2: Result copy helpers (`resultCopy.ts`)

**Files:**
- Create: `src/features/diagnostic/resultCopy.ts`
- Test: `src/features/diagnostic/resultCopy.test.ts`

**Interfaces:**
- Consumes: `ReadinessLevel` from `@/types/diagnostic`.
- Produces: `getGreeting(firstName?: string): string`, `getReadinessMessage(score:
  number): string`, `getWeaknessBadgeLabel(level: ReadinessLevel): string` — all
  consumed by Task 3's component.

- [ ] **Step 1: Write the failing test file**

Create `src/features/diagnostic/resultCopy.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getGreeting, getReadinessMessage, getWeaknessBadgeLabel } from './resultCopy';

describe('getGreeting', () => {
  it('includes the trimmed first name when present', () => {
    expect(getGreeting('Awa')).toBe('Bravo Awa !');
    expect(getGreeting('  Awa  ')).toBe('Bravo Awa !');
  });

  it('falls back to a plain greeting when no usable name is given', () => {
    expect(getGreeting(undefined)).toBe('Bravo !');
    expect(getGreeting('')).toBe('Bravo !');
    expect(getGreeting('   ')).toBe('Bravo !');
  });
});

describe('getReadinessMessage', () => {
  it('returns the low-score message for 0-39', () => {
    expect(getReadinessMessage(0)).toBe('Tu as encore plusieurs notions importantes à renforcer.');
    expect(getReadinessMessage(39)).toBe('Tu as encore plusieurs notions importantes à renforcer.');
  });

  it('returns the mid-score message for 40-69', () => {
    expect(getReadinessMessage(40)).toBe(
      'Tu progresses bien, mais certaines notions doivent encore être consolidées.',
    );
    expect(getReadinessMessage(69)).toBe(
      'Tu progresses bien, mais certaines notions doivent encore être consolidées.',
    );
  });

  it('returns the high-score message for 70-100', () => {
    expect(getReadinessMessage(70)).toBe('Tu maîtrises déjà une bonne partie des compétences évaluées.');
    expect(getReadinessMessage(100)).toBe('Tu maîtrises déjà une bonne partie des compétences évaluées.');
  });
});

describe('getWeaknessBadgeLabel', () => {
  it('labels a priority competency', () => {
    expect(getWeaknessBadgeLabel('priority')).toBe('Prioritaire');
  });

  it('labels an in-progress competency', () => {
    expect(getWeaknessBadgeLabel('in-progress')).toBe('En progression');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/diagnostic/resultCopy.test.ts`
Expected: FAIL — cannot find module `./resultCopy`.

- [ ] **Step 3: Implement the helpers**

Create `src/features/diagnostic/resultCopy.ts`:

```ts
import type { ReadinessLevel } from '@/types/diagnostic';

export function getGreeting(firstName?: string): string {
  const trimmed = firstName?.trim();
  return trimmed ? `Bravo ${trimmed} !` : 'Bravo !';
}

export function getReadinessMessage(score: number): string {
  if (score < 40) return "Tu as encore plusieurs notions importantes à renforcer.";
  if (score < 70) {
    return 'Tu progresses bien, mais certaines notions doivent encore être consolidées.';
  }
  return 'Tu maîtrises déjà une bonne partie des compétences évaluées.';
}

export function getWeaknessBadgeLabel(level: ReadinessLevel): string {
  return level === 'priority' ? 'Prioritaire' : 'En progression';
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/features/diagnostic/resultCopy.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/diagnostic/resultCopy.ts src/features/diagnostic/resultCopy.test.ts
git commit -m "feat(diagnostic): add result screen copy helpers"
```

---

### Task 3: Rewrite `DiagnosticCompleteScreen`

**Files:**
- Modify: `src/features/diagnostic/DiagnosticCompleteScreen.tsx` (full rewrite of the
  stub)

**Interfaces:**
- Consumes: `DiagnosticResult` (`@/types/diagnostic`, now including
  `totalEarnedPoints`/`totalMaxPoints` from Task 1); `getGreeting`,
  `getReadinessMessage`, `getWeaknessBadgeLabel` from `./resultCopy` (Task 2);
  `ScreenContainer`, `BottomCTA`, `PrimaryButton`, `AppLogo` from `@/components/ui/*`;
  `cn` from `@/lib/utils`.
- Produces: `DiagnosticCompleteScreen(props: { result: DiagnosticResult; firstName?:
  string; onContinue: () => void })` — the new `firstName` prop is consumed by Task 4.

No automated render test for this step: the project has no component-testing
infrastructure (`vitest.config.ts` runs `environment: 'node'`, no
`@testing-library/react`/jsdom installed) and the Global Constraints forbid adding new
dependencies. Verification is manual (Step 2 below) plus the type/lint/build checks in
Task 5.

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/features/diagnostic/DiagnosticCompleteScreen.tsx`
with:

```tsx
import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { cn } from '@/lib/utils';
import type { DiagnosticResult } from '@/types/diagnostic';
import { getGreeting, getReadinessMessage, getWeaknessBadgeLabel } from './resultCopy';

interface DiagnosticCompleteScreenProps {
  result: DiagnosticResult;
  firstName?: string;
  onContinue: () => void;
}

export function DiagnosticCompleteScreen({
  result,
  firstName,
  onContinue,
}: DiagnosticCompleteScreenProps) {
  const scoreDegrees = Math.min(360, Math.max(0, (result.readinessScore / 100) * 360));
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
        <h1 className="text-foreground text-2xl font-bold">{getGreeting(firstName)}</h1>
        <p className="text-muted text-base font-medium">
          Voici ton niveau de préparation au BEPC en mathématiques.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 pb-8 text-center">
        <div
          aria-hidden="true"
          className="relative flex size-36 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--highlight) ${scoreDegrees}deg, var(--border) ${scoreDegrees}deg 360deg)`,
          }}
        >
          <div className="bg-surface absolute inset-3 flex items-center justify-center rounded-full">
            <span className="text-foreground text-4xl font-extrabold">
              {result.readinessScore}%
            </span>
          </div>
        </div>
        <p className="text-foreground text-sm font-bold">Niveau de préparation</p>
        <p className="text-muted max-w-[280px] text-sm font-medium">
          {getReadinessMessage(result.readinessScore)}
        </p>
        <p className="text-muted text-sm font-semibold">
          {result.totalEarnedPoints} points sur {result.totalMaxPoints}
        </p>
      </div>

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
            Aucune compétence n&apos;est encore totalement maîtrisée, mais ton plan va
            t&apos;aider à progresser.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">À renforcer</h2>
        {topWeaknesses.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topWeaknesses.map((weakness) => (
              <CompetencyRow
                key={weakness.competencyId}
                label={weakness.competencyLabel}
                percent={weakness.masteryPercent}
                badgeLabel={getWeaknessBadgeLabel(weakness.readinessLevel)}
                badgeTone={weakness.readinessLevel === 'priority' ? 'priority' : 'in-progress'}
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Bravo, aucune faiblesse identifiée pour l&apos;instant.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-8">
        <h2 className="text-foreground text-lg font-bold">Ta priorité</h2>
        {topPriority ? (
          <div className="border-highlight bg-highlight/10 flex flex-col gap-1 rounded-2xl border-2 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground text-base font-bold">
                {topPriority.competencyLabel}
              </span>
              <span className="text-highlight text-sm font-bold">
                {topPriority.masteryPercent}%
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

      <BottomCTA>
        <PrimaryButton onClick={onContinue}>Commencer mon plan de révision</PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}

interface CompetencyRowProps {
  label: string;
  percent: number;
  badgeLabel: string;
  badgeTone: 'mastered' | 'priority' | 'in-progress';
}

function CompetencyRow({ label, percent, badgeLabel, badgeTone }: CompetencyRowProps) {
  return (
    <li className="bg-surface border-border flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3">
      <span className="text-foreground text-sm font-bold">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-muted text-sm font-semibold">{percent}%</span>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-bold',
            badgeTone === 'mastered' && 'bg-highlight/10 text-highlight',
            badgeTone === 'priority' && 'bg-primary/20 text-foreground',
            badgeTone === 'in-progress' && 'bg-border text-muted',
          )}
        >
          {badgeLabel}
        </span>
      </span>
    </li>
  );
}
```

- [ ] **Step 2: Manual verification via the running app**

Run: `npm run dev`, open the app, and click through onboarding → subject "Mathématiques"
→ diagnostic questions, deliberately answering to land in each score band at least once
across repeated runs (use the restart flow after each pass, i.e. finish → click the CTA
→ restart):

- Low score (mostly wrong answers): confirm "Tes points forts" shows the bienveillant
  empty state, "À renforcer" and "Ta priorité" are populated.
- Mixed score (some right, some wrong): confirm both strengths and weaknesses sections
  show real rows, priority card populated.
- High score (mostly/all correct): confirm several strengths show, weaknesses/priority
  show their empty states.

At each pass, resize the browser (or use devtools device toolbar) to 320px and 390px
widths, and a desktop width — confirm no horizontal scroll and the CTA is reachable at
the bottom without being clipped.

This step has no command/expected-output pair (it's a manual UX check) — do not mark it
done until you've visually confirmed all three bands and all three widths.

- [ ] **Step 3: Commit**

```bash
git add src/features/diagnostic/DiagnosticCompleteScreen.tsx
git commit -m "feat(diagnostic): implement real results screen"
```

---

### Task 4: Forward `firstName` from `OnboardingFlow`

**Files:**
- Modify: `src/features/onboarding/OnboardingFlow.tsx:111-123` (the
  `'diagnostic-result'` case)

**Interfaces:**
- Consumes: `DiagnosticCompleteScreen`'s new `firstName?: string` prop (Task 3); the
  existing `name` state (`OnboardingFlow.tsx:32`, already collected by `WelcomeScreen`
  but currently unused after the `welcome` step).
- Produces: nothing consumed by later tasks — this is the integration point.

- [ ] **Step 1: Pass the name through**

In `src/features/onboarding/OnboardingFlow.tsx`, the current `'diagnostic-result'` case
reads:

```tsx
    case 'diagnostic-result': {
      if (!diagnostic.result) return null;

      return (
        <DiagnosticCompleteScreen
          result={diagnostic.result}
          onContinue={() => {
            diagnostic.restart();
            setStep('welcome');
          }}
        />
      );
    }
```

Change it to:

```tsx
    case 'diagnostic-result': {
      if (!diagnostic.result) return null;

      return (
        <DiagnosticCompleteScreen
          result={diagnostic.result}
          firstName={name}
          onContinue={() => {
            diagnostic.restart();
            setStep('welcome');
          }}
        />
      );
    }
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, go through onboarding, type a first name (e.g. "Awa") on the welcome
screen, complete the diagnostic. Confirm the results screen shows "Bravo Awa !". Then
restart and leave the name field blank — confirm it falls back to "Bravo !".

- [ ] **Step 3: Commit**

```bash
git add src/features/onboarding/OnboardingFlow.tsx
git commit -m "feat(diagnostic): pass first name into the results screen"
```

---

### Task 5: Full verification pass

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Test suite**

Run: `npm run test`
Expected: all tests pass, including the new/updated `engine.test.ts` and
`resultCopy.test.ts`.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Fix any failures found above, re-run the specific failing command, then commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(diagnostic): address verification findings"
```

(Skip this commit entirely if steps 1-4 were all clean on the first pass.)
