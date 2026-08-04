import type { DocumentBlock, DocumentModel, DocumentSection } from '@/types/study-pack';

const PRINT_STYLES = `
* { box-sizing: border-box; }
@page { size: A4; margin: 20mm 16mm; }
body {
  font-family: 'Lexend', ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: #24152A;
  background: #FFFFFF;
  margin: 0;
}
h1 { font-size: 22pt; margin: 0 0 8pt; color: #24152A; }
h2 { font-size: 15pt; margin: 16pt 0 6pt; color: #873694; }
h3 { font-size: 12pt; margin: 10pt 0 4pt; color: #24152A; }
p { font-size: 10.5pt; line-height: 1.5; margin: 0 0 8pt; }
ul, ol { margin: 0 0 8pt; padding-left: 18pt; font-size: 10.5pt; line-height: 1.5; }
table { width: 100%; border-collapse: collapse; margin: 0 0 10pt; font-size: 9.5pt; }
th, td { border: 1px solid #EBDDEC; padding: 4pt 6pt; text-align: left; vertical-align: top; }
th { background: #FDF2FF; font-weight: 700; }
dl.key-value { display: grid; grid-template-columns: max-content 1fr; gap: 3pt 10pt; margin: 0 0 10pt; font-size: 10.5pt; }
dl.key-value dt { font-weight: 700; color: #873694; margin: 0; }
dl.key-value dd { margin: 0; }
.card {
  border: 1px solid #EBDDEC;
  border-radius: 6pt;
  padding: 8pt 10pt;
  margin: 0 0 8pt;
  break-inside: avoid;
  page-break-inside: avoid;
}
.card--breakable { break-inside: auto; page-break-inside: auto; }
.page-break-before { page-break-before: always; break-before: page; }
.page-break-after { page-break-after: always; break-after: page; }
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

export function renderDocumentModelToHtml(document: DocumentModel): string {
  const sectionsHtml = document.sections.map(renderSection).join('');

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(document.title)}</title>
<style>${PRINT_STYLES}</style>
</head>
<body>
${sectionsHtml}
</body>
</html>`;
}

function renderSection(section: DocumentSection): string {
  const classes = [
    'section',
    section.pageBreakBefore && 'page-break-before',
    section.pageBreakAfter && 'page-break-after',
  ]
    .filter(Boolean)
    .join(' ');
  return `<section class="${classes}" id="${escapeHtml(section.id)}">${section.blocks.map(renderBlock).join('')}</section>`;
}

function renderBlock(block: DocumentBlock): string {
  switch (block.kind) {
    case 'heading':
      return `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`;
    case 'paragraph':
      return `<p>${escapeHtml(block.text)}</p>`;
    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      const items = block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
      return `<${tag}>${items}</${tag}>`;
    }
    case 'table': {
      const head = `<thead><tr>${block.headers
        .map((headerCell) => `<th>${escapeHtml(headerCell)}</th>`)
        .join('')}</tr></thead>`;
      const body = `<tbody>${block.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
        .join('')}</tbody>`;
      return `<table>${head}${body}</table>`;
    }
    case 'keyValue': {
      const items = block.items
        .map((item) => `<dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd>`)
        .join('');
      return `<dl class="key-value">${items}</dl>`;
    }
    case 'card': {
      const cardClass = block.avoidBreak === false ? 'card card--breakable' : 'card';
      return `<div class="${cardClass}">${block.blocks.map(renderBlock).join('')}</div>`;
    }
    default: {
      const exhaustive: never = block;
      throw new Error(`Type de bloc non pris en charge : ${JSON.stringify(exhaustive)}`);
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
