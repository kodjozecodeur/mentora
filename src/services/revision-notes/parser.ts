import type {
  CommonMistake,
  MiniExercise,
  RevisionNote,
  RevisionNoteDifficulty,
  RevisionSection,
  WorkedExample,
} from './types';
import { RevisionNoteParseError, type RevisionNoteParseErrorCode } from './errors';

type RevisionFrontmatter = Omit<
  RevisionNote,
  'sections' | 'workedExample' | 'commonMistakes' | 'keyTakeaways' | 'miniExercises'
>;

const CANONICAL_SECTION_TITLES = [
  'Comprendre simplement',
  'Exemple concret',
  'Les erreurs fréquentes',
  'À retenir',
  'Mini exercice',
] as const;

const FRONTMATTER_KEYS = new Set([
  'id',
  'competencyId',
  'title',
  'subject',
  'exam',
  'curriculumVersion',
  'contentVersion',
  'teacherValidated',
  'estimatedReadingMinutes',
  'difficulty',
  'updatedAt',
]);

export function parseRevisionFrontmatter(
  input: string,
  sourceId = 'revision-note',
): RevisionFrontmatter {
  const values = new Map<string, string | number | boolean>();

  for (const [index, rawLine] of input.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!match) {
      throw parseError(
        sourceId,
        `Ligne de frontmatter invalide à la ligne ${index + 1}`,
        'invalid-frontmatter',
      );
    }

    const [, key, rawValue] = match;
    if (!FRONTMATTER_KEYS.has(key)) {
      throw parseError(sourceId, `Clé de frontmatter inconnue « ${key} »`, 'invalid-frontmatter');
    }
    if (values.has(key)) {
      throw parseError(
        sourceId,
        `Clé de frontmatter dupliquée « ${key} »`,
        'duplicate-frontmatter-key',
      );
    }

    values.set(key, parseScalar(rawValue));
  }

  for (const key of FRONTMATTER_KEYS) {
    if (!values.has(key)) {
      throw parseError(
        sourceId,
        `Métadonnée de frontmatter manquante « ${key} »`,
        'missing-frontmatter-field',
      );
    }
  }

  const id = readString(values, 'id', sourceId);
  const competencyId = readString(values, 'competencyId', sourceId);
  const title = readString(values, 'title', sourceId);
  const subject = readString(values, 'subject', sourceId);
  const exam = readString(values, 'exam', sourceId);
  const curriculumVersion = readString(values, 'curriculumVersion', sourceId);
  const contentVersion = readString(values, 'contentVersion', sourceId);
  const teacherValidated = readBoolean(values, 'teacherValidated', sourceId);
  const estimatedReadingMinutes = readPositiveInteger(values, 'estimatedReadingMinutes', sourceId);
  const difficulty = readDifficulty(values, sourceId);
  const updatedAt = readString(values, 'updatedAt', sourceId);

  return {
    id,
    competencyId,
    title,
    subject,
    exam,
    curriculumVersion,
    contentVersion,
    teacherValidated,
    estimatedReadingMinutes,
    difficulty,
    updatedAt,
  };
}

export function parseRevisionNote(markdown: string, sourceId = 'revision-note.md'): RevisionNote {
  const normalized = markdown.replace(/^\uFEFF/, '');
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw parseError(
      sourceId,
      'Le fichier doit commencer par un frontmatter délimité par ---',
      'invalid-frontmatter',
    );
  }

  const metadata = parseRevisionFrontmatter(match[1], sourceId);
  const sections = parseSections(match[2], sourceId);
  const understanding = sections[0];
  const workedExampleSection = sections[1];
  const mistakesSection = sections[2];
  const takeawaysSection = sections[3];
  const exercisesSection = sections[4];

  if (
    !understanding ||
    !workedExampleSection ||
    !mistakesSection ||
    !takeawaysSection ||
    !exercisesSection
  ) {
    throw parseError(
      sourceId,
      'Le contenu ne contient pas toutes les sections canoniques',
      'invalid-section',
    );
  }

  return {
    ...metadata,
    sections,
    workedExample: parseWorkedExample(workedExampleSection, sourceId),
    commonMistakes: parseCommonMistakes(mistakesSection, sourceId),
    keyTakeaways: parseKeyTakeaways(takeawaysSection, sourceId),
    miniExercises: parseMiniExercises(exercisesSection, metadata.id, sourceId),
  };
}

