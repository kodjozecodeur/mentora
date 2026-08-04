# Study Pack Engine + Printable Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated Study Pack Engine (domain types + pure builder + pure
DocumentModel adapter + pure HTML adapter) and a DOM-only `downloadStudyPack()` /
`exportStudyPackToPdf()` API that a future UI button can call. No PDF library — the
browser's own `window.print()` produces the PDF from print-optimized HTML.

**Architecture:** `BuildStudyPackInput → buildStudyPack() → StudyPack (frozen) →
studyPackToDocumentModel() → DocumentModel → renderDocumentModelToHtml() → HTML string →
downloadStudyPack() → new window + window.print()`. Every layer up to and including the
HTML adapter is a pure function (no React, no Next.js, no DOM). Only
`downloadStudyPack.ts` and the dev preview route touch `window`/`document`.

**Tech Stack:** TypeScript, Vitest (`environment: 'node'`, no DOM — DOM-touching code is
tested via `vi.stubGlobal`, the same pattern already used in
`src/services/diagnostic/storage.test.ts`). Next.js App Router for the dev-only preview
route only.

## Global Constraints

- No new npm dependencies. No pdf-lib, no jsPDF, no PDF renderer of any kind.
- `src/types/study-pack.ts`, `src/services/study-pack/builder.ts`,
  `src/services/study-pack/documentModel.ts`, `src/services/study-pack/htmlAdapter.ts`,
  and `src/services/study-pack/markdown.ts` must not import React, `next/*`, or
  reference `window`/`document`. Only `src/services/study-pack/downloadStudyPack.ts` and
  `src/app/dev/study-pack-preview/page.tsx` may.
- Do not modify `src/features/onboarding/OnboardingFlow.tsx`, any App Shell, bottom
  navigation, or post-diagnostic home screen file. None of these currently exist in the
  repo as of this plan; if any appear mid-task (another agent may be building them
  concurrently), do not open or edit them — this plan only ever creates new files under
  `src/types/study-pack.ts`, `src/services/study-pack/`, and
  `src/app/dev/study-pack-preview/`.
- Do not modify any existing file under `src/features/diagnostic/`,
  `src/features/revision/`, `src/services/revision/`, `src/services/revision-notes/`,
  `src/services/diagnostic/`, `src/types/diagnostic.ts`, or `src/types/revision.ts`.
  Their exported types/functions are read and reused, never changed.
- `buildStudyPack` must select only the revision notes referenced by
  `revisionPlan.sessions` (deduped, in plan order) — never the full notes catalog — and
  must throw if a session's competency has no matching note.
- A fiche's "Mini exercices" block shows the exercise statement only — never the answer
  or correction. All answers/corrections live solely in the separate Corrections
  section.
- Page breaks: `cover` carries `pageBreakAfter: true` (cover is always alone on page 1 —
  expressed via `page-break-after` on the cover section itself, not via
  `page-break-before` on whatever follows it); every fiche section and the corrections
  section carry `pageBreakBefore: true` (`page-break-before`); every `card` block gets
  `break-inside: avoid` / `page-break-inside: avoid` so it never splits across a page.
  Both `page-break-before` and `page-break-after` must appear in the emitted CSS/usage,
  each for a distinct, non-redundant reason.
- `StudyPack.snapshot` must carry `algorithmVersion`, `contentVersion`, `generatedAt`,
  `diagnosticId`, `revisionPlanId`. The returned `StudyPack` (including every nested
  array and object) must be deep-frozen — mutation attempts must throw.
- `src/app/dev/study-pack-preview/page.tsx` must call Next's `notFound()` (from
  `next/navigation`) and render nothing else when `process.env.NODE_ENV ===
  'production'`. It must not be linked from any nav, layout, or existing screen.
- **Do not run `git commit` in any task step below.** The human partner running this
  session holds all changes uncommitted until every task has been reviewed together and
  a final whole-diff review has passed. Do every other step (write test, run it, verify
  fail/pass, etc.) exactly as written, but skip each task's final "Commit" step —
  leave the files as uncommitted working-tree changes.

---

### Task 1: Study Pack domain types

**Files:**
- Create: `src/types/study-pack.ts`

**Interfaces:**
- Consumes: `CompetencyMastery`, `DiagnosticResult`, `RevisionRecommendation` from
  `@/types/diagnostic`; `RevisionPlan`, `RevisionUnit` from `@/types/revision`;
  `RevisionNote` from `@/services/revision-notes/types`.
- Produces: `StudyPack`, `StudyPackSnapshot`, `StudyPackSection` (and its 5 variants:
  `StudyPackCoverSection`, `StudyPackDiagnosticSummarySection`,
  `StudyPackRevisionPlanSection` with `StudyPackRevisionPlanItem`,
  `StudyPackRevisionNotesSection`, `StudyPackCorrectionsSection` with
  `StudyPackCorrectionEntry`/`StudyPackCorrectionExercise`), `BuildStudyPackInput`,
  `DocumentModel`, `DocumentSection`, `DocumentBlock` — consumed by every later task.

This is a pure type-declaration file; there is no runtime behavior to unit test. The
deliverable is verified by `npx tsc --noEmit` and by every later task successfully
importing and using these types.

- [ ] **Step 1: Write the file**

Create `src/types/study-pack.ts`:

