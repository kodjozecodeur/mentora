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
