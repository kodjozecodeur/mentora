# Sprint 3 — Diagnostic Results Screen

## Goal

Replace the `DiagnosticCompleteScreen` stub with a real, premium, mobile-first results
screen that materializes Mentora's value at the end of the diagnostic. It must answer,
immediately and without scrolling logic games:

1. À quel niveau suis-je prêt ?
2. Quelles sont mes forces ?
3. Quelles sont mes faiblesses ?
4. Que dois-je réviser en priorité ?

Out of scope for this sprint: building the actual revision plan, building targeted
revision. The CTA only needs to be wired to a callback/stub.

## Data contract

Source of truth: `DiagnosticResult` (`src/types/diagnostic.ts`), already computed and
saved before this screen renders (`DiagnosticAnalysisScreen` proves this — it doesn't
even read the result, just transitions after a fixed delay).

Fields consumed, all pre-computed by the engine — **no recomputation in the UI
component**:

- `readinessScore: number`
- `totalEarnedPoints`, `totalMaxPoints: number` — **new fields, see below**
- `strengths: CompetencyMastery[]`
- `weaknesses: CompetencyMastery[]` (already engine-sorted by priority — do not re-sort)
- `revisionPriorities: RevisionRecommendation[]`
- `competencyMastery: CompetencyMastery[]` (full list; the PRD called this
  `competencyScores` but the real field is `competencyMastery` — same data, no rename)

Each `CompetencyMastery` already carries `readinessLevel: 'priority' | 'in-progress' |
'mastered'`, which maps directly to the required UI badges:

- `mastered` → "Maîtrisée" (used for `strengths`)
- `priority` → "Prioritaire" (used for `weaknesses`)
- `in-progress` → "En progression" (used for `weaknesses`)

### New fields: `totalEarnedPoints` / `totalMaxPoints`

Not present on `DiagnosticResult` today. Decision (user-confirmed): extend the type and
compute them in `src/services/diagnostic/engine.ts` by summing
`competencyMastery[].pointsEarned` / `.pointsPossible` when composing the returned
`DiagnosticResult`. This touches only result composition, not the scoring algorithm
(`computeCompetencyMastery`, `computeReadinessScore`, `rankRevisionPriorities` stay
untouched) — so it does not violate "don't modify the scoring engine except for a
blocking bug."

## Files touched

1. `src/types/diagnostic.ts` — add `totalEarnedPoints: number; totalMaxPoints: number;`
   to `DiagnosticResult`.
2. `src/services/diagnostic/engine.ts` — compute and return the two new fields.
3. `src/features/diagnostic/DiagnosticCompleteScreen.tsx` — full rewrite (replaces the
   stopgap stub).
4. `src/features/onboarding/OnboardingFlow.tsx` — forward the existing `name` state
   (collected in `WelcomeScreen`, currently unused after that step) into
   `DiagnosticCompleteScreen` as `firstName`.

No new dependencies. No shared UI atoms added — sub-parts (e.g. a competency row) stay
local to `DiagnosticCompleteScreen.tsx` since they're not reused elsewhere yet (YAGNI).

## Screen layout (top to bottom)

1. **Header** — `AppLogo size="sm"` + small muted text `Ton diagnostic est terminé`.
2. **Main block** — `Bravo {firstName} !` if `firstName` is non-empty after trim,
   otherwise `Bravo !`; fixed subtext `Voici ton niveau de préparation au BEPC en
   mathématiques.`
3. **Readiness score** — CSS `conic-gradient` ring (brand `--highlight` color only, no
   red/green semantics), `{score}%` centered. Ring `div` is `aria-hidden="true"`; the
   score number, label (`Niveau de préparation`), bucketed message, and points line are
   all real text nodes next to it, so screen readers get full info without a duplicate
   `aria-label`. Message bucketed by `readinessScore` value only (display branching on
   an already-given number, not a recompute):
   - 0–39: `Tu as encore plusieurs notions importantes à renforcer.`
   - 40–69: `Tu progresses bien, mais certaines notions doivent encore être
     consolidées.`
   - 70–100: `Tu maîtrises déjà une bonne partie des compétences évaluées.`

   Below: `{totalEarnedPoints} points sur {totalMaxPoints}`.
