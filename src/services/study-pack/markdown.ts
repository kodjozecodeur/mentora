export function stripInlineMarkdown(value: string): string {
  return value.replace(/\*\*/g, '').replace(/`([^`]+)`/g, '$1');
}

export function splitParagraphs(value: string): string[] {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