```ts
import type { CompetencyMastery, DiagnosticResult, RevisionRecommendation } from './diagnostic';
import type { RevisionPlan, RevisionUnit } from './revision';
import type { RevisionNote } from '@/services/revision-notes/types';

export type StudyPackSnapshot = {
  algorithmVersion: string;
  contentVersion: string;
  diagnosticId: string;
  revisionPlanId: string;
  generatedAt: string;
};

export type StudyPackCoverSection = {
  kind: 'cover';
  studentName: string | null;
  date: string;
  subjectLabel: string;
  examLabel: string;
  readinessScore: number;
  diagnosticSummary: string;
};

export type StudyPackDiagnosticSummarySection = {
  kind: 'diagnostic-summary';
  strengths: CompetencyMastery[];
  weaknesses: CompetencyMastery[];
  topPriority: RevisionRecommendation | null;
  estimatedDays: number;
  estimatedTotalMinutes: number;
};

export type StudyPackRevisionPlanItem = {
  dayNumber: number;
  competencyLabel: string;
  objective: string;
  estimatedMinutes: number;
  successCriterion: string;
};

export type StudyPackRevisionPlanSection = {
  kind: 'revision-plan';
  items: StudyPackRevisionPlanItem[];
};

export type StudyPackRevisionNotesSection = {
  kind: 'revision-notes';
  notes: RevisionNote[];
};

export type StudyPackCorrectionExercise = {
  order: number;
  statement: string;
  answer: string;
  correction: string;
};

export type StudyPackCorrectionEntry = {
  competencyLabel: string;
  exercises: StudyPackCorrectionExercise[];
};

export type StudyPackCorrectionsSection = {
  kind: 'corrections';
  entries: StudyPackCorrectionEntry[];
};

export type StudyPackSection =
  | StudyPackCoverSection
  | StudyPackDiagnosticSummarySection
  | StudyPackRevisionPlanSection
  | StudyPackRevisionNotesSection
  | StudyPackCorrectionsSection;

export type StudyPack = {
  id: string;
  snapshot: StudyPackSnapshot;
  sections: StudyPackSection[];
};

export type BuildStudyPackInput = {
  diagnosticResult: DiagnosticResult;
  revisionPlan: RevisionPlan;
  revisionUnits: RevisionUnit[];
  allRevisionNotes: RevisionNote[];
  studentName?: string;
  subjectLabel: string;
  examLabel: string;
  generatedAt?: string;
  algorithmVersion?: string;
};

export type DocumentBlock =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'keyValue'; items: { label: string; value: string }[] }
  | { kind: 'card'; blocks: DocumentBlock[]; avoidBreak?: boolean };

export type DocumentSection = {
  id: string;
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
  blocks: DocumentBlock[];
};

export type DocumentModel = {
  title: string;
  sections: DocumentSection[];
};
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors (this file has no consumers yet, so it can only fail on syntax/type
errors within itself).

- [ ] **Step 3: Commit**

(Skipped — see Global Constraints. Leave the file as an uncommitted addition.)

---

### Task 2: Markdown helpers

**Files:**
- Create: `src/services/study-pack/markdown.ts`
- Test: `src/services/study-pack/markdown.test.ts`

**Interfaces:**
- Consumes: nothing (pure string functions).
- Produces: `stripInlineMarkdown(value: string): string`, `splitParagraphs(value:
  string): string[]` — consumed by Task 4 (`documentModel.ts`).

- [ ] **Step 1: Write the failing test**

Create `src/services/study-pack/markdown.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { splitParagraphs, stripInlineMarkdown } from './markdown';

describe('stripInlineMarkdown', () => {
  it('removes bold markers', () => {
    expect(stripInlineMarkdown('**Situation :** Développer.')).toBe('Situation : Développer.');
  });

  it('unwraps inline code spans', () => {
    expect(stripInlineMarkdown('Développer `3(2x - 1)`.')).toBe('Développer 3(2x - 1).');
  });

  it('handles both in the same string', () => {
    expect(stripInlineMarkdown('**Étape 1 :** Distribuer `6x - 3`.')).toBe(
      'Étape 1 : Distribuer 6x - 3.',
    );
  });

  it('leaves plain text untouched', () => {
    expect(stripInlineMarkdown('Une expression littérale.')).toBe('Une expression littérale.');
  });
});