4. **Tes points forts** — up to 3 items from `strengths` (`.slice(0, 3)`), each row:
   competency label, `masteryPercent`%, "Maîtrisée" badge. Empty state: `Aucune
   compétence n'est encore totalement maîtrisée, mais ton plan va t'aider à progresser.`
5. **À renforcer** — up to 3 items from `weaknesses` (`.slice(0, 3)`, engine order kept
   as-is), each row: label, `masteryPercent`%, badge from `readinessLevel`
   (`priority`→"Prioritaire", `in-progress`→"En progression"). Empty state (score-élevé
   case, not specified verbatim in the PRD): `Bravo, aucune faiblesse identifiée pour
   l'instant.`
6. **Ta priorité** — accent card (highlight border/tint, not a full-bleed block) showing
   `revisionPriorities[0]`: competency name, current `masteryPercent`%, fixed text
   `Commence par cette compétence pour progresser plus rapidement.` Empty state: `Tu as
   maîtrisé toutes les compétences évaluées.`
7. **CTA** — `BottomCTA` wrapping a single `PrimaryButton`: `Commencer mon plan de
   révision`, calling the existing `onContinue` callback (stub behavior preserved from
   `OnboardingFlow`, ready for sprint 4 to swap in real plan navigation). The optional
   secondary CTA (`Revoir mes résultats`) is dropped: it has no clear function on a
   single, non-paginated results screen and the PRD marks it optional — adding it would
   only add clutter ("ne surcharge pas l'écran").

## Error handling / robustness

- `OnboardingFlow.tsx` (existing code, unchanged) already guards the `diagnostic-result`
  step: renders `null` and a `useEffect` redirects to `diagnostic-question` if
  `diagnostic.result` is falsy. So `DiagnosticCompleteScreen`'s `result` prop stays a
  required (non-optional) `DiagnosticResult` — no internal "no result" fallback needed
  inside the component itself.
- All list rendering (`strengths`, `weaknesses`, `revisionPriorities[0]`) uses
  `.slice(0, n)` / explicit empty checks — never assumes a fixed length.
- Component never mutates `result` and never re-sorts/re-ranks — it only reads and
  formats.

## Accessibility

- Score conveyed via real text (number + label + message), not color/ring alone.
- Decorative ring and any icons: `aria-hidden="true"`.
- Badges use text labels ("Maîtrisée"/"Prioritaire"/"En progression"), not color-only
  signaling.
- Buttons are native `<button>` elements (via existing `PrimaryButton`), keyboard
  reachable by default.
- Sufficient contrast: reuses existing design-system tokens
  (`bg-background`/`text-foreground`/`bg-highlight`/`text-muted`/`bg-surface`/
  `bg-border`), already validated elsewhere in the app.

## Design system constraints (reused, not redesigned)

`#FDF2FF` background, `#F4CE1A` primary, `#873694` highlight, `#24152A` foreground,
Satoshi font — all already wired as Tailwind theme tokens in `src/app/globals.css`.
Reuse `ScreenContainer`, `BottomCTA`, `PrimaryButton`, `AppLogo`. Mobile-first inside the
existing `AppViewport`/`ScreenContainer` constraints (max-width 430px, safe-area-aware
bottom CTA). No horizontal overflow; vertical scroll within the screen is acceptable and
expected given the amount of content.

## Validation plan

Manual pass through 3 cases (can drive via temporary fixture data or by tweaking
`useDiagnosticSession` inputs during dev, not committed):

1. **Score faible (0–39%)**: `strengths` empty → bienveillant empty state; `weaknesses`
   and `revisionPriorities` populated.
2. **Score moyen (40–69%)**: mix of `strengths`/`weaknesses`, priority card populated.
3. **Score élevé (70–100%)**: several `strengths`, `weaknesses` empty or near-empty →
   clean empty state, `revisionPriorities` possibly empty → "toutes compétences
   maîtrisées" copy.

Responsive check at 320px, 390px, and desktop-centered (via `AppViewport`'s existing
sm:width-390 behavior) — no horizontal scroll, CTA always reachable.

Automated checks before considering the sprint done:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run test`
- `npm run build`

## Explicitly not doing

- No changes to `computeCompetencyMastery`, `computeReadinessScore`,
  `rankRevisionPriorities`, or any scoring logic.
- No revision plan screen, no targeted revision flow.
- No new shared UI components/dependencies.
- No secondary "Revoir mes résultats" CTA (see CTA section above).
