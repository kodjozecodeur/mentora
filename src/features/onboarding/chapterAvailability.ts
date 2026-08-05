export const MVP_UNAVAILABLE_CHAPTER_MESSAGE =
  'Ce chapitre sera disponible prochainement. Pour le MVP, seul le chapitre Polynômes du second degré est disponible.';

export function isMvpChapterAvailable(chapterId: string | null): boolean {
  return chapterId === 'polynomes-second-degre';
}
