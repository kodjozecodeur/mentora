import type { DiagnosticPhase, DiagnosticSessionState } from '@/types/diagnostic';

/** Initial and final diagnostics are stored under separate keys/versions (spec §9, §10 Decision) —
 * a final result must never overwrite the initial one, so before/after comparison stays derivable. */
const STORAGE_KEYS: Record<DiagnosticPhase, string> = {
  initial: 'mentora.diagnostic.bepc-mathematiques.initial.v3',
  final: 'mentora.diagnostic.bepc-mathematiques.final.v1',
};

function hasLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

export function saveDiagnosticProgress(
  phase: DiagnosticPhase,
  state: DiagnosticSessionState,
): void {
  if (!hasLocalStorage()) return;
  localStorage.setItem(STORAGE_KEYS[phase], JSON.stringify(state));
}

export function loadDiagnosticProgress(phase: DiagnosticPhase): DiagnosticSessionState | null {
  if (!hasLocalStorage()) return null;

  const raw = localStorage.getItem(STORAGE_KEYS[phase]);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DiagnosticSessionState;
  } catch {
    return null;
  }
}

export function clearDiagnosticProgress(phase: DiagnosticPhase): void {
  if (!hasLocalStorage()) return;
  localStorage.removeItem(STORAGE_KEYS[phase]);
}
