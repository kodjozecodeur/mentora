# Study Pack Engine + Printable Export — Design

## Goal

The Study Pack — not the PDF — is the product: a frozen, reproducible snapshot that
turns a completed diagnostic + its generated revision plan + the matching revision notes
into a single document a student can print or save as PDF. The PDF is just one
representation of it, produced by handing print-optimized HTML to the browser's own
`window.print()`. No PDF library (no pdf-lib, no jsPDF), no complex renderer.

This sprint builds the engine, the document model, the HTML adapter, and the download
function only. It does **not** wire a button into any existing screen — Codex does that
later against the exposed API. It does not touch `OnboardingFlow.tsx`, any App Shell,
bottom navigation, or the post-diagnostic home screen; those files are not read for
wiring purposes and are not modified.

## Pipeline

```
BuildStudyPackInput
        ↓ buildStudyPack()
StudyPack (frozen domain snapshot)
        ↓ studyPackToDocumentModel()
DocumentModel (Document → Section[] → Block[])
        ↓ renderDocumentModelToHtml()
Printable HTML (self-contained string, print CSS inline)
        ↓ downloadStudyPack()
New browser window → window.print() → user saves as PDF
```

Every layer up to and including `renderDocumentModelToHtml` is a pure function: no
React, no Next.js, no DOM. Only `downloadStudyPack` touches `window`/`document`, and it
is the single seam Codex wires a click handler to.

## File layout

All new files. Nothing existing is modified except where explicitly noted.

- `src/types/study-pack.ts` — `StudyPack`, `StudyPackSection` (discriminated union),
  `StudyPackSnapshot`, `DocumentModel`, `DocumentSection`, `DocumentBlock`.
- `src/services/study-pack/builder.ts` + `.test.ts` — `buildStudyPack()`.
- `src/services/study-pack/documentModel.ts` + `.test.ts` — `studyPackToDocumentModel()`.
- `src/services/study-pack/htmlAdapter.ts` + `.test.ts` — `renderDocumentModelToHtml()`
  and the print CSS (`@page`, `@media print`, `page-break-before`,
  `break-inside: avoid`).
- `src/services/study-pack/downloadStudyPack.ts` + `.test.ts` — DOM-only: opens a
  window, writes the HTML, calls `window.print()`. Tested via `vi.stubGlobal`, the same
  pattern `storage.test.ts` already uses for `localStorage` — no jsdom, no new
  dependency.
- `src/services/study-pack/markdown.ts` — a local `stripInlineMarkdown` (the same 2-line
  regex already in `src/features/revision/notePresentation.ts`), duplicated deliberately
  rather than imported: importing from `features/` into `services/` would invert the
  existing layering (features depend on services, not the reverse), and the function is
  small enough that duplication is cheaper than a cross-layer coupling or refactoring a
  file another agent is actively working near.
- `src/services/study-pack/index.ts` — public barrel export: the granular functions
  above, plus one convenience `exportStudyPackToPdf(input: BuildStudyPackInput): void`
  that runs the full pipeline and calls `downloadStudyPack`. This convenience function
  is the literal callback Codex wires to a future "Télécharger mon Study Pack" button.
- `src/app/dev/study-pack-preview/page.tsx` — unlinked dev-only route: runs a hardcoded
  sample `BuildStudyPackInput` through the pipeline and renders the resulting HTML in an
  `<iframe>` for manual visual QA. **Guarded**: if
  `process.env.NODE_ENV === 'production'`, it calls Next.js's `notFound()` immediately
  and renders nothing else. Not linked from any nav, layout, or existing screen.

## Types

```ts
type StudyPackSnapshot = {
  algorithmVersion: string;
  contentVersion: string;
  diagnosticId: string;
  revisionPlanId: string;
  generatedAt: string; // ISO 8601
};

type StudyPack = {
  id: string;
  snapshot: StudyPackSnapshot;
  sections: StudyPackSection[]; // fixed order: cover, diagnostic-summary, revision-plan, revision-notes, corrections
};

type StudyPackSection =
  | {
      kind: 'cover';
      studentName: string | null;
      date: string; // ISO date, formatting is the HTML adapter's job
      subjectLabel: string;
      examLabel: string;
      readinessScore: number;
      diagnosticSummary: string;
    }
  | {
      kind: 'diagnostic-summary';
      strengths: CompetencyMastery[];
      weaknesses: CompetencyMastery[];
      topPriority: RevisionRecommendation | null;
      estimatedDays: number;
      estimatedTotalMinutes: number;
    }
  | {
      kind: 'revision-plan';
      items: {
        dayNumber: number;
        competencyLabel: string;
        objective: string;
        estimatedMinutes: number;
        successCriterion: string;
      }[];
    }
  | { kind: 'revision-notes'; notes: RevisionNote[] } // filtered + ordered by buildStudyPack, never trusted from the caller
  | {
      kind: 'corrections';
      entries: {
        competencyLabel: string;
        exercises: { order: number; statement: string; answer: string; correction: string }[];
      }[];
    };

type BuildStudyPackInput = {
  diagnosticResult: DiagnosticResult;
  revisionPlan: RevisionPlan;
  revisionUnits: RevisionUnit[]; // to resolve each session's objective, same join RevisionPlanScreen already does
  allRevisionNotes: RevisionNote[]; // full catalog; buildStudyPack selects only what the plan references
  studentName?: string;
  subjectLabel: string;
  examLabel: string;
  generatedAt?: string; // defaults to now; callers/tests pass a fixed value for determinism
  algorithmVersion?: string; // defaults to a STUDY_PACK_ALGORITHM_VERSION constant
};

type DocumentModel = { title: string; sections: DocumentSection[] };
type DocumentSection = { id: string; pageBreakBefore?: boolean; blocks: DocumentBlock[] };
type DocumentBlock =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'keyValue'; items: { label: string; value: string }[] }
  | { kind: 'card'; blocks: DocumentBlock[]; avoidBreak?: boolean }
  | { kind: 'divider' };
```

