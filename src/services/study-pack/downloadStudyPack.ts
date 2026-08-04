export function downloadStudyPack(html: string, options?: { windowName?: string }): void {
  const target = window.open('', options?.windowName ?? '_blank');
  if (!target) {
    throw new Error(
      "Impossible d'ouvrir la fenêtre d'impression du Study Pack (bloqueur de fenêtres popup ?)",
    );
  }

  target.document.open();
  target.document.write(html);
  target.document.close();
  target.focus();
  target.print();
}
