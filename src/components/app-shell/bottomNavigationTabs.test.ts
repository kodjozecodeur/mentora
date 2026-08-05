import { describe, expect, it } from 'vitest';
import { BOTTOM_NAVIGATION_TABS } from './bottomNavigationTabs';

describe('BOTTOM_NAVIGATION_TABS', () => {
  it('exposes exactly 3 tabs: Accueil, Mon parcours, Profil', () => {
    expect(BOTTOM_NAVIGATION_TABS.map((tab) => tab.id)).toEqual(['home', 'revision', 'profile']);
    expect(BOTTOM_NAVIGATION_TABS.map((tab) => tab.label)).toEqual([
      'Accueil',
      'Mon parcours',
      'Profil',
    ]);
  });

  it('no longer exposes an exam ("Examens") destination', () => {
    expect(BOTTOM_NAVIGATION_TABS).toHaveLength(3);
    expect(BOTTOM_NAVIGATION_TABS.some((tab) => tab.label === 'Examens')).toBe(false);
  });
});