describe('splitParagraphs', () => {
  it('splits on blank lines and trims each paragraph', () => {
    const input = 'Premier paragraphe.\n\nDeuxième paragraphe.\n\n\nTroisième paragraphe.';
    expect(splitParagraphs(input)).toEqual([
      'Premier paragraphe.',
      'Deuxième paragraphe.',
      'Troisième paragraphe.',
    ]);
  });

  it('returns a single-item array for text with no blank lines', () => {
    expect(splitParagraphs('Un seul paragraphe sur\nplusieurs lignes.')).toEqual([
      'Un seul paragraphe sur\nplusieurs lignes.',
    ]);
  });

  it('drops empty paragraphs and returns an empty array for blank input', () => {
    expect(splitParagraphs('   \n\n   ')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/services/study-pack/markdown.test.ts`
Expected: FAIL — cannot find module `./markdown`.

- [ ] **Step 3: Implement**

Create `src/services/study-pack/markdown.ts`:

```ts
export function stripInlineMarkdown(value: string): string {
  return value.replace(/\*\*/g, '').replace(/`([^`]+)`/g, '$1');
}

export function splitParagraphs(value: string): string[] {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/study-pack/markdown.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

(Skipped — see Global Constraints.)

---

### Task 3: Test fixtures + `buildStudyPack`

**Files:**
- Create: `src/services/study-pack/testFixtures.ts`
- Create: `src/services/study-pack/builder.ts`
- Test: `src/services/study-pack/builder.test.ts`

**Interfaces:**
- Consumes: types from Task 1 (`@/types/study-pack`).
- Produces: `buildStudyPack(input: BuildStudyPackInput): StudyPack`,
  `STUDY_PACK_ALGORITHM_VERSION` constant — consumed by Task 4, Task 7 (barrel), Task 8
  (dev route). `testFixtures.ts` exports `fixtureDiagnosticResult`,
  `fixtureRevisionUnits`, `fixtureRevisionPlan`, `fixtureRevisionNotes`,
  `fixtureBuildStudyPackInput` — consumed by this task's test and by Tasks 4 and 5's
  tests.

- [ ] **Step 1: Write the shared test fixtures**

Create `src/services/study-pack/testFixtures.ts`:

```ts
import type { CompetencyMastery, DiagnosticResult, RevisionRecommendation } from '@/types/diagnostic';
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

export const fixtureRevisionUnits: RevisionUnit[] = [
  {
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
  },
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
```

- [ ] **Step 2: Write the failing test**

Create `src/services/study-pack/builder.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildStudyPack } from './builder';
import {
  fixtureBuildStudyPackInput,
  fixtureRevisionNotes,
} from './testFixtures';
import type { StudyPackSection } from '@/types/study-pack';

function expectKind<K extends StudyPackSection['kind']>(
  section: StudyPackSection,
  kind: K,
): asserts section is Extract<StudyPackSection, { kind: K }> {
  expect(section.kind).toBe(kind);
}

describe('buildStudyPack', () => {
  it('builds the fixed section order with correctly derived cover content', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);

    expect(pack.sections.map((section) => section.kind)).toEqual([
      'cover',
      'diagnostic-summary',
      'revision-plan',
      'revision-notes',
      'corrections',
    ]);

    const cover = pack.sections[0];
    expectKind(cover, 'cover');
    expect(cover.studentName).toBe('Awa');
    expect(cover.subjectLabel).toBe('Mathématiques');
    expect(cover.examLabel).toBe("Brevet d'études du premier cycle (BEPC)");
    expect(cover.readinessScore).toBe(67);
    expect(cover.diagnosticSummary).toBe(
      '1 point fort, 1 compétence à renforcer, priorité : Calcul littéral',
    );
  });

  it('falls back to a null student name when none is given', () => {
    const pack = buildStudyPack({ ...fixtureBuildStudyPackInput, studentName: undefined });
    const cover = pack.sections[0];
    expectKind(cover, 'cover');
    expect(cover.studentName).toBeNull();
  });

  it('trims a whitespace-only student name to null', () => {
    const pack = buildStudyPack({ ...fixtureBuildStudyPackInput, studentName: '   ' });
    const cover = pack.sections[0];
    expectKind(cover, 'cover');
    expect(cover.studentName).toBeNull();
  });

  it('carries diagnostic summary counts and revision plan totals', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    const summary = pack.sections[1];
    expectKind(summary, 'diagnostic-summary');
    expect(summary.strengths).toHaveLength(1);
    expect(summary.weaknesses).toHaveLength(1);
    expect(summary.topPriority?.competencyLabel).toBe('Calcul littéral');
    expect(summary.estimatedDays).toBe(1);
    expect(summary.estimatedTotalMinutes).toBe(20);
  });

  it('joins each session to its unit objective and success criterion', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    const plan = pack.sections[2];
    expectKind(plan, 'revision-plan');
    expect(plan.items).toEqual([
      {
        dayNumber: 1,
        competencyLabel: 'Calcul littéral',
        objective: 'Développer et réduire correctement une expression.',
        estimatedMinutes: 20,
        successCriterion: 'Réussir deux exercices consécutifs de calcul littéral.',
      },
    ]);
  });

  it('includes only the notes referenced by the plan, in plan order, deduped', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    const notesSection = pack.sections[3];
    expectKind(notesSection, 'revision-notes');
    expect(notesSection.notes.map((note) => note.competencyId)).toEqual(['calcul-litteral']);
  });

  it('throws when the plan references a competency with no matching note', () => {
    expect(() =>
      buildStudyPack({ ...fixtureBuildStudyPackInput, allRevisionNotes: [] }),
    ).toThrow(/calcul-litteral/);
  });

  it('separates exercises from corrections: corrections carry statement, answer, and correction', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    const corrections = pack.sections[4];
    expectKind(corrections, 'corrections');
    expect(corrections.entries).toEqual([
      {
        competencyLabel: 'Calcul littéral',
        exercises: [
          {
            order: 1,
            statement: 'Développer `2(x + 3) - x`.',
            answer: '`x + 6`.',
            correction: '`2(x + 3) - x = 2x + 6 - x = x + 6`.',
          },
          {
            order: 2,
            statement: 'Développer `5(x - 2) - 2(x + 1)`.',
            answer: '`3x - 12`.',
            correction: '`5x - 10 - 2x - 2 = 3x - 12`.',
          },
        ],
      },
    ]);
  });

  it('carries version metadata for reproducibility', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    expect(pack.snapshot).toEqual({
      algorithmVersion: 'study-pack.v1',
      contentVersion: '1.0.0',
      diagnosticId: 'diagnostic:test',
      revisionPlanId: 'revision-plan:diagnostic:test:study-pack.v1:1.0.0',
      generatedAt: '2026-08-04T10:10:00.000Z',
    });
  });

  it('defaults generatedAt and algorithmVersion when not supplied', () => {
    const { generatedAt: _generatedAt, algorithmVersion: _algorithmVersion, ...rest } =
      fixtureBuildStudyPackInput;
    const pack = buildStudyPack(rest);
    expect(pack.snapshot.algorithmVersion).toBe('study-pack.v1');
    expect(typeof pack.snapshot.generatedAt).toBe('string');
    expect(Number.isNaN(Date.parse(pack.snapshot.generatedAt))).toBe(false);
  });

  it('is deterministic: same input, same generatedAt, produces a deep-equal result', () => {
    const first = buildStudyPack(fixtureBuildStudyPackInput);
    const second = buildStudyPack(fixtureBuildStudyPackInput);
    expect(first).toEqual(second);
  });

  it('returns a frozen snapshot that cannot be mutated', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    expect(() => {
      // @ts-expect-error intentional mutation attempt for the frozen-snapshot test
      pack.snapshot.algorithmVersion = 'tampered';
    }).toThrow();
    expect(() => {
      // @ts-expect-error intentional mutation attempt for the frozen-snapshot test
      pack.sections.push(pack.sections[0]);
    }).toThrow();
  });

  it('is unaffected by mutating the caller input after the call', () => {
    const input = { ...fixtureBuildStudyPackInput, allRevisionNotes: [...fixtureRevisionNotes] };
    const pack = buildStudyPack(input);
    input.allRevisionNotes.push({ ...fixtureRevisionNotes[0], id: 'injected' });

    const notesSection = pack.sections[3];
    expectKind(notesSection, 'revision-notes');
    expect(notesSection.notes).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/services/study-pack/builder.test.ts`
Expected: FAIL — cannot find module `./builder`.

- [ ] **Step 4: Implement**

Create `src/services/study-pack/builder.ts`:

```ts
import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionPlan } from '@/types/revision';
import type { RevisionNote } from '@/services/revision-notes/types';
import type { BuildStudyPackInput, StudyPack, StudyPackSection } from '@/types/study-pack';

export const STUDY_PACK_ALGORITHM_VERSION = 'study-pack.v1';

export function buildStudyPack(input: BuildStudyPackInput): StudyPack {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const algorithmVersion = input.algorithmVersion ?? STUDY_PACK_ALGORITHM_VERSION;
  const notes = selectNotesForPlan(input.revisionPlan, input.allRevisionNotes);

  const sections: StudyPackSection[] = [
    buildCoverSection(input, generatedAt),
    buildDiagnosticSummarySection(input),
    buildRevisionPlanSection(input),
    { kind: 'revision-notes', notes },
    buildCorrectionsSection(notes),
  ];

  const studyPack: StudyPack = {
    id: `study-pack:${input.revisionPlan.diagnosticId}:${algorithmVersion}:${input.revisionPlan.contentVersion}`,
    snapshot: {
      algorithmVersion,
      contentVersion: input.revisionPlan.contentVersion,
      diagnosticId: input.revisionPlan.diagnosticId,
      revisionPlanId: input.revisionPlan.id,
      generatedAt,
    },
    sections,
  };

  return deepFreeze(studyPack);
}

function selectNotesForPlan(plan: RevisionPlan, catalog: RevisionNote[]): RevisionNote[] {
  const byCompetencyId = new Map(catalog.map((note) => [note.competencyId, note]));
  const seen = new Set<string>();
  const notes: RevisionNote[] = [];

  for (const session of plan.sessions) {
    if (seen.has(session.competencyId)) continue;
    const note = byCompetencyId.get(session.competencyId);
    if (!note) {
      throw new Error(
        `Aucune fiche de révision trouvée pour la compétence « ${session.competencyId} »`,
      );
    }
    seen.add(session.competencyId);
    notes.push(note);
  }

  return notes;
}

function buildCoverSection(input: BuildStudyPackInput, generatedAt: string): StudyPackSection {
  const trimmedName = input.studentName?.trim();
  return {
    kind: 'cover',
    studentName: trimmedName ? trimmedName : null,
    date: generatedAt,
    subjectLabel: input.subjectLabel,
    examLabel: input.examLabel,
    readinessScore: input.diagnosticResult.readinessScore,
    diagnosticSummary: formatDiagnosticSummary(input.diagnosticResult),
  };
}

function formatDiagnosticSummary(result: DiagnosticResult): string {
  const strengthsCount = result.strengths.length;
  const weaknessesCount = result.weaknesses.length;
  const topPriority = result.revisionPriorities[0] ?? null;

  const strengthsPart = `${strengthsCount} point${strengthsCount === 1 ? '' : 's'} fort${strengthsCount === 1 ? '' : 's'}`;
  const weaknessesPart = `${weaknessesCount} compétence${weaknessesCount === 1 ? '' : 's'} à renforcer`;
  const priorityPart = topPriority ? `, priorité : ${topPriority.competencyLabel}` : '';

  return `${strengthsPart}, ${weaknessesPart}${priorityPart}`;
}

function buildDiagnosticSummarySection(input: BuildStudyPackInput): StudyPackSection {
  return {
    kind: 'diagnostic-summary',
    strengths: input.diagnosticResult.strengths,
    weaknesses: input.diagnosticResult.weaknesses,
    topPriority: input.diagnosticResult.revisionPriorities[0] ?? null,
    estimatedDays: input.revisionPlan.estimatedDays,
    estimatedTotalMinutes: input.revisionPlan.estimatedTotalMinutes,
  };
}

function buildRevisionPlanSection(input: BuildStudyPackInput): StudyPackSection {
  const unitsById = new Map(input.revisionUnits.map((unit) => [unit.id, unit]));

  const items = input.revisionPlan.sessions.map((session) => {
    const unit = unitsById.get(session.revisionUnitId);
    if (!unit) {
      throw new Error(`Aucune unité de révision trouvée pour la session « ${session.id} »`);
    }
    return {
      dayNumber: session.dayNumber,
      competencyLabel: session.competencyLabel,
      objective: unit.objective,
      estimatedMinutes: session.estimatedMinutes,
      successCriterion:
        session.exitCriteria[0]?.description ?? 'Terminer les activités de la session.',
    };
  });

  return { kind: 'revision-plan', items };
}

function buildCorrectionsSection(notes: RevisionNote[]): StudyPackSection {
  const entries = notes.map((note) => ({
    competencyLabel: note.title,
    exercises: note.miniExercises.map((exercise) => ({
      order: exercise.order,
      statement: exercise.statement,
      answer: exercise.answer,
      correction: exercise.correction,
    })),
  }));

  return { kind: 'corrections', entries };
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const key of Object.getOwnPropertyNames(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
    Object.freeze(value);
  }
  return value;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/services/study-pack/builder.test.ts`
Expected: PASS (13 tests)

- [ ] **Step 6: Commit**

(Skipped — see Global Constraints.)

---

### Task 4: `studyPackToDocumentModel`

**Files:**
- Create: `src/services/study-pack/documentModel.ts`
- Test: `src/services/study-pack/documentModel.test.ts`

**Interfaces:**
- Consumes: `StudyPack`, `StudyPackSection`, `DocumentModel`, `DocumentSection`,
  `DocumentBlock` from `@/types/study-pack`; `stripInlineMarkdown`, `splitParagraphs`
  from `./markdown` (Task 2); `buildStudyPack` + fixtures from Task 3 (test only).
- Produces: `studyPackToDocumentModel(pack: StudyPack): DocumentModel` — consumed by
  Task 5 and Task 7.

- [ ] **Step 1: Write the failing test**

Create `src/services/study-pack/documentModel.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildStudyPack } from './builder';
import { studyPackToDocumentModel } from './documentModel';
import { fixtureBuildStudyPackInput } from './testFixtures';

function buildFixtureDocument() {
  const pack = buildStudyPack(fixtureBuildStudyPackInput);
  return studyPackToDocumentModel(pack);
}

describe('studyPackToDocumentModel', () => {
  it('produces one section per fixed content area, plus one section per fiche', () => {
    const document = buildFixtureDocument();
    // cover, diagnostic-summary, revision-plan, 1 fiche (calcul-litteral), corrections
    expect(document.sections.map((section) => section.id)).toEqual([
      'cover',
      'diagnostic-summary',
      'revision-plan',
      'fiche-calcul-litteral',
      'corrections',
    ]);
  });

  it('marks cover with pageBreakAfter instead of marking the next section pageBreakBefore', () => {
    const document = buildFixtureDocument();
    expect(document.sections[0].id).toBe('cover');
    expect(document.sections[0].pageBreakAfter).toBe(true);
    expect(document.sections[0].pageBreakBefore).toBeFalsy();
    expect(document.sections[1].pageBreakBefore).toBeFalsy();
  });

  it('forces a page break on every fiche section and on corrections', () => {
    const document = buildFixtureDocument();
    const fiche = document.sections.find((section) => section.id === 'fiche-calcul-litteral');
    const corrections = document.sections.find((section) => section.id === 'corrections');
    expect(fiche?.pageBreakBefore).toBe(true);
    expect(corrections?.pageBreakBefore).toBe(true);
  });

  it('strips inline markdown from fiche content', () => {
    const document = buildFixtureDocument();
    const fiche = document.sections.find((section) => section.id === 'fiche-calcul-litteral');
    const flat = JSON.stringify(fiche);
    expect(flat).not.toContain('**');
    expect(flat).not.toMatch(/`[^`]+`/);
    expect(flat).toContain("c'est distribuer");
  });

  it('never includes an exercise answer or correction inside a fiche section', () => {
    const document = buildFixtureDocument();
    const fiche = document.sections.find((section) => section.id === 'fiche-calcul-litteral');
    const flat = JSON.stringify(fiche);
    expect(flat).not.toContain('x + 6');
    expect(flat).not.toContain('3x - 12');
    expect(flat).toContain('Développer 2(x + 3) - x');
  });

  it('includes both the statement and the answer/correction inside corrections', () => {
    const document = buildFixtureDocument();
    const corrections = document.sections.find((section) => section.id === 'corrections');
    const flat = JSON.stringify(corrections);
    expect(flat).toContain('Développer 2(x + 3) - x');
    expect(flat).toContain('x + 6');
    expect(flat).toContain('2x + 6 - x = x + 6');
  });

  it('renders the revision plan as a table with one row per session', () => {
    const document = buildFixtureDocument();
    const planSection = document.sections.find((section) => section.id === 'revision-plan');
    const table = planSection?.blocks.find((block) => block.kind === 'table');
    if (!table || table.kind !== 'table') throw new Error('expected a table block');
    expect(table.headers).toEqual(['Jour', 'Compétence', 'Objectif', 'Durée', 'Critère de réussite']);
    expect(table.rows).toEqual([
      [
        '1',
        'Calcul littéral',
        'Développer et réduire correctement une expression.',
        '20 min',
        'Réussir deux exercices consécutifs de calcul littéral.',
      ],
    ]);
  });

  it('is deterministic: same StudyPack in, structurally identical DocumentModel out', () => {
    const pack = buildStudyPack(fixtureBuildStudyPackInput);
    const first = studyPackToDocumentModel(pack);
    const second = studyPackToDocumentModel(pack);
    expect(first).toEqual(second);
  });

  it('marks every card block as break-avoiding', () => {
    const document = buildFixtureDocument();
    const cards = document.sections.flatMap((section) =>
      section.blocks.filter((block) => block.kind === 'card'),
    );
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      if (card.kind !== 'card') throw new Error('expected a card block');
      expect(card.avoidBreak).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/services/study-pack/documentModel.test.ts`
Expected: FAIL — cannot find module `./documentModel`.

- [ ] **Step 3: Implement**

Create `src/services/study-pack/documentModel.ts`:

```ts
import type { RevisionNote } from '@/services/revision-notes/types';
import type {
  DocumentBlock,
  DocumentModel,
  DocumentSection,
  StudyPack,
  StudyPackSection,
} from '@/types/study-pack';
import { splitParagraphs, stripInlineMarkdown } from './markdown';

export function studyPackToDocumentModel(pack: StudyPack): DocumentModel {
  const cover = findSection(pack, 'cover');
  const diagnosticSummary = findSection(pack, 'diagnostic-summary');
  const revisionPlan = findSection(pack, 'revision-plan');
  const revisionNotes = findSection(pack, 'revision-notes');
  const corrections = findSection(pack, 'corrections');

  return {
    title: 'Mentora — Study Pack',
    sections: [
      buildCoverDocSection(cover),
      buildDiagnosticSummaryDocSection(diagnosticSummary),
      buildRevisionPlanDocSection(revisionPlan),
      ...revisionNotes.notes.map(buildFicheSection),
      buildCorrectionsDocSection(corrections),
    ],
  };
}

function findSection<K extends StudyPackSection['kind']>(
  pack: StudyPack,
  kind: K,
): Extract<StudyPackSection, { kind: K }> {
  const section = pack.sections.find(
    (candidate): candidate is Extract<StudyPackSection, { kind: K }> => candidate.kind === kind,
  );
  if (!section) {
    throw new Error(`Section « ${kind} » manquante dans le Study Pack`);
  }
  return section;
}

function heading(level: 1 | 2 | 3, text: string): DocumentBlock {
  return { kind: 'heading', level, text };
}

function paragraph(text: string): DocumentBlock {
  return { kind: 'paragraph', text };
}

function list(ordered: boolean, items: string[]): DocumentBlock {
  return { kind: 'list', ordered, items };
}

function table(headers: string[], rows: string[][]): DocumentBlock {
  return { kind: 'table', headers, rows };
}

function keyValue(items: { label: string; value: string }[]): DocumentBlock {
  return { kind: 'keyValue', items };
}

function card(blocks: DocumentBlock[]): DocumentBlock {
  return { kind: 'card', blocks, avoidBreak: true };
}

function strip(value: string): string {
  return stripInlineMarkdown(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

function buildCoverDocSection(
  section: Extract<StudyPackSection, { kind: 'cover' }>,
): DocumentSection {
  return {
    id: 'cover',
    pageBreakAfter: true,
    blocks: [
      heading(1, 'Mentora'),
      paragraph('Study Pack personnalisé'),
      keyValue([
        { label: 'Élève', value: section.studentName ?? '—' },
        { label: 'Date', value: formatDate(section.date) },
        { label: 'Matière', value: section.subjectLabel },
        { label: 'Examen', value: section.examLabel },
      ]),
      heading(2, `Score de préparation : ${section.readinessScore} %`),
      paragraph(section.diagnosticSummary),
    ],
  };
}

function buildDiagnosticSummaryDocSection(
  section: Extract<StudyPackSection, { kind: 'diagnostic-summary' }>,
): DocumentSection {
  return {
    id: 'diagnostic-summary',
    blocks: [
      heading(1, 'Résumé du diagnostic'),
      heading(2, 'Points forts'),
      section.strengths.length > 0
        ? list(
            false,
            section.strengths.map((item) => `${item.competencyLabel} — ${item.masteryPercent} %`),
          )
        : paragraph("Aucune compétence n'est encore totalement maîtrisée."),
      heading(2, 'Points à renforcer'),
      section.weaknesses.length > 0
        ? list(
            false,
            section.weaknesses.map((item) => `${item.competencyLabel} — ${item.masteryPercent} %`),
          )
        : paragraph('Aucune compétence à renforcer identifiée.'),
      heading(2, 'Priorité principale'),
      paragraph(
        section.topPriority
          ? `${section.topPriority.competencyLabel} — ${section.topPriority.masteryPercent} %`
          : 'Toutes les compétences évaluées sont maîtrisées.',
      ),
      keyValue([
        { label: 'Jours de révision', value: `${section.estimatedDays}` },
        { label: 'Temps estimé', value: `${section.estimatedTotalMinutes} min` },
      ]),
    ],
  };
}

function buildRevisionPlanDocSection(
  section: Extract<StudyPackSection, { kind: 'revision-plan' }>,
): DocumentSection {
  return {
    id: 'revision-plan',
    blocks: [
      heading(1, 'Plan de révision'),
      table(
        ['Jour', 'Compétence', 'Objectif', 'Durée', 'Critère de réussite'],
        section.items.map((item) => [
          String(item.dayNumber),
          item.competencyLabel,
          item.objective,
          `${item.estimatedMinutes} min`,
          item.successCriterion,
        ]),
      ),
    ],
  };
}

function getUnderstandingContent(note: RevisionNote): string {
  const section = note.sections.find((candidate) => candidate.id === 'comprendre-simplement');
  return section ? strip(section.content) : '';
}

function buildFicheSection(note: RevisionNote): DocumentSection {
  const understandingParagraphs = splitParagraphs(getUnderstandingContent(note)).map(paragraph);

  return {
    id: `fiche-${note.competencyId}`,
    pageBreakBefore: true,
    blocks: [
      heading(1, note.title),
      heading(2, 'Comprendre simplement'),
      ...understandingParagraphs,
      heading(2, 'Exemple'),
      card([
        paragraph(strip(note.workedExample.problem)),
        list(true, note.workedExample.steps.map(strip)),
        paragraph(strip(note.workedExample.conclusion)),
      ]),
      heading(2, 'Erreurs fréquentes'),
      ...note.commonMistakes.map((mistake) =>
        card([
          heading(3, mistake.title),
          keyValue([
            { label: 'Erreur', value: strip(mistake.error) },
            { label: 'Pourquoi', value: strip(mistake.whyItHappens) },
            { label: 'Comment éviter', value: strip(mistake.howToAvoid) },
          ]),
        ]),
      ),
      heading(2, 'À retenir'),
      list(false, note.keyTakeaways.map(strip)),
      heading(2, 'Mini exercices'),
      ...note.miniExercises.map((exercise) =>
        card([heading(3, `Exercice ${exercise.order}`), paragraph(strip(exercise.statement))]),
      ),
    ],
  };
}

function buildCorrectionsDocSection(
  section: Extract<StudyPackSection, { kind: 'corrections' }>,
): DocumentSection {
  return {
    id: 'corrections',
    pageBreakBefore: true,
    blocks: [
      heading(1, 'Corrigés'),
      ...section.entries.flatMap((entry) => [
        heading(2, entry.competencyLabel),
        ...entry.exercises.map((exercise) =>
          card([
            heading(3, `Exercice ${exercise.order}`),
            paragraph(strip(exercise.statement)),
            keyValue([
              { label: 'Réponse', value: strip(exercise.answer) },
              { label: 'Correction', value: strip(exercise.correction) },
            ]),
          ]),
        ),
      ]),
    ],
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/study-pack/documentModel.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

(Skipped — see Global Constraints.)

---

### Task 5: HTML adapter

**Files:**
- Create: `src/services/study-pack/htmlAdapter.ts`
- Test: `src/services/study-pack/htmlAdapter.test.ts`

**Interfaces:**
- Consumes: `DocumentModel`, `DocumentSection`, `DocumentBlock` from
  `@/types/study-pack`; `buildStudyPack` + `studyPackToDocumentModel` + fixtures (test
  only).
- Produces: `renderDocumentModelToHtml(document: DocumentModel): string` — consumed by
  Task 7.

- [ ] **Step 1: Write the failing test**

Create `src/services/study-pack/htmlAdapter.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildStudyPack } from './builder';
import { studyPackToDocumentModel } from './documentModel';
import { renderDocumentModelToHtml } from './htmlAdapter';
import { fixtureBuildStudyPackInput } from './testFixtures';

function renderFixtureHtml(): string {
  const pack = buildStudyPack(fixtureBuildStudyPackInput);
  const document = studyPackToDocumentModel(pack);
  return renderDocumentModelToHtml(document);
}

describe('renderDocumentModelToHtml', () => {
  it('is deterministic: same DocumentModel in, byte-identical HTML out', () => {
    const document = studyPackToDocumentModel(buildStudyPack(fixtureBuildStudyPackInput));
    expect(renderDocumentModelToHtml(document)).toBe(renderDocumentModelToHtml(document));
  });

  it('produces a self-contained HTML document with inline print CSS', () => {
    const html = renderFixtureHtml();
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<style>');
    expect(html).toContain('@page');
    expect(html).toContain('@media print');
    expect(html).toContain('page-break-before');
    expect(html).toContain('page-break-after');
    expect(html).toContain('break-inside: avoid');
  });

  it('marks cover with the page-break-after class and never a page-break-before class', () => {
    const html = renderFixtureHtml();
    expect(html).toMatch(/<section class="section page-break-after" id="cover">/);
  });

  it('includes the page-break-before class only on sections that require it', () => {
    const html = renderFixtureHtml();
    expect(html).toMatch(/<section class="section" id="diagnostic-summary">/);
    expect(html).toMatch(/<section class="section page-break-before" id="fiche-calcul-litteral">/);
    expect(html).toMatch(/<section class="section page-break-before" id="corrections">/);
  });

  it('wraps every card block in a break-avoiding container', () => {
    const html = renderFixtureHtml();
    expect(html).toContain('<div class="card">');
  });

  it('renders a table with headers and rows', () => {
    const html = renderFixtureHtml();
    expect(html).toContain('<table>');
    expect(html).toContain('<th>Objectif</th>');
    expect(html).toContain('<td>Calcul littéral</td>');
  });

  it('escapes HTML-significant characters in text content', () => {
    const document = studyPackToDocumentModel(buildStudyPack(fixtureBuildStudyPackInput));
    const withUnsafeText = {
      ...document,
      sections: [
        {
          id: 'test',
          blocks: [{ kind: 'paragraph' as const, text: '<script>alert(1)</script> & "quoted"' }],
        },
        ...document.sections,
      ],
    };
    const html = renderDocumentModelToHtml(withUnsafeText);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;quoted&quot;');
  });

  it('places corrections content only inside the corrections section, after every fiche', () => {
    const html = renderFixtureHtml();
    const correctionsIndex = html.indexOf('id="corrections"');
    const ficheIndex = html.indexOf('id="fiche-calcul-litteral"');
    const answerIndex = html.indexOf('x + 6');
    expect(ficheIndex).toBeGreaterThan(-1);
    expect(correctionsIndex).toBeGreaterThan(ficheIndex);
    expect(answerIndex).toBeGreaterThan(correctionsIndex);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/services/study-pack/htmlAdapter.test.ts`
Expected: FAIL — cannot find module `./htmlAdapter`.

- [ ] **Step 3: Implement**

Create `src/services/study-pack/htmlAdapter.ts`:

```ts
import type { DocumentBlock, DocumentModel, DocumentSection } from '@/types/study-pack';

const PRINT_STYLES = `
* { box-sizing: border-box; }
@page { size: A4; margin: 20mm 16mm; }
body {
  font-family: 'Satoshi', ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: #24152A;
  background: #FFFFFF;
  margin: 0;
}
h1 { font-size: 22pt; margin: 0 0 8pt; color: #24152A; }
h2 { font-size: 15pt; margin: 16pt 0 6pt; color: #873694; }
h3 { font-size: 12pt; margin: 10pt 0 4pt; color: #24152A; }
p { font-size: 10.5pt; line-height: 1.5; margin: 0 0 8pt; }
ul, ol { margin: 0 0 8pt; padding-left: 18pt; font-size: 10.5pt; line-height: 1.5; }
table { width: 100%; border-collapse: collapse; margin: 0 0 10pt; font-size: 9.5pt; }
th, td { border: 1px solid #EBDDEC; padding: 4pt 6pt; text-align: left; vertical-align: top; }
th { background: #FDF2FF; font-weight: 700; }
dl.key-value { display: grid; grid-template-columns: max-content 1fr; gap: 3pt 10pt; margin: 0 0 10pt; font-size: 10.5pt; }
dl.key-value dt { font-weight: 700; color: #873694; margin: 0; }
dl.key-value dd { margin: 0; }
.card {
  border: 1px solid #EBDDEC;
  border-radius: 6pt;
  padding: 8pt 10pt;
  margin: 0 0 8pt;
  break-inside: avoid;
  page-break-inside: avoid;
}
.page-break-before { page-break-before: always; break-before: page; }
.page-break-after { page-break-after: always; break-after: page; }
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

export function renderDocumentModelToHtml(document: DocumentModel): string {
  const sectionsHtml = document.sections.map(renderSection).join('');

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(document.title)}</title>
<style>${PRINT_STYLES}</style>
</head>
<body>
${sectionsHtml}
</body>
</html>`;
}

function renderSection(section: DocumentSection): string {
  const classes = ['section', section.pageBreakBefore && 'page-break-before', section.pageBreakAfter && 'page-break-after']
    .filter(Boolean)
    .join(' ');
  return `<section class="${classes}" id="${escapeHtml(section.id)}">${section.blocks.map(renderBlock).join('')}</section>`;
}

function renderBlock(block: DocumentBlock): string {
  switch (block.kind) {
    case 'heading':
      return `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`;
    case 'paragraph':
      return `<p>${escapeHtml(block.text)}</p>`;
    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      const items = block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
      return `<${tag}>${items}</${tag}>`;
    }
    case 'table': {
      const head = `<thead><tr>${block.headers
        .map((headerCell) => `<th>${escapeHtml(headerCell)}</th>`)
        .join('')}</tr></thead>`;
      const body = `<tbody>${block.rows
        .map(
          (row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
        )
        .join('')}</tbody>`;
      return `<table>${head}${body}</table>`;
    }
    case 'keyValue': {
      const items = block.items
        .map((item) => `<dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd>`)
        .join('');
      return `<dl class="key-value">${items}</dl>`;
    }
    case 'card':
      return `<div class="card">${block.blocks.map(renderBlock).join('')}</div>`;
    default: {
      const exhaustive: never = block;
      throw new Error(`Type de bloc non pris en charge : ${JSON.stringify(exhaustive)}`);
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/study-pack/htmlAdapter.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

(Skipped — see Global Constraints.)

---

### Task 6: `downloadStudyPack`

**Files:**
- Create: `src/services/study-pack/downloadStudyPack.ts`
- Test: `src/services/study-pack/downloadStudyPack.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (takes a plain `html: string`).
- Produces: `downloadStudyPack(html: string, options?: { windowName?: string }): void` —
  consumed by Task 7.

- [ ] **Step 1: Write the failing test**

Create `src/services/study-pack/downloadStudyPack.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadStudyPack } from './downloadStudyPack';

function createFakeWindow(openReturns: 'window' | 'null') {
  const calls: string[] = [];
  const fakeTarget = {
    document: {
      open: vi.fn(() => calls.push('document.open')),
      write: vi.fn((html: string) => calls.push(`document.write:${html}`)),
      close: vi.fn(() => calls.push('document.close')),
    },
    focus: vi.fn(() => calls.push('focus')),
    print: vi.fn(() => calls.push('print')),
  };
  const open = vi.fn(() => (openReturns === 'window' ? fakeTarget : null));
  return { open, fakeTarget, calls };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('downloadStudyPack', () => {
  it('opens a window, writes the HTML, then triggers print in order', () => {
    const { open, fakeTarget, calls } = createFakeWindow('window');
    vi.stubGlobal('window', { open });

    downloadStudyPack('<html>test</html>');

    expect(calls).toEqual([
      'document.open',
      'document.write:<html>test</html>',
      'document.close',
      'focus',
      'print',
    ]);
    expect(fakeTarget.document.write).toHaveBeenCalledWith('<html>test</html>');
  });

  it('defaults to opening a "_blank" window', () => {
    const { open } = createFakeWindow('window');
    vi.stubGlobal('window', { open });

    downloadStudyPack('<html></html>');

    expect(open).toHaveBeenCalledWith('', '_blank');
  });

  it('passes a custom window name through to window.open', () => {
    const { open } = createFakeWindow('window');
    vi.stubGlobal('window', { open });

    downloadStudyPack('<html></html>', { windowName: 'study-pack' });

    expect(open).toHaveBeenCalledWith('', 'study-pack');
  });

  it('throws a descriptive error when the popup is blocked', () => {
    const { open } = createFakeWindow('null');
    vi.stubGlobal('window', { open });

    expect(() => downloadStudyPack('<html></html>')).toThrow(/bloqueur de fenêtres/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/services/study-pack/downloadStudyPack.test.ts`
Expected: FAIL — cannot find module `./downloadStudyPack`.

- [ ] **Step 3: Implement**

Create `src/services/study-pack/downloadStudyPack.ts`:

```ts
export function downloadStudyPack(html: string, options?: { windowName?: string }): void {
  const target = window.open('', options?.windowName ?? '_blank');
  if (!target) {
    throw new Error(
      "Impossible d'ouvrir la fenêtre d'impression du Study Pack (bloqueur de fenêtres popup ?)",
    );
  }

  target.document.open();
  target.document.write(html);
  target.document.close();
  target.focus();
  target.print();
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/study-pack/downloadStudyPack.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

(Skipped — see Global Constraints.)

---

### Task 7: Public API barrel — `exportStudyPackToPdf`

**Files:**
- Create: `src/services/study-pack/index.ts`
- Test: `src/services/study-pack/index.test.ts`

**Interfaces:**
- Consumes: `buildStudyPack` (Task 3), `studyPackToDocumentModel` (Task 4),
  `renderDocumentModelToHtml` (Task 5), `downloadStudyPack` (Task 6),
  `fixtureBuildStudyPackInput` (Task 3, test only).
- Produces: re-exports of all four functions plus `BuildStudyPackInput`, and
  `exportStudyPackToPdf(input: BuildStudyPackInput): void` — this is the callback Codex
  wires to a future UI trigger. Consumed by Task 8 (dev route) and, later, by whatever
  UI Codex builds (out of scope here).

- [ ] **Step 1: Write the failing test**

Create `src/services/study-pack/index.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportStudyPackToPdf } from './index';
import { fixtureBuildStudyPackInput } from './testFixtures';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('exportStudyPackToPdf', () => {
  it('runs the full pipeline and opens the print window with the rendered HTML', () => {
    const write = vi.fn();
    const fakeTarget = {
      document: { open: vi.fn(), write, close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
    };
    const open = vi.fn(() => fakeTarget);
    vi.stubGlobal('window', { open });

    exportStudyPackToPdf(fixtureBuildStudyPackInput);

    expect(open).toHaveBeenCalled();
    const html = write.mock.calls[0][0] as string;
    expect(html).toContain('Mentora');
    expect(html).toContain('Calcul littéral');
    expect(html).toContain('Corrigés');
    expect(fakeTarget.print).toHaveBeenCalled();
  });

  it('propagates a popup-blocked error instead of swallowing it', () => {
    vi.stubGlobal('window', { open: vi.fn(() => null) });
    expect(() => exportStudyPackToPdf(fixtureBuildStudyPackInput)).toThrow(
      /bloqueur de fenêtres/,
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/services/study-pack/index.test.ts`
Expected: FAIL — cannot find module `./index`.

- [ ] **Step 3: Implement**

Create `src/services/study-pack/index.ts`:

```ts
import type { BuildStudyPackInput } from '@/types/study-pack';
import { buildStudyPack, STUDY_PACK_ALGORITHM_VERSION } from './builder';
import { studyPackToDocumentModel } from './documentModel';
import { renderDocumentModelToHtml } from './htmlAdapter';
import { downloadStudyPack } from './downloadStudyPack';

export { buildStudyPack, STUDY_PACK_ALGORITHM_VERSION };
export { studyPackToDocumentModel };
export { renderDocumentModelToHtml };
export { downloadStudyPack };
export type { BuildStudyPackInput };

/**
 * The single callback a UI trigger needs: builds the Study Pack, converts it to a
 * printable document, and opens the browser's print flow. Meant to be wired to a
 * "Télécharger mon Study Pack" button later.
 */
export function exportStudyPackToPdf(input: BuildStudyPackInput): void {
  const studyPack = buildStudyPack(input);
  const document = studyPackToDocumentModel(studyPack);
  const html = renderDocumentModelToHtml(document);
  downloadStudyPack(html);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/study-pack/index.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

(Skipped — see Global Constraints.)

---

### Task 8: Dev-only preview route

**Files:**
- Create: `src/app/dev/study-pack-preview/page.tsx`

**Interfaces:**
- Consumes: `buildStudyPack`, `studyPackToDocumentModel`, `renderDocumentModelToHtml`
  from `@/services/study-pack` (Task 7); `bundledRevisionNotesEngine` from
  `@/services/revision-notes/bundled-source` (existing, read-only);
  `generateRevisionPlan` from `@/services/revision/generator` (existing, read-only);
  `REVISION_UNITS` from `@/data/revision-units` (existing, read-only); `notFound` from
  `next/navigation`.
- Produces: nothing consumed elsewhere — this is a leaf page.

This route is manual-QA tooling, not test-covered by this plan (no test file) — it is
however exercised by `npm run build` in Task 9, which prerenders it and must confirm the
`notFound()` guard fires in a production build.

- [ ] **Step 1: Write the file**

Create `src/app/dev/study-pack-preview/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors touching this file.

- [ ] **Step 3: Commit**

(Skipped — see Global Constraints.)

---

### Task 9: Full verification pass

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Full test suite**

Run: `npm run test`
Expected: all tests pass, including every new `src/services/study-pack/*.test.ts` file
(43 new tests across Tasks 2–7: 7 + 13 + 9 + 8 + 4 + 2).

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds. Confirm in the output that
`/dev/study-pack-preview` is either omitted from the production route list or renders
the `notFound()` 404 — not the real preview content — since `next build` runs with
`NODE_ENV=production`.

- [ ] **Step 5: Fix any failures found above, re-run the specific failing command**

Fix inline if anything fails; re-run only the command that failed to confirm the fix,
then re-run the full sequence (tsc, lint, test, build) once more end to end.

- [ ] **Step 6: Commit**

(Skipped — see Global Constraints. The controller stages and reviews the full diff
before any commit happens.)
