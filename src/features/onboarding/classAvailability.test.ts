import { describe, expect, it } from 'vitest';
import { isMvpClassAvailable, MVP_UNAVAILABLE_CLASS_MESSAGE } from './classAvailability';

describe('MVP class availability', () => {
  it('allows only 3e to continue in the MVP', () => {
    expect(isMvpClassAvailable('3e')).toBe(true);
    expect(isMvpClassAvailable('6e')).toBe(false);
    expect(isMvpClassAvailable('5e')).toBe(false);
    expect(isMvpClassAvailable('4e')).toBe(false);
    expect(isMvpClassAvailable('2nde')).toBe(false);
    expect(isMvpClassAvailable('1ere')).toBe(false);
    expect(isMvpClassAvailable('terminale')).toBe(false);
    expect(isMvpClassAvailable(null)).toBe(false);
  });

  it('exposes the product message for unavailable classes', () => {
    expect(MVP_UNAVAILABLE_CLASS_MESSAGE).toBe(
      'Cette classe sera disponible prochainement. Pour le MVP, seule la classe de 3e est disponible.',
    );
  });
});
