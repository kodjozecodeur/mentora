import { describe, expect, it } from 'vitest';
import {
  getGreeting,
  getReadinessLevelLabel,
  getReadinessMessage,
  getWeaknessBadgeLabel,
} from './resultCopy';

describe('getGreeting', () => {
  it('includes the trimmed first name when present', () => {
    expect(getGreeting('Awa')).toBe('Bravo Awa !');
    expect(getGreeting('  Awa  ')).toBe('Bravo Awa !');
  });

  it('falls back to a plain greeting when no usable name is given', () => {
    expect(getGreeting(undefined)).toBe('Bravo !');
    expect(getGreeting('')).toBe('Bravo !');
    expect(getGreeting('   ')).toBe('Bravo !');
  });
});

describe('getReadinessMessage', () => {
  it('returns the low-score message for 0-39', () => {
    expect(getReadinessMessage(0)).toBe('Tu as encore plusieurs notions importantes à renforcer.');
    expect(getReadinessMessage(39)).toBe('Tu as encore plusieurs notions importantes à renforcer.');
  });

  it('returns the mid-score message for 40-69', () => {
    expect(getReadinessMessage(40)).toBe(
      'Tu progresses bien, mais certaines notions doivent encore être consolidées.',
    );
    expect(getReadinessMessage(69)).toBe(
      'Tu progresses bien, mais certaines notions doivent encore être consolidées.',
    );
  });

  it('returns the high-score message for 70-100', () => {
    expect(getReadinessMessage(70)).toBe(
      'Tu maîtrises déjà une bonne partie des compétences évaluées.',
    );
    expect(getReadinessMessage(100)).toBe(
      'Tu maîtrises déjà une bonne partie des compétences évaluées.',
    );
  });
});

describe('getReadinessLevelLabel', () => {
  it('labels 0-39 as needing reinforcement', () => {
    expect(getReadinessLevelLabel(0)).toBe('À renforcer');
    expect(getReadinessLevelLabel(39)).toBe('À renforcer');
  });

  it('labels 40-69 as in progress', () => {
    expect(getReadinessLevelLabel(40)).toBe('En progression');
    expect(getReadinessLevelLabel(69)).toBe('En progression');
  });

  it('labels 70-100 as optimal', () => {
    expect(getReadinessLevelLabel(70)).toBe('Optimal');
    expect(getReadinessLevelLabel(100)).toBe('Optimal');
  });
});

describe('getWeaknessBadgeLabel', () => {
  it('labels a priority competency', () => {
    expect(getWeaknessBadgeLabel('priority')).toBe('Prioritaire');
  });

  it('labels an in-progress competency', () => {
    expect(getWeaknessBadgeLabel('in-progress')).toBe('En progression');
  });
});
