import type { DiagnosticSessionState } from '@/types/diagnostic';

const STORAGE_KEY = 'mentora.diagnostic.bepc-mathematiques.v1';

function hasLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

export function saveDiagnosticProgress(state: DiagnosticSessionState): void {
  if (!hasLocalStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadDiagnosticProgress(): DiagnosticSessionState | null {
  if (!hasLocalStorage()) return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DiagnosticSessionState;
  } catch {
    return null;
  }
}

export function clearDiagnosticProgress(): void {
  if (!hasLocalStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}
