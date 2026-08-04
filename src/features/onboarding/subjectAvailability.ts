export const MVP_UNAVAILABLE_SUBJECT_MESSAGE =
  'Cette matière sera disponible prochainement. Pour le MVP, seul le diagnostic de Mathématiques est disponible.';

export function isMvpSubjectAvailable(subjectId: string | null): boolean {
  return subjectId === 'mathematiques';
}
