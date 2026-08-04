import { describe, expect, it } from 'vitest';
import { isMvpSubjectAvailable, MVP_UNAVAILABLE_SUBJECT_MESSAGE } from './subjectAvailability';

describe('MVP subject availability', () => {
  it('allows only mathematics to continue in the MVP', () => {
    expect(isMvpSubjectAvailable('mathematiques')).toBe(true);
    expect(isMvpSubjectAvailable('francais')).toBe(false);
    expect(isMvpSubjectAvailable('anglais')).toBe(false);
    expect(isMvpSubjectAvailable('sciences')).toBe(false);
    expect(isMvpSubjectAvailable(null)).toBe(false);
  });

  it('exposes the product message for unavailable subjects', () => {
    expect(MVP_UNAVAILABLE_SUBJECT_MESSAGE).toBe(
      'Cette matière sera disponible prochainement. Pour le MVP, seul le diagnostic de Mathématiques est disponible.',
    );
  });
});
