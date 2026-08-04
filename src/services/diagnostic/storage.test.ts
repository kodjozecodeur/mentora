import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearDiagnosticProgress, loadDiagnosticProgress, saveDiagnosticProgress } from './storage';
import type { DiagnosticSessionState } from '@/types/diagnostic';

function stubLocalStorage() {
  const store = new Map<string, string>();
  const stub = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
  vi.stubGlobal('localStorage', stub);
  return stub;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('diagnostic storage', () => {
  it('round-trips session state through localStorage', () => {
    stubLocalStorage();
    const state: DiagnosticSessionState = {
      questionIndex: 2,
      responses: {
        q1: { questionId: 'q1', competencyId: 'calcul-litteral', optionId: 'q1-a', isCorrect: true, points: 1 },
      },
      result: null,
    };

    saveDiagnosticProgress(state);

    expect(loadDiagnosticProgress()).toEqual(state);
  });

  it('returns null when nothing has been saved', () => {
    stubLocalStorage();
    expect(loadDiagnosticProgress()).toBeNull();
  });

  it('returns null when the stored value is corrupted JSON', () => {
    const stub = stubLocalStorage();
    stub.setItem('mentora.diagnostic.bepc-mathematiques.v1', '{not json');
    expect(loadDiagnosticProgress()).toBeNull();
  });

  it('clears the saved progress', () => {
    stubLocalStorage();
    saveDiagnosticProgress({ questionIndex: 0, responses: {}, result: null });
    clearDiagnosticProgress();
    expect(loadDiagnosticProgress()).toBeNull();
  });
});