function parseSections(body: string, sourceId: string): RevisionSection[] {
  const lines = body.trim().split(/\r?\n/);
  const headings: Array<{ title: string; line: number }> = [];

  lines.forEach((line, lineIndex) => {
    const match = line.match(/^#\s+(.+?)\s*$/);
    if (match) headings.push({ title: match[1].trim(), line: lineIndex });
  });

  if (headings.length === 0) {
    throw parseError(sourceId, 'Aucune section Markdown de niveau 1 trouvée', 'invalid-section');
  }

  const seen = new Set<string>();
  for (const heading of headings) {
    if (
      CANONICAL_SECTION_TITLES.includes(heading.title as (typeof CANONICAL_SECTION_TITLES)[number])
    ) {
      if (seen.has(heading.title)) {
        throw parseError(
          sourceId,
          `Section Markdown dupliquée « ${heading.title} »`,
          'duplicate-section',
        );
      }
      seen.add(heading.title);
    }
  }

  const missing = CANONICAL_SECTION_TITLES.find((title) => !seen.has(title));
  if (missing) {
    throw parseError(sourceId, `Section Markdown manquante « ${missing} »`, 'missing-section');
  }

  const unexpected = headings.find(
    (heading) =>
      !CANONICAL_SECTION_TITLES.includes(
        heading.title as (typeof CANONICAL_SECTION_TITLES)[number],
      ),
  );
  if (unexpected) {
    throw parseError(
      sourceId,
      `Section Markdown inattendue « ${unexpected.title} »`,
      'invalid-section',
    );
  }

  const orderedTitles = headings.map((heading) => heading.title);
  if (orderedTitles.some((title, index) => title !== CANONICAL_SECTION_TITLES[index])) {
    throw parseError(
      sourceId,
      'Les sections Markdown ne respectent pas l’ordre canonique',
      'invalid-section',
    );
  }

  return headings.map((heading, index) => {
    const nextHeading = headings[index + 1];
    const content = lines
      .slice(heading.line + 1, nextHeading?.line ?? lines.length)
      .join('\n')
      .trim();
    if (!content) {
      throw parseError(sourceId, `Section Markdown vide « ${heading.title} »`, 'invalid-section');
    }

    return {
      id: slugify(heading.title),
      title: heading.title,
      order: index + 1,
      content,
    };
  });
}

function parseWorkedExample(section: RevisionSection, sourceId: string): WorkedExample {
  const labels = readLabeledLines(section.content);
  const problem = labels.find(
    (line) => line.label === 'situation' || line.label === 'enonce',
  )?.value;
  const steps = labels
    .filter((line) => /^etape\s+\d+$/i.test(line.label))
    .map((line) => line.value);
  const conclusion = labels.find((line) => line.label === 'conclusion')?.value;

  if (!problem || steps.length === 0 || !conclusion) {
    throw parseError(
      sourceId,
      `Exemple concret incomplet dans « ${section.title} »`,
      'invalid-section-content',
    );
  }

  return { title: section.title, problem, steps, conclusion };
}

function parseCommonMistakes(section: RevisionSection, sourceId: string): CommonMistake[] {
  const blocks = parseSubsections(section.content, sourceId, 'erreur fréquente');
  return blocks.map((block) => {
    const labels = readLabeledLines(block.content);
    const error = labels.find((line) => line.label === 'erreur')?.value;
    const whyItHappens = labels.find((line) => line.label === 'pourquoi')?.value;
    const howToAvoid = labels.find((line) => line.label === 'comment eviter')?.value;

    if (!error || !whyItHappens || !howToAvoid) {
      throw parseError(
        sourceId,
        `Erreur fréquente incomplète « ${block.title} »`,
        'invalid-section-content',
      );
    }

    return { title: block.title, error, whyItHappens, howToAvoid };
  });
}

function parseKeyTakeaways(section: RevisionSection, sourceId: string): string[] {
  const takeaways = section.content
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*[-*]\s+(.+?)\s*$/)?.[1])
    .filter((value): value is string => Boolean(value));

  if (takeaways.length === 0) {
    throw parseError(
      sourceId,
      `La section « ${section.title} » doit contenir des points à retenir`,
      'invalid-section-content',
    );
  }
  return takeaways;
}

