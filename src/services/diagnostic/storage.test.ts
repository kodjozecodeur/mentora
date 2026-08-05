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
        q1: {
          questionId: 'q1',
          competencyId: 'calcul-litteral',
          optionId: 'q1-a',
          isCorrect: true,
          points: 1,
        },
      },
      result: null,
      phase: 'initial',
    };

    saveDiagnosticProgress('initial', state);

    expect(loadDiagnosticProgress('initial')).toEqual(state);
  });

  it('returns null when nothing has been saved', () => {
    stubLocalStorage();
    expect(loadDiagnosticProgress('initial')).toBeNull();
  });

  it('returns null when the stored value is corrupted JSON', () => {
    const stub = stubLocalStorage();
    stub.setItem('mentora.diagnostic.bepc-mathematiques.initial.v4', '{not json');
    expect(loadDiagnosticProgress('initial')).toBeNull();
  });

  it('clears the saved progress', () => {
    stubLocalStorage();
    saveDiagnosticProgress('initial', {
      questionIndex: 0,
      responses: {},
      result: null,
      phase: 'initial',
    });
    clearDiagnosticProgress('initial');
    expect(loadDiagnosticProgress('initial')).toBeNull();
  });

  it('ignores progress saved under a previous storage version', () => {
    const stub = stubLocalStorage();
    stub.setItem(
      'mentora.diagnostic.bepc-mathematiques.v2',
      JSON.stringify({ questionIndex: 5, responses: {}, result: null }),
    );
    expect(loadDiagnosticProgress('initial')).toBeNull();
  });

  it('keeps the initial and final phases in separate storage slots', () => {
    stubLocalStorage();
    const initialState: DiagnosticSessionState = {
      questionIndex: 0,
      responses: {},
      result: null,
      phase: 'initial',
    };
    const finalState: DiagnosticSessionState = {
      questionIndex: 3,
      responses: {},
      result: null,
      phase: 'final',
    };

    saveDiagnosticProgress('initial', initialState);
    saveDiagnosticProgress('final', finalState);

    expect(loadDiagnosticProgress('initial')).toEqual(initialState);
    expect(loadDiagnosticProgress('final')).toEqual(finalState);

    clearDiagnosticProgress('final');
    expect(loadDiagnosticProgress('final')).toBeNull();
    expect(loadDiagnosticProgress('initial')).toEqual(initialState);
  });
});
