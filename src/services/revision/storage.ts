import type { RevisionPlan } from '@/types/revision';

const STORAGE_KEY = 'mentora.revision-plan.bepc-mathematiques.v2';

function hasLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

export function saveRevisionPlan(plan: RevisionPlan): void {
  if (!hasLocalStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function loadRevisionPlan(): RevisionPlan | null {
  if (!hasLocalStorage()) return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return isRevisionPlan(parsed) ? withValidationAttemptDefaults(parsed) : null;
  } catch {
    return null;
  }
}

/** Defensive: tolerates a plan persisted before validationAttempts existed on RevisionSession. */
function withValidationAttemptDefaults(plan: RevisionPlan): RevisionPlan {
  return {
    ...plan,
    sessions: plan.sessions.map((session) => ({
      ...session,
      validationAttempts: session.validationAttempts ?? [],
    })),
  };
}

export function clearRevisionPlan(): void {
  if (!hasLocalStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}

function isRevisionPlan(value: unknown): value is RevisionPlan {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.diagnosticId === 'string' &&
    typeof candidate.generatedAt === 'string' &&
    typeof candidate.algorithmVersion === 'string' &&
    typeof candidate.contentVersion === 'string' &&
    typeof candidate.estimatedTotalMinutes === 'number' &&
    typeof candidate.estimatedDays === 'number' &&
    Array.isArray(candidate.sessions)
  );
}
