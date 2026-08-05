# Mentora User Flow V2 — Product Specification

Status: **Locked / Approved for implementation planning.** This document defines the target end-to-end
user flow, its state machine, screen responsibilities, data models, and migration path. It does not
implement anything; no source files under `src/` are modified by this document.

Visual source of truth: [`designs/stitch/`](../designs/stitch/) (13 static Stitch mockups + the
`luminous_academics` design-system tokens). Every screen reference below cites its Stitch folder name
where one exists, and is explicitly flagged where none exists yet.

Current implementation baseline audited for this spec: `src/features/onboarding/OnboardingFlow.tsx`,
`src/features/app-shell/AppShell.tsx`, `src/hooks/useDiagnosticSession.ts`,
`src/services/revision/*`, `src/types/diagnostic.ts`, `src/types/revision.ts`.

---

## 1. Locked product decisions

These are binding. Anything in this document that appears to contradict one of these is a bug in the
document, not a license to deviate.

1. **Progression is sequential, not calendar-based.** There is no "Day 1 / Day 2" scheduling. A
   competency becomes available strictly because the one before it was validated — never because a
   date arrived.
2. **Only the first competency is available initially.** Every other competency starts `locked`.
3. **A competency unlocks only after passing its targeted validation.** Reading the lesson is
   necessary but never sufficient.
4. **Passing threshold is 70%.** `scorePercent >= 70` ⇒ pass. This matches the existing
   `ReadinessLevel` "mastered" boundary and the existing `getTargetMastery` floor
   (`src/services/revision/generator.ts`), so no other threshold in the system needs to change.
5. **On failure, the only actions are:** retry the validation, or reread the lesson. No third
   "continue anyway" path exists.
6. **Remove "Passer à la suite pour l'instant."** The Stitch `validation_chec` mockup includes this as
   a de-emphasized third button. It must not ship. See §13.
7. **The next competency remains locked after failure.** Failing never unlocks anything. Locking only
   ever changes on a _pass_ event.
8. **"Voir le corrigé" lives inside the success/failure result screen.** It is an inline reveal
   (accordion/expand), not a navigation to a separate correction route. There is no standalone
   correction screen in the MVP.
9. **The final diagnostic reuses the initial diagnostic UI, distinguished by a `phase` field**
   (`'initial' | 'final'`). Same question-screen component, same analysis/loading screen, same
   underlying scoring engine — different data and different result-screen copy/CTA.
10. **Initial and final results are stored and displayed separately** — never overwritten in place —
    so a before/after comparison is always derivable.

---

## 2. Complete flow

### 2.1 Screen inventory (status-tagged)