Existing domain types (`CompetencyMastery`, `RevisionRecommendation`, `RevisionNote`,
`RevisionUnit`, `RevisionPlan`, `DiagnosticResult`) are reused directly, never
re-declared.

## Content decisions

- **Cover diagnostic summary**: `cover.diagnosticSummary` is composed by
  `buildStudyPack` itself, not borrowed from `resultCopy.ts` (that file lives under
  `features/diagnostic`, same cross-layer concern as above). Format:
  `"{N} point(s) fort(s), {M} compétence(s) à renforcer"`, plus `", priorité : {label}"`
  appended when `topPriority` is non-null. Singular/plural on "point fort"/"compétence"
  follows N/M (1 ⇒ singular, everything else including 0 ⇒ plural). Pure string
  formatting, no dependency on the Results Screen's copy helpers.
- **Note selection**: `buildStudyPack` computes the `revision-notes` section itself by
  walking `revisionPlan.sessions` in order, deduping by `competencyId` (mirroring what
  `getNotesForRevisionPlan` already does in the notes repository), and looking each one
  up in `allRevisionNotes`. It never emits the full catalog. If a session's competency
  has no matching note, `buildStudyPack` throws — same failure mode as
  `resolveRevisionSessionContent` already uses elsewhere, not a silent gap.
- **Exercises vs. corrections**: on-screen, a fiche's mini-exercise shows
  statement+answer+correction together. In the Study Pack, each fiche's "Mini exercices"
  block shows **statement only**. All answers and corrections move to the separate,
  final "Corrigés" section, grouped by competency in the same order as the fiches. This
  is what "never mix exercise and correction" requires.
- **Page breaks** (per your approval): cover is always its own page
  (`pageBreakBefore` on the section right after it); each fiche gets its own page
  (`pageBreakBefore: true` per fiche); the corrections section is `pageBreakBefore:
true`. Cards (e.g. a single mini-exercise, a single common-mistake box) get
  `break-inside: avoid` so a card never splits across a page boundary.
- **Design**: white background, Mentora's existing palette used sparingly (borders/
  headings only, no big color fills), legible in black-and-white printing, Satoshi font
  stack with system-font fallback (no network font fetch inside a print window).
  Independent CSS — no import from the app's Tailwind build, no dependency on existing
  React components.

## `downloadStudyPack`

```ts
function downloadStudyPack(html: string, options?: { windowName?: string }): void;
```

Opens a new window (`window.open`), writes the HTML string into it
(`newWindow.document.write` + `.close()`), and calls `newWindow.print()`. If
`window.open` returns `null` (popup blocked), it throws a descriptive error rather than
failing silently — Codex's caller can catch this and show a UI message later.

## Tests

Each pure layer gets deterministic tests with a fixed `generatedAt`/input fixture
(plain equality, not `toMatchSnapshot`):

- `buildStudyPack`: constructs the right sections from a fixture `DiagnosticResult` +
  `RevisionPlan` + notes catalog; only notes referenced by `plan.sessions` appear, in
  plan order, deduped; throws on a missing note; `snapshot.algorithmVersion` /
  `contentVersion` / `generatedAt` / `diagnosticId` / `revisionPlanId` are all present;
  re-running with the same input and same `generatedAt` produces a deep-equal result
  (determinism); mutating the returned object (or the caller's input after the call)
  does not change a second call's output (frozen snapshot — verified via `Object.freeze`
  - a mutation attempt in a test, not just by convention).
- `studyPackToDocumentModel`: stable output for a fixed `StudyPack` fixture; cover section
  has `pageBreakBefore` on the following section; each fiche section has
  `pageBreakBefore: true`; corrections section has `pageBreakBefore: true`; mini-exercise
  blocks in the notes section carry no answer/correction text anywhere in their block
  tree.
- `renderDocumentModelToHtml`: same `DocumentModel` in ⇒ byte-identical HTML out
  (determinism); contains the expected `@page`/`@media print`/`page-break-before`/
  `break-inside: avoid` rules; corrections content never appears before its own
  page-break section in the emitted HTML.
- `downloadStudyPack`: with a stubbed `window`/`document.write`/`.print()`, asserts the
  call sequence (open → write → close → print) and that a `null` `window.open` result
  throws instead of silently no-oping.

## Validation

`npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run build` — all must pass.
`npm run build` also exercises the dev preview route at build time (Next.js prerenders
it during `next build` unless the `notFound()` guard short-circuits it in production
mode, which is exactly what we want to confirm).

## Explicitly not doing

- No PDF-generation library of any kind.
- No wiring into `OnboardingFlow.tsx`, any App Shell, bottom navigation, or the
  post-diagnostic home screen — those files are not touched.
- No markdown parsing inside any screen component — the engine only ever consumes
  already-structured `RevisionNote`/`RevisionPlan`/`DiagnosticResult` objects.
- No new npm dependencies.