function parseMiniExercises(
  section: RevisionSection,
  noteId: string,
  sourceId: string,
): MiniExercise[] {
  const blocks = parseSubsections(section.content, sourceId, 'exercice');
  if (blocks.length !== 2) {
    throw parseError(
      sourceId,
      'La section « Mini exercice » doit contenir exactement deux exercices',
      'invalid-section-content',
    );
  }

  return blocks.map((block, index) => {
    const labels = readLabeledLines(block.content);
    const statement = labels.find((line) => line.label === 'enonce')?.value;
    const answer = labels.find((line) => line.label === 'reponse')?.value;
    const correction = labels.find((line) => line.label === 'correction')?.value;

    if (!statement || !answer || !correction) {
      throw parseError(
        sourceId,
        `Exercice incomplet « ${block.title} »`,
        'invalid-section-content',
      );
    }

    return {
      id: `${noteId}-exercise-${index + 1}`,
      order: index + 1,
      statement,
      answer,
      correction,
    };
  });
}

function parseSubsections(
  content: string,
  sourceId: string,
  expectedKind: string,
): Array<{ title: string; content: string }> {
  const lines = content.split(/\r?\n/);
  const headings: Array<{ title: string; line: number }> = [];

  lines.forEach((line, lineIndex) => {
    const match = line.match(/^##\s+(.+?)\s*$/);
    if (match) headings.push({ title: match[1].trim(), line: lineIndex });
  });

  if (headings.length === 0) {
    throw parseError(
      sourceId,
      `La section doit contenir au moins un élément de type ${expectedKind}`,
      'invalid-section-content',
    );
  }

  return headings.map((heading, index) => ({
    title: heading.title,
    content: lines
      .slice(heading.line + 1, headings[index + 1]?.line ?? lines.length)
      .join('\n')
      .trim(),
  }));
}

function readLabeledLines(content: string): Array<{ label: string; value: string }> {
  return content
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      const match =
        trimmed.match(/^(?:[-*]\s*)?\*\*(.+?)\s*:\*\*\s*(.+?)\s*$/) ??
        trimmed.match(/^(?:[-*]\s*)?(.+?)\s*:\s*(.+?)\s*$/);
      if (!match) return null;
      return { label: normalizeLabel(match[1]), value: match[2] };
    })
    .filter((line): line is { label: string; value: string } => line !== null);
}

function normalizeLabel(label: string): string {
  return label
    .trim()
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseScalar(value: string): string | number | boolean {
  const unquoted = value.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, '$1$2').trim();
  if (unquoted === 'true') return true;
  if (unquoted === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(unquoted)) return Number(unquoted);
  return unquoted;
}

function readString(
  values: Map<string, string | number | boolean>,
  key: string,
  sourceId: string,
): string {
  const value = values.get(key);
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw parseError(sourceId, `Métadonnée « ${key} » invalide`, 'invalid-frontmatter-value');
  }
  const result = String(value).trim();
  if (!result)
    throw parseError(sourceId, `Métadonnée « ${key} » vide`, 'invalid-frontmatter-value');
  return result;
}

function readBoolean(
  values: Map<string, string | number | boolean>,
  key: string,
  sourceId: string,
): boolean {
  const value = values.get(key);
  if (typeof value !== 'boolean')
    throw parseError(sourceId, `Métadonnée « ${key} » invalide`, 'invalid-frontmatter-value');
  return value;
}

function readPositiveInteger(
  values: Map<string, string | number | boolean>,
  key: string,
  sourceId: string,
): number {
  const value = values.get(key);
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw parseError(sourceId, `Métadonnée « ${key} » invalide`, 'invalid-frontmatter-value');
  }
  return value;
}

function readDifficulty(
  values: Map<string, string | number | boolean>,
  sourceId: string,
): RevisionNoteDifficulty {
  const value = values.get('difficulty');
  if (value !== 'beginner' && value !== 'intermediate' && value !== 'advanced') {
    throw parseError(sourceId, 'Métadonnée « difficulty » invalide', 'invalid-frontmatter-value');
  }
  return value;
}

function parseError(
  sourceId: string,
  message: string,
  code: RevisionNoteParseErrorCode,
): RevisionNoteParseError {
  return new RevisionNoteParseError(code, sourceId, message);
}
