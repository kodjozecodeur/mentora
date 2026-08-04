import { describe, expect, it } from 'vitest';
import { splitParagraphs, stripInlineMarkdown } from './markdown';

describe('stripInlineMarkdown', () => {
  it('removes bold markers', () => {
    expect(stripInlineMarkdown('**Situation :** Développer.')).toBe('Situation : Développer.');
  });

  it('unwraps inline code spans', () => {
    expect(stripInlineMarkdown('Développer `3(2x - 1)`.')).toBe('Développer 3(2x - 1).');
  });

  it('handles both in the same string', () => {
    expect(stripInlineMarkdown('**Étape 1 :** Distribuer `6x - 3`.')).toBe(
      'Étape 1 : Distribuer 6x - 3.',
    );
  });

  it('leaves plain text untouched', () => {
    expect(stripInlineMarkdown('Une expression littérale.')).toBe('Une expression littérale.');
  });
});

describe('splitParagraphs', () => {
  it('splits on blank lines and trims each paragraph', () => {
    const input = 'Premier paragraphe.\n\nDeuxième paragraphe.\n\n\nTroisième paragraphe.';
    expect(splitParagraphs(input)).toEqual([
      'Premier paragraphe.',
      'Deuxième paragraphe.',
      'Troisième paragraphe.',
    ]);
  });

  it('returns a single-item array for text with no blank lines', () => {
    expect(splitParagraphs('Un seul paragraphe sur\nplusieurs lignes.')).toEqual([
      'Un seul paragraphe sur\nplusieurs lignes.',
    ]);
  });

  it('drops empty paragraphs and returns an empty array for blank input', () => {
    expect(splitParagraphs('   \n\n   ')).toEqual([]);
  });
});