| #   | Screen                             | Stitch source                            | Status                                                                                                                                                                           |
| --- | ---------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Welcome                            | —                                        | Shipped, unchanged                                                                                                                                                               |
| 2   | Exam selection                     | —                                        | Shipped, unchanged                                                                                                                                                               |
| 3   | Subject selection                  | —                                        | Shipped, unchanged                                                                                                                                                               |
| 4   | Preparing (transition)             | —                                        | Shipped, unchanged                                                                                                                                                               |
| 5   | Diagnostic intro                   | —                                        | Shipped, unchanged                                                                                                                                                               |
| 6   | Diagnostic question ×12            | `diagnostic_question`                    | Shipped, matches Stitch; gains `phase` prop (§9)                                                                                                                                 |
| 7   | Diagnostic analysis (loading)      | _(loosely) `g_n_ration_du_plan_attente`_ | Shipped, gains `phase` prop                                                                                                                                                      |
| 8   | Diagnostic result — **initial**    | _(loosely) `r_sultats`_                  | Shipped; unchanged for `phase='initial'`                                                                                                                                         |
| 9   | Home (app shell)                   | `accueil`                                | Shipped, unchanged                                                                                                                                                               |
| 10  | Competency menu                    | `menu_r_vision`                          | Shipped (`RevisionPlanScreen`); **gains lock enforcement** (net-new logic, §6)                                                                                                   |
| 11  | Revision note / lesson             | `r_vision_cours`                         | Shipped (`RevisionNoteScreen`); **CTA rewired** to launch validation instead of marking complete (§14)                                                                           |
| 12  | Targeted validation — question(s)  | _reuses `diagnostic_question` layout_    | **Net new.** No dedicated mockup; deliberately reuses the diagnostic question pattern since a targeted validation is structurally "a mini diagnostic for one competency"         |
| 13  | Validation — grading (loading)     | `validation_attente`                     | Net new, reuse Stitch as-is                                                                                                                                                      |
| 14  | Validation — success               | `validation_succ_s`                      | Net new; reuse Stitch as-is (already has "Voir le corrigé détaillé")                                                                                                             |
| 15  | Validation — failure               | `validation_chec`                        | Net new; **modified** — remove "Passer à la suite pour l'instant", add inline "Voir le corrigé" (§13)                                                                            |
| 16  | Ready for exam                     | —                                        | **Net new. No Stitch design exists.** See §13.                                                                                                                                   |
| 17  | Diagnostic question ×N — **final** | `diagnostic_question`                    | Reused component, `phase='final'`                                                                                                                                                |
| 18  | Diagnostic analysis — **final**    | _(loosely) `g_n_ration_du_plan_attente`_ | Reused component, `phase='final'`                                                                                                                                                |
| 19  | Diagnostic result — **final**      | —                                        | **Net new variant. No Stitch design exists** for the final-phase result copy/CTA (the existing `r_sultats` CTA "Générer mon plan de révision" doesn't apply post-loop). See §13. |
| 20  | Before/after comparison            | —                                        | **Net new. No Stitch design exists.** See §13.                                                                                                                                   |

Out of scope for this spec (designed in Stitch, not required by decisions 1–10, not sequenced in §15):
`plan_pr_t`, `simulateur_d_examen_intro`, `pr_paration_examen_final`,
`bilan_final_de_comp_tences`, `tableau_de_r_ussite_final`. These read as a BAC-exam-prep expansion
layered on _top_ of a completed comparison, and should be specced separately once the core loop ships.

### 2.2 Narrative

1. Onboarding (unchanged) collects name, exam, subject.
2. **Initial diagnostic** (`phase='initial'`) — 12 questions, scored, `DiagnosticResult` produced and
   persisted. Competency mastery per competency becomes the seed for step 3.
3. App shell opens. Competency list is generated from initial diagnostic weaknesses, in a fixed
   **sequential order** (weakest mastery first — reusing the existing `generator.ts` ordering).
   Competency 1 is `available`; competencies 2..N are `locked` (Decision 2).
4. Student opens competency 1 → reads the lesson (`r_vision_cours`) → taps
   "Terminé & Valider la compétence" → **targeted validation** quiz for that competency only.
5. Validation is graded (`validation_attente`) → result:
   - **Pass (≥70%)** → competency marked `validated` → competency 2 unlocks → student returns to the
     competency menu, competency 1 shows `Terminé`, competency 2 shows `En cours`/available.
   - **Fail (<70%)** → competency stays `in-progress` (not validated), competency 2 stays `locked`
     (Decision 7) → student sees exactly two actions: retry the validation, or reread the lesson
     (Decision 5) → loop back to step 4/5 for the same competency. No cap on retry count (§8, §12).
6. Repeat step 4–5 for every competency in order until the last one is validated.
7. **Ready for exam** screen: all competencies validated, no more locked items. This is a deliberate
   checkpoint, not an auto-redirect — the student chooses when to start the final diagnostic.
8. **Final diagnostic** (`phase='final'`) — same question engine, same UI, new `DiagnosticResult`
   record, stored **separately** from the initial one (Decision 10).
9. **Before/after comparison** — reads both stored `DiagnosticResult` records (initial + final) and
   renders per-competency mastery delta plus overall readiness delta. Terminal screen for this spec's
   scope.

---

## 3. State machine

Two nested state machines: a **Journey** (top-level phase) and a **Competency** (per-item, repeated
N times inside the `revision` journey phase).

### 3.1 Journey phase

```
onboarding
   │  (existing onboarding steps, unchanged)
   ▼
initial-diagnostic  (phase='initial')
   │  DiagnosticResult saved to the "initial" slot
   ▼
revision                                          ◄─┐
   │  (competency state machine runs N times,        │ loop until
   │   sequentially — see §3.2)                       │ all competencies validated
   └─────────────────────────────────────────────────┘
   │  all competencies status === 'validated'
   ▼
ready-for-exam
   │  student-initiated "Commencer le diagnostic final"
   ▼
final-diagnostic  (phase='final')
   │  DiagnosticResult saved to the "final" slot (initial slot untouched)
   ▼
comparison
   (terminal state for this spec)
```

Journey phase is a single enum stored once, not derived: `'onboarding' | 'initial-diagnostic' |
'revision' | 'ready-for-exam' | 'final-diagnostic' | 'comparison'`.

### 3.2 Competency state machine (one instance per competency, run in fixed sequence order)

```
locked ──────────────────────────────────────────────┐
   │  unlocked when: index === 0                      │
   │       OR previous competency status === 'validated'│
   ▼                                                    │
available                                               │
   │  student opens the lesson                          │
   ▼                                                    │
in-progress (reading)                                   │
   │  student taps "Terminé & Valider la compétence"     │
   ▼                                                    │
pending-validation (quiz shown)                         │
   │  student submits answers                            │
   ▼                                                    │
grading (validation_attente, transitional)               │
   │  score computed                                      │
   ├─── score >= 70 ──► validated ───────────────────────┘  (unlocks next competency)
   │
   └─── score < 70  ──► failed
                            │
                            ├─ "Réessayer la validation" ──► pending-validation (new attempt, same competency)
                            └─ "Relire le cours"          ──► in-progress (reading, same competency)
```

Notes:

- `validated` is terminal for a competency — a validated competency is never re-locked, and revisiting
  it later (e.g. from the menu) is a read-only review, not a re-validation.
- `failed` is not a stored terminal status; it's the _result of the most recent attempt_. The
  competency's persisted `status` stays `in-progress` while failed — see §8 for why this matters for
  persistence/resume.
- There is no `skipped` status. Decision 6/7 mean no transition exists that both leaves a competency
  unvalidated and unlocks the next one.

---

## 4. Screen responsibilities

| Screen                                                | Responsibility                                                                                                                             | Reads                                                     | Writes                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| Competency menu (`menu_r_vision`)                     | Show every competency in sequence order with its derived status (locked / available / in-progress / validated); block taps on locked items | `CompetencyProgress[]`                                    | —                                                                       |
| Revision note (`r_vision_cours`)                      | Render lesson content for one competency; on completion, hand off to validation (never marks the competency validated itself)              | `RevisionUnit`, `RevisionNote`                            | —                                                                       |
| Targeted validation — question                        | Ask N questions scoped to exactly one `competencyId`; collect responses                                                                    | `ValidationQuestion[]` filtered by `competencyId`         | in-memory responses                                                     |
| Validation — grading                                  | Transitional/loading only; computes `scorePercent` from responses                                                                          | responses                                                 | `ValidationAttempt`                                                     |
| Validation — success                                  | Confirm pass, reveal "Voir le corrigé" inline, offer "Continuer mon plan"                                                                  | `ValidationAttempt` (passed)                              | `CompetencyProgress.status = 'validated'`, unlocks next                 |
| Validation — failure                                  | Confirm fail, reveal "Voir le corrigé" inline, offer exactly two actions (retry / reread)                                                  | `ValidationAttempt` (failed)                              | nothing progresses; competency stays `in-progress`, next stays `locked` |
| Ready for exam                                        | Confirm all competencies validated; single CTA into the final diagnostic                                                                   | `CompetencyProgress[]` (all `validated`)                  | —                                                                       |
| Diagnostic question/analysis/result (`phase='final'`) | Identical engine/UI to initial diagnostic; result screen copy/CTA differs (no "generate a plan" CTA — there's nothing left to plan)        | 12(+) responses                                           | `DiagnosticResult` (phase `'final'`), stored in the separate final slot |
| Before/after comparison                               | Pair the initial and final `DiagnosticResult` records by `competencyId`; render per-competency delta and overall readiness delta           | `DiagnosticResult` (initial) + `DiagnosticResult` (final) | —                                                                       |

---

## 5. Transitions

| Trigger                                             | From                      | To                                                                                      |
| --------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| Initial diagnostic completes                        | `initial-diagnostic`      | `revision`, competency 1 → `available`, competencies 2..N → `locked`                    |
| Open lesson on an `available` competency            | competency: `available`   | `in-progress`                                                                           |
| Tap "Terminé & Valider la compétence"               | competency: `in-progress` | `pending-validation`                                                                    |
| Submit validation answers                           | `pending-validation`      | `grading`                                                                               |
| Grading resolves, score ≥ 70                        | `grading`                 | competency: `validated`; next competency: `locked` → `available`                        |
| Grading resolves, score < 70                        | `grading`                 | competency: `in-progress` (failed-attempt state); next competency: unchanged (`locked`) |
| Tap "Réessayer la validation" (on failure screen)   | failed                    | `pending-validation` (new attempt)                                                      |
| Tap "Relire le cours" (on failure screen)           | failed                    | `in-progress` (reading)                                                                 |
| Last competency reaches `validated`                 | `revision`                | `ready-for-exam`                                                                        |
| Tap "Commencer le diagnostic final"                 | `ready-for-exam`          | `final-diagnostic`                                                                      |
| Final diagnostic completes                          | `final-diagnostic`        | `comparison`                                                                            |
| Restart diagnostic (existing `onRestartDiagnostic`) | any                       | `initial-diagnostic`, full journey reset (§12)                                          |

No transition exists from `failed` directly to a `validated`/next-competency state, and none exists
from `locked` except via the unlock rule in §6. This is the formal encoding of Decisions 5, 6, 7.

---

## 6. Locking rules

- A competency's lock state is **derived**, not independently stored: competency at index `i` is
  unlocked iff `i === 0 OR competencies[i-1].status === 'validated'`.
- Locked competencies are non-interactive in the competency menu (no lesson open, no validation entry)
  — matches the existing `Verrouillé` / `cursor-not-allowed` treatment already designed in
  `menu_r_vision`.
- Locking is **never** date-based (Decision 1). There is no cron, no "unlocks tomorrow," no session
  count. The only unlock event is a passing validation on the immediately preceding competency.
- Locking is **monotonic forward-only**: once unlocked, a competency never re-locks (even if a later
  competency somehow gets revisited — not possible in this spec, but stated for clarity).
- A validated competency remains permanently unlocked and reviewable; re-opening it does not require
  re-passing its validation and does not affect any other competency's lock state.

---

## 7. Targeted validation rules

- A targeted validation quiz is scoped to **exactly one `competencyId`** — never mixed-competency,
  unlike the diagnostic (which spans all competencies).
- Question bank: sourced from validation-question content tagged to the competency (see §8 for the
  new `ValidationQuestion` type). The existing revision-note "Mini exercice" content
  (`Énoncé`/`Réponse`/`Correction`, per `docs/revision-notes-engine.md`) is the natural authoring
  source for this bank, since it already carries a correction string per exercise usable for the
  "Voir le corrigé" reveal (Decision 8).
- Scoring: `scorePercent = round(correctCount / totalCount * 100)`.
- Pass rule: `scorePercent >= 70` (Decision 4). This is represented declaratively via the existing
  `ExitCriterion { type: 'minimum-score', target: 70 }` on the `RevisionUnit`/`RevisionSession` —
  a type that already exists in `src/types/revision.ts` but is currently unused by any generator.
  This spec is what activates it.
- Attempts are unlimited. Every attempt is recorded (§8); the UI only needs the _latest_ attempt to
  decide current status, but history is retained for the before/after story and for future analytics.
- A retry attempt is a **new** validation, not a resume of the failed one — no partial-credit carry
  between attempts.

---

## 8. Data models required

All additive to `src/types/`. Nothing existing is deleted; two existing types gain a field.

```ts
// diagnostic.ts — ADD to existing DiagnosticResult and DiagnosticSessionState
type DiagnosticPhase = 'initial' | 'final';

interface DiagnosticResult {
  // ...existing fields, unchanged...
  phase: DiagnosticPhase; // NEW
}

// revision.ts — NEW types
interface ValidationQuestion {
  id: string;
  competencyId: string;
  instruction: string;
  content: string;
  contentFormat: 'text' | 'latex';
  options: DiagnosticQuestionOption[]; // reuse existing shape
  correctOptionId: string;
  correction: string; // powers "Voir le corrigé"
}

interface ValidationResponse {
  questionId: string;
  optionId: string;
  isCorrect: boolean;
}

interface ValidationAttempt {
  id: string;
  competencyId: string;
  revisionUnitId: string;
  attemptNumber: number;
  responses: ValidationResponse[];
  scorePercent: number;
  passed: boolean; // scorePercent >= 70
  startedAt: string;
  completedAt: string;
}

// RevisionSession — ADD to existing type
interface RevisionSession {
  // ...existing fields, unchanged...
  validationAttempts: ValidationAttempt[]; // NEW, append-only
}
```

Derived (not stored) values:

- `CompetencyStatus` for menu rendering: `'locked' | 'available' | 'in-progress' | 'validated'`,
  computed from `RevisionSession.status` + lock rule in §6 (`status` still uses the existing
  `'not-started' | 'in-progress' | 'completed'` enum; `'completed'` now specifically means "last
  `validationAttempts` entry has `passed === true`" — see §14 for the semantic change this requires).
- Comparison rows: `{ competencyId, competencyLabel, masteryBefore, masteryAfter, delta }[]`, computed
  at render time by joining `initialResult.competencyMastery` and `finalResult.competencyMastery` on
  `competencyId`. No new persisted type needed.

---

## 9. Local persistence changes

Current: two localStorage keys, both hard-coded per subject/exam, both unversioned beyond a literal
`.vN` suffix (`src/services/diagnostic/storage.ts`, `src/services/revision/storage.ts`).

| Key (current)                                 | Key (V2)                                           | Change                                                                                                                                                              |
| --------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mentora.diagnostic.bepc-mathematiques.v2`    | `mentora.diagnostic.bepc-mathematiques.initial.v3` | Same shape + `phase: 'initial'`. Version bump because the shape changed (additive field, but bump anyway per existing convention of bumping on shape change).       |
| _(none)_                                      | `mentora.diagnostic.bepc-mathematiques.final.v1`   | **New.** Same `DiagnosticSessionState` shape, `phase: 'final'`. Written only once the final diagnostic completes. Never overwrites the `initial` key (Decision 10). |
| `mentora.revision-plan.bepc-mathematiques.v1` | `mentora.revision-plan.bepc-mathematiques.v2`      | Each `RevisionSession` gains `validationAttempts: []` (defaults empty on migrate/load). Version bump because `isRevisionPlan()` type-guard shape changes.           |

No new storage abstraction is introduced — the existing pattern (per-key module, `hasLocalStorage()`
guard, save-on-every-mutation, defensive JSON parse) is kept as-is and simply extended to the two new
keys/fields. This is a deliberate minimal-diff choice: the current pattern already works, has no
production incidents, and doesn't need a generic storage layer for three keys.

---

## 10. Final diagnostic

- Triggered only from the `ready-for-exam` screen, only after every competency's `status` reads
  `validated`.
- Reuses `DiagnosticQuestionScreen`, `DiagnosticAnalysisScreen` unchanged, passing `phase='final'`
  through as a prop that flows into the persisted `DiagnosticResult.phase`.
- Question set: whether the final diagnostic reuses the same 12 questions as the initial one or a
  distinct final-phase question bank is **not decided by this spec** and must be resolved before
  Sprint 4 (§15) — flagged here rather than assumed, since it affects `data/diagnostic-questions.json`
  scope and comparison validity (comparing mastery on the _same_ questions is the cleaner signal, but
  reusing identical questions risks memorization artifacts).
- The result screen (`DiagnosticCompleteScreen` equivalent for `phase='final'`) needs new copy and a
  new primary CTA ("Voir ma progression" → comparison) instead of the initial-phase CTA. No Stitch
  design exists for this variant (§13).
- The final diagnostic does **not** regenerate a `RevisionPlan`. Its only output is a second
  `DiagnosticResult`, stored separately (§9), consumed by the comparison screen.

---

## 11. Before/after comparison

- Reads `DiagnosticResult` where `phase='initial'` and `DiagnosticResult` where `phase='final'` from
  their two separate storage keys.
- Joins on `competencyMastery[].competencyId`.
- Per competency: `masteryBefore`, `masteryAfter`, `delta = masteryAfter - masteryBefore`.
- Overall: `readinessScore` before vs. after, `readinessLevel` before vs. after.
- Read-only screen — no actions progress journey state further; this is the terminal screen for this
  spec's scope (post-comparison flows like sharing with an "Allié," from `bilan_final_de_comp_tences`,
  are explicitly out of scope — see §2.1).
- No Stitch design exists (§13); this is a data-comparison view, structurally closer to a stat-tile
  dashboard than to any existing mockup, so needs original design work rather than adaptation.

---

## 12. Edge cases

- **Zero weak competencies at initial diagnostic.** If every competency is already `mastered`, the
  competency list is empty — journey should skip `revision` and go straight to `ready-for-exam` (with
  a distinct empty-state message; not a bug state).
- **Single competency.** Works identically to N competencies; competency 1 is both first and last —
  passing it goes straight to `ready-for-exam`.
- **Refresh mid-validation-quiz.** In-progress (unsubmitted) quiz answers are not persisted (matches
  current diagnostic behavior, which only persists on `validate()`/completion, not per-keystroke). On
  reload, the student re-enters the quiz from question 1 of the current attempt. This does not create
  a phantom "passed" or "failed" attempt — an attempt is recorded only on submission.
- **Restart diagnostic mid-journey.** The existing `onRestartDiagnostic` action must now reset the
  _entire_ journey, not just the diagnostic: clears `initial` diagnostic slot, clears the revision
  plan (including all `validationAttempts`), returns to `onboarding`/`welcome`. It must **not** clear
  a `final` diagnostic slot if one somehow already existed pre-restart in a partially-built version of
  this flow — restart is only reachable pre-`final-diagnostic` in the intended flow, so this is a
  defensive note, not an expected path.
- **Retrying after many failures.** No attempt cap, no cooldown, no escalation to a different question
  set — every retry uses the same `ValidationQuestion` bank for that competency (§7). If this proves
  to enable rote memorization in practice, that's a future content-variance problem, not a state-
  machine problem.
- **Opening a `validated` competency's lesson again.** Allowed, read-only, does not re-trigger
  validation and does not affect lock state of any other competency.
- **Attempting to deep-link into a locked competency** (e.g. stale bookmark, browser back/forward).
  Must resolve the same way the existing "defensive fallback" `useEffect` in `OnboardingFlow.tsx`
  (lines 82–90) already handles missing diagnostic results: redirect to the last valid state rather
  than rendering a broken screen.
- **Final diagnostic scored `< 70%` on some competency.** No re-entry into `revision` is defined by
  this spec — the comparison screen simply shows the (possibly negative-looking) delta honestly. Re-
  opening the loop post-final-diagnostic is explicitly out of scope; flag for a future spec if product
  wants a remediation loop.

---

## 13. Screens with no Stitch design (explicit gap list)

Per request, these three screens have **no visual design in `designs/stitch/`** and need original
design work before implementation can style them — engineering can build them functionally against
this spec, but they should not ship pixel-final without a design pass:

1. **Final diagnostic result screen** (`phase='final'` variant of the diagnostic-complete screen) —
   the existing `r_sultats` mockup is initial-diagnostic-specific (its only CTA is "Générer mon plan
   de révision," which doesn't apply once revision is already finished).
2. **Before/after comparison screen** — no mockup of any kind exists for a two-timepoint mastery
   comparison; nearest visual precedent in the mockup set is the radar chart in `r_sultats` /
   `bilan_final_de_comp_tences`, but neither shows two overlaid timepoints.
3. **Ready-for-exam state** — the screen shown once every competency is validated and before the
   final diagnostic starts. `pr_paration_examen_final` is visually adjacent (BAC countdown + "Lancer
   un Examen Blanc") but is scoped to BAC-specific exam-day framing, out of scope here (§2.1); the
   ready-for-exam screen this spec needs is simpler and has no equivalent mockup.

Additionally, one required _behavioral_ change to an existing mockup, not a missing design:

4. **`validation_chec` (failure screen) must be modified before build**, not used as-is:
   - Remove: the third button, `Passer à la suite pour l'instant` (Decision 6).
   - Add: an inline "Voir le corrigé" reveal (Decision 8) — no equivalent element currently exists on
     this mockup (it's currently only on the success mockup, `validation_succ_s`, as "Voir le corrigé
     détaillé").
   - Keep: `Réessayer l'exercice` and `Relire le cours` as the only two progressing actions
     (Decision 5), relabeled if needed to match the validation-quiz vocabulary rather than the
     mockup's placeholder "exercice"/grammar-example copy (the mockup's own content is French-grammar
     placeholder text, inconsistent with the math domain used elsewhere — not meant to ship verbatim).

---

## 14. Migration from current implementation

Audited baseline: `src/features/onboarding/OnboardingFlow.tsx`, `src/features/app-shell/AppShell.tsx`,
`src/hooks/useDiagnosticSession.ts`, `src/services/revision/*`, `src/services/diagnostic/*`.

**What already exists and needs no behavioral change:**

- Initial diagnostic engine (`useDiagnosticSession`, `scoring.ts`, `recommendations.ts`) — fully
  reusable for `phase='final'` as-is; only needs the `phase` prop threaded through and a second
  storage key (§9).
- Revision plan generation (`generator.ts`, `priority.ts`) — ordering logic (weakest-mastery-first) is
  exactly the sequential ordering this spec requires. No changes needed.
- Revision notes engine (`revision-notes/*`) — unaffected; still the content source for lesson
  screens, and now also implicitly for validation-question authoring (§7).

**What must change:**

- **`RevisionSession.status` semantics shift.** Today, `completeSession()` fires the instant a student
  clicks "Terminer cette session" in `RevisionNoteScreen.tsx` (line ~164) — reading is sufficient for
  `'completed'`. Under this spec, `'completed'` must mean _the last `validationAttempts` entry passed_.
  The current wiring (`AppShell.completeRevisionSession` → `onCompleteRevisionSession` →
  `revision.completeSession`) must be rerouted: the note screen's completion button should launch the
  validation quiz instead of calling `completeSession` directly; `completeSession` (renamed/repurposed
  as "record a passing validation attempt") only fires after a pass.
- **No lock enforcement exists today** — confirmed by codebase audit: `openRevisionSession` in
  `AppShell.tsx` (line 80) accepts any `revisionUnitId` with no check that prior sessions are
  `'completed'`. The competency menu (`RevisionPlanScreen`) must add the derived lock check from §6
  and disable interaction on locked items, matching the `Verrouillé` treatment already present in the
  `menu_r_vision` Stitch mockup (which is itself not yet built in code — currently there's no lock
  icon/state in `RevisionPlanScreen` at all).
- **No validation/quiz screen, type, or storage exists today** — this is 100% net-new build, not a
  modification (§8 types, §2.1 screens 12–15).
- **No `phase` field exists on `DiagnosticResult`/`DiagnosticSessionState`** — additive field, requires
  a storage-key version bump and a one-time migration decision for any already-persisted `v2` session
  (simplest: on load, if `phase` is absent, treat as `'initial'` and continue — no destructive
  migration needed since the field is additive and the old key becomes the new `.initial.` key).
- **No "ready for exam" screen, final-diagnostic entry point, or comparison screen exist today** — net-
  new (§2.1 screens 16, 19, 20).
- **"Passer à la suite" does not exist in code today** (confirmed by grep — zero matches). There is
  nothing to remove from the codebase; the removal instruction (Decision 6) applies to _not
  introducing_ it when building the failure screen from the `validation_chec` mockup, which does
  include it.
- **"Voir le corrigé" does not exist as a live in-app screen today** — `correction` text currently only
  reaches students via the exported PDF Study Pack (`study-pack/documentModel.ts`). The inline reveal
  on the validation result screens is new UI, though the underlying content field (`correction` string
  per exercise) already exists in the revision-notes Markdown format and can be reused (§7).

---

## 15. Implementation sprints (dependency order)

Each sprint should ship independently testable and revertible; later sprints depend on earlier ones.

**Sprint 1 — Data model foundation**

- Add `phase` to `DiagnosticResult`/`DiagnosticSessionState`; thread through `useDiagnosticSession`.
- Add `ValidationQuestion`, `ValidationResponse`, `ValidationAttempt` types; add
  `validationAttempts: []` to `RevisionSession`.
- Split diagnostic storage into `.initial.` / `.final.` keys; bump revision-plan storage version.
- No UI changes yet. Ship behind existing screens unaffected.

**Sprint 2 — Locking**

- Implement the derived lock rule (§6) in the competency menu (`RevisionPlanScreen`).
- Redefine `RevisionSession.status === 'completed'` to require a passing `validationAttempts` entry
  (temporarily: until Sprint 3 ships, gate it on a stub/manual-pass path so the menu is testable
  without a real quiz).
- Visually distinguish locked / available / in-progress / validated per `menu_r_vision`.

**Sprint 3 — Targeted validation loop**

- Build the validation question screen (reusing `diagnostic_question`'s layout/component patterns),
  grading transition (`validation_attente`), success screen (`validation_succ_s`), and the _modified_
  failure screen (`validation_chec` minus skip-forward, plus inline corrigé — §13).
- Wire `RevisionNoteScreen`'s completion CTA to launch validation instead of calling
  `completeSession` directly.
- Wire pass → `completeSession` (now meaning "validated") → unlock next competency.
- Wire fail → retry / reread actions only (Decision 5), no progression.
- Author the per-competency `ValidationQuestion` bank content (content/authoring task, can run in
  parallel with the screen build).

**Sprint 4 — Ready for exam + final diagnostic**

- Build "ready for exam" screen (no Stitch design — needs a design pass first, §13).
- Resolve the open question from §10 (shared vs. distinct final-phase question bank) before starting.
- Wire `phase='final'` through the existing diagnostic screens into the new `.final.` storage key.
- Build the final-diagnostic result screen variant (no Stitch design — needs a design pass, §13).

**Sprint 5 — Before/after comparison**

- Build the comparison screen (no Stitch design — needs a design pass, §13): join initial/final
  `DiagnosticResult` by `competencyId`, render per-competency and overall deltas.
- This is the terminal screen for this spec's scope; no further transitions defined.

**Sprint 6 — Migration/restart hardening**

- Update `onRestartDiagnostic` to reset the full journey (initial + final slots, revision plan with
  attempts) per §12.
- Add the deep-link/locked-competency defensive redirect per §12.
- Regression-test the empty-competency-list and single-competency edge cases (§12).
