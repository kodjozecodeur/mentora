'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionPlan, RevisionSession } from '@/types/revision';
import { createPlanForDiagnostic } from './experience';
import { updateRevisionSessionStatus } from './progress';
import { clearRevisionPlan, loadRevisionPlan, saveRevisionPlan } from './storage';

interface UseRevisionPlanResult {
  plan: RevisionPlan | null;
  startSession: (revisionUnitId: string) => void;
  completeSession: (revisionUnitId: string) => void;
  clearPlan: () => void;
}

export function useRevisionPlan(
  diagnosticResult: DiagnosticResult | null,
  studentName?: string,
): UseRevisionPlanResult {
  const generatedPlan = useMemo(
    () => (diagnosticResult ? createPlanForDiagnostic(diagnosticResult, studentName) : null),
    [diagnosticResult, studentName],
  );
  const [plan, setPlan] = useState<RevisionPlan | null>(generatedPlan);

  useEffect(() => {
    if (!diagnosticResult || !generatedPlan) {
      setPlan(null);
      return;
    }

    const saved = loadRevisionPlan();
    const matchingPlan = saved?.diagnosticId === generatedPlan.diagnosticId ? saved : generatedPlan;
    setPlan(matchingPlan);
    saveRevisionPlan(matchingPlan);
  }, [diagnosticResult, generatedPlan]);

  const changeStatus = useCallback((revisionUnitId: string, status: RevisionSession['status']) => {
    setPlan((currentPlan) => {
      if (!currentPlan) return currentPlan;
      const updated = updateRevisionSessionStatus(currentPlan, revisionUnitId, status);
      saveRevisionPlan(updated);
      return updated;
    });
  }, []);

  const startSession = useCallback(
    (revisionUnitId: string) => changeStatus(revisionUnitId, 'in-progress'),
    [changeStatus],
  );
  const completeSession = useCallback(
    (revisionUnitId: string) => changeStatus(revisionUnitId, 'completed'),
    [changeStatus],
  );
  const clearPlan = useCallback(() => {
    clearRevisionPlan();
    setPlan(null);
  }, []);

  return { plan, startSession, completeSession, clearPlan };
}
