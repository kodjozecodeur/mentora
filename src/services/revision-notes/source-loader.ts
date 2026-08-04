import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { RevisionNoteSource, RevisionNoteSourceAdapter } from './types';

const DEFAULT_CONTENT_ROOT = resolve(process.cwd(), 'src/content/revision-notes/bepc-mathematics');

/** Node/build-time adapter. The domain engine itself only receives source objects. */
export function createFilesystemRevisionNoteSourceAdapter(
  rootDir = DEFAULT_CONTENT_ROOT,
): RevisionNoteSourceAdapter {
  return {
    getSources: (): RevisionNoteSource[] =>
      readdirSync(rootDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((entry) => ({
          sourceId: entry.name,
          content: readFileSync(join(rootDir, entry.name), 'utf8'),
        })),
  };
}
