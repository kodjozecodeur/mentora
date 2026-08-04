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
