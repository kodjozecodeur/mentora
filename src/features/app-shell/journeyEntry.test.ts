import { describe, expect, it } from 'vitest';
import { resolveInitialRevisionView } from './journeyEntry';

describe('resolveInitialRevisionView', () => {
  it('opens the plan first when the Results branch is revision-plan', () => {
    expect(resolveInitialRevisionView('revision-plan')).toBe('plan');
  });

  it('opens the journey hub directly when the Results branch is learning-journey', () => {
    expect(resolveInitialRevisionView('learning-journey')).toBe('overview');
  });
});
