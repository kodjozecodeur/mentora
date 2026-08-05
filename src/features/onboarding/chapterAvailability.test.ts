import { describe, expect, it } from 'vitest';
import { isMvpChapterAvailable, MVP_UNAVAILABLE_CHAPTER_MESSAGE } from './chapterAvailability';

describe('MVP chapter availability', () => {
  it('allows only Polynômes du second degré to continue in the MVP', () => {
    expect(isMvpChapterAvailable('polynomes-second-degre')).toBe(true);
    expect(isMvpChapterAvailable('nombres-relatifs')).toBe(false);
    expect(isMvpChapterAvailable('calcul-litteral')).toBe(false);
    expect(isMvpChapterAvailable('fonctions')).toBe(false);
    expect(isMvpChapterAvailable('thales')).toBe(false);
    expect(isMvpChapterAvailable('trigonometrie')).toBe(false);
    expect(isMvpChapterAvailable('statistiques-probabilites')).toBe(false);
    expect(isMvpChapterAvailable(null)).toBe(false);
  });

  it('exposes the product message for unavailable chapters', () => {
    expect(MVP_UNAVAILABLE_CHAPTER_MESSAGE).toBe(
      'Ce chapitre sera disponible prochainement. Pour le MVP, seul le chapitre Polynômes du second degré est disponible.',
    );
  });
});
