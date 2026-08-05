# Mentora Onboarding & First-Chapter Flow — Product Flow Specification

Status: **Locked** — source of truth for product flow. Implementation should treat this as frozen; raise a contradiction, don't re-litigate the decisions.

## Context

Mentora shifts from "exam prep app" to "AI tutor accompanying the student's current school chapter." The old flow (BEPC → Global diagnostic → Revision plan) is deleted. New flow:

```
Welcome → Class → Subject → Current Chapter → Chapter Diagnostic → Results
→ Personalized Revision Plan (only if needed) → Learning Journey → Home
```

MVP implements exactly one path: **3e → Mathématiques → Polynômes du second degré**. All other classes/subjects/chapters are visible but locked.

Current stack (confirmed): Next.js/React/TypeScript SPA, no URL router — a local state machine (`OnboardingFlow.tsx`, `switch(step)`) plus a tab shell (`AppShell.tsx`). No "class/grade" concept exists today (only exam-track: bepc/bac1/bac2). No "chapter" concept exists anywhere in the current codebase.

## 1. User Journey (happy path)

```
Welcome → Class → Subject → Current Chapter → [Preparing] → [Diagnostic Intro]
→ Chapter Diagnostic (questions) → [Analysis] → Results
   ├─ weak competency found → Personalized Revision Plan → Learning Journey → Home
   └─ all mastered          → Learning Journey → Home
```

Home persists with 3 tabs: **Accueil / Mon parcours (Learning Journey) / Profil**.

Re-entry path: a CTA inside Home or Learning Journey ("Refaire le diagnostic du chapitre") re-enters Chapter Diagnostic → Results directly, skipping Class/Subject/Chapter since the MVP path is fixed. No before/after comparison screen — a re-attempt simply overwrites Results.

## 2–5. Screens: purpose, inputs, outputs, navigation

| #   | Screen                                    | Purpose                                                        | Input                        | Output                                                     | Next                                                                    |
| --- | ----------------------------------------- | -------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | **Welcome**                               | Greet, capture first name                                      | —                            | first name                                                 | Class                                                                   |
| 2   | **Class** _(new)_                         | Pick grade level                                               | —                            | selectedClass (3e enabled, rest locked)                    | Subject                                                                 |
| 3   | **Subject**                               | Pick subject                                                   | selectedClass                | selectedSubject (Maths enabled, rest locked)               | Current Chapter                                                         |
| 4   | **Current Chapter** _(new)_               | Pick chapter within subject                                    | selectedSubject              | selectedChapter (Polynômes enabled, rest locked "bientôt") | Preparing → Diagnostic Intro                                            |
| 5   | **Chapter Diagnostic**                    | Assess mastery on this chapter only                            | selectedChapter              | answers, per-competency score                              | Analysis → Results                                                      |
| 6   | **Results**                               | Show mastery breakdown, decide branch                          | diagnostic scores            | mastery buckets (mastered / in-progress / priority)        | Plan if priority or in-progress bucket non-empty, else Learning Journey |
| 7   | **Personalized Revision Plan**            | Session roadmap for weak competencies                          | priority/in-progress buckets | ordered session list                                       | Learning Journey                                                        |
| 8   | **Learning Journey** ("Mon parcours" tab) | Ongoing hub: session list, progress, notes, validation quizzes | revision plan (if any)       | session completion state                                   | Home (persistent tab)                                                   |
| 9   | **Home** ("Accueil" tab)                  | Landing hub: chapter progress, "continue" CTA                  | journey state                | —                                                          | tab switch                                                              |

Diagnostic sub-steps (Preparing loader, Diagnostic Intro, Analysis loader) remain unlabeled transitions inside the stepper — unchanged in structure from today, just re-scoped to one chapter instead of the whole exam.

### Branch rule (Results → Plan or Learning Journey)

Reuses existing mastery-bucket logic (`resultCopy.ts` → `partitionByReadinessLevel`). If the priority or in-progress bucket is non-empty, route through Personalized Revision Plan. If every competency lands in the mastered bucket, skip the plan and go straight to Learning Journey.

## 6. Reused screens (reframe copy only, no structural rebuild)

`WelcomeScreen`, `SubjectSelectionScreen` (+ `subjectAvailability.ts` lock pattern — same pattern reused for Class and Chapter gating), `PreparingScreen`, `DiagnosticIntroScreen`, `DiagnosticQuestionScreen` + `useDiagnosticSession`, `DiagnosticAnalysisScreen`, `DiagnosticCompleteScreen` (→ Results), `RevisionPlanScreen` (→ Personalized Revision Plan), `RevisionOverviewScreen` + `RevisionNoteScreen` + `ValidationQuizScreen` + `ValidationResultScreen` (→ inside Learning Journey), `HomeScreen`, `ProfileScreen`, `BottomNavigation` (trimmed to 3 tabs).

## 7. Deleted screens (exam-track concept fully removed)

`ExamSelectionScreen`, `DiagnosticScreen` (old "Examens" tab), `ReadyForExamScreen`, `FinalDiagnosticResultScreen`, `ComparisonScreen`, `exams.json`. "Examens" tab removed from `BottomNavigation` (4 tabs → 3).

## 8. New screens

`ClassSelectionScreen`, `ChapterSelectionScreen` — same locked-card selection pattern as the existing `SubjectSelectionScreen`.

**Content dependency (flag, not implementation):** `diagnostic-questions.json` and the competency taxonomy must be re-scoped to Polynômes-only for MVP. This is a content/data task, noted here as a spec assumption, not a screen to design.

## 9. Migration table

| Old                                                                                         | New                        | Action                          |
| ------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------- |
| WelcomeScreen                                                                               | Welcome                    | reuse, reframe copy             |
| ExamSelectionScreen                                                                         | —                          | delete                          |
| —                                                                                           | Class                      | new                             |
| SubjectSelectionScreen                                                                      | Subject                    | reuse, regate on Class not Exam |
| —                                                                                           | Current Chapter            | new                             |
| PreparingScreen                                                                             | (transition)               | reuse                           |
| DiagnosticIntroScreen                                                                       | (transition)               | reuse                           |
| DiagnosticQuestionScreen                                                                    | Chapter Diagnostic         | reuse, chapter-scoped data      |
| DiagnosticAnalysisScreen                                                                    | (transition)               | reuse                           |
| DiagnosticCompleteScreen                                                                    | Results                    | reuse, reframe + branch logic   |
| RevisionPlanScreen                                                                          | Personalized Revision Plan | reuse, conditional              |
| RevisionOverviewScreen / RevisionNoteScreen / ValidationQuizScreen / ValidationResultScreen | Learning Journey subflow   | reuse                           |
| HomeScreen                                                                                  | Home                       | reuse                           |
| ProfileScreen                                                                               | Profil                     | reuse, unchanged                |
| DiagnosticScreen (tab)                                                                      | —                          | delete                          |
| ReadyForExamScreen                                                                          | —                          | delete                          |
| FinalDiagnosticResultScreen                                                                 | —                          | delete                          |
| ComparisonScreen                                                                            | —                          | delete                          |
| BottomNavigation (4 tabs)                                                                   | BottomNavigation (3 tabs)  | edit                            |

## Locked decisions (recap)

1. Class/Subject/Chapter are real picker screens with locked options, not auto-skip — sets up scaffold for future chapters.
2. Revision Plan branch triggers on "any weak competency" (priority or in-progress bucket non-empty), not a raw score threshold.
3. Learning Journey = the existing Revision tab, reframed around the chapter — not a separate one-time hub screen.
4. All exam-track leftovers are deleted outright, not deprecated-in-place. No exam-mode concept survives in MVP.
