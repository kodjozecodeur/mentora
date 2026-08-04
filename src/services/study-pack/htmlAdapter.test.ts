import { describe, expect, it } from 'vitest';
import { buildStudyPack } from './builder';
import { studyPackToDocumentModel } from './documentModel';
import { renderDocumentModelToHtml } from './htmlAdapter';
import { fixtureBuildStudyPackInput } from './testFixtures';

function renderFixtureHtml(): string {
  const pack = buildStudyPack(fixtureBuildStudyPackInput);
  const document = studyPackToDocumentModel(pack);
  return renderDocumentModelToHtml(document);
}

describe('renderDocumentModelToHtml', () => {
  it('is deterministic: same DocumentModel in, byte-identical HTML out', () => {
    const document = studyPackToDocumentModel(buildStudyPack(fixtureBuildStudyPackInput));
    expect(renderDocumentModelToHtml(document)).toBe(renderDocumentModelToHtml(document));
  });

  it('produces a self-contained HTML document with inline print CSS', () => {
    const html = renderFixtureHtml();
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<style>');
    expect(html).toContain('@page');
    expect(html).toContain('@media print');
    expect(html).toContain('page-break-before');
    expect(html).toContain('page-break-after');
    expect(html).toContain('break-inside: avoid');
  });

  it('marks cover with the page-break-after class and never a page-break-before class', () => {
    const html = renderFixtureHtml();
    expect(html).toMatch(/<section class="section page-break-after" id="cover">/);
  });

  it('includes the page-break-before class only on sections that require it', () => {
    const html = renderFixtureHtml();
    expect(html).toMatch(/<section class="section" id="diagnostic-summary">/);
    expect(html).toMatch(/<section class="section page-break-before" id="fiche-calcul-litteral">/);
    expect(html).toMatch(/<section class="section page-break-before" id="corrections">/);
  });

  it('wraps every card block in a break-avoiding container', () => {
    const html = renderFixtureHtml();
    expect(html).toContain('<div class="card">');
  });

  it('respects the avoidBreak flag: false renders a breakable card, true (or omitted) keeps break-avoidance', () => {
    const document = {
      title: 'Test',
      sections: [
        {
          id: 'test',
          blocks: [
            {
              kind: 'card' as const,
              blocks: [{ kind: 'paragraph' as const, text: 'A' }],
              avoidBreak: false,
            },
            {
              kind: 'card' as const,
              blocks: [{ kind: 'paragraph' as const, text: 'B' }],
              avoidBreak: true,
            },
            { kind: 'card' as const, blocks: [{ kind: 'paragraph' as const, text: 'C' }] },
          ],
        },
      ],
    };
    const html = renderDocumentModelToHtml(document);
    expect(html).toContain('<div class="card card--breakable"><p>A</p></div>');
    expect(html).toContain('<div class="card"><p>B</p></div>');
    expect(html).toContain('<div class="card"><p>C</p></div>');
  });

  it('renders a table with headers and rows', () => {
    const html = renderFixtureHtml();
    expect(html).toContain('<table>');
    expect(html).toContain('<th>Objectif</th>');
    expect(html).toContain('<td>Calcul littéral</td>');
  });

  it('escapes HTML-significant characters in text content', () => {
    const document = studyPackToDocumentModel(buildStudyPack(fixtureBuildStudyPackInput));
    const withUnsafeText = {
      ...document,
      sections: [
        {
          id: 'test',
          blocks: [{ kind: 'paragraph' as const, text: '<script>alert(1)</script> & "quoted"' }],
        },
        ...document.sections,
      ],
    };
    const html = renderDocumentModelToHtml(withUnsafeText);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;quoted&quot;');
  });

  it('places corrections content only inside the corrections section, after every fiche', () => {
    const html = renderFixtureHtml();
    const correctionsIndex = html.indexOf('id="corrections"');
    const ficheIndex = html.indexOf('id="fiche-calcul-litteral"');
    const answerIndex = html.indexOf('x + 6');
    expect(ficheIndex).toBeGreaterThan(-1);
    expect(correctionsIndex).toBeGreaterThan(ficheIndex);
    expect(answerIndex).toBeGreaterThan(correctionsIndex);
  });
});
