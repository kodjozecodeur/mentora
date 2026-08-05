export const MVP_UNAVAILABLE_CLASS_MESSAGE =
  'Cette classe sera disponible prochainement. Pour le MVP, seule la classe de 3e est disponible.';

export function isMvpClassAvailable(classId: string | null): boolean {
  return classId === '3e';
}
