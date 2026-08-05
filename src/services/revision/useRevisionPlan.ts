'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DiagnosticResult } from '@/types/diagnostic';
import type {
  RevisionPlan,
  RevisionSession,
  ValidationAttempt,
  ValidationResponse,
} from '@/types/revision';
import { createPlanForDiagnostic } from './experience';
import { recordValidationAttempt, updateRevisionSessionStatus } from './progress';
import { clearRevisionPlan, loadRevisionPlan, saveRevisionPlan } from './storage';
import { createValidationAttempt } from './validation';

interface UseRevisionPlanResult {
  plan: RevisionPlan | null;
  startSession: (revisionUnitId: string) => void;
  submitValidationAttempt: (
    revisionUnitId: string,
    responses: ValidationResponse[],
  ) => ValidationAttempt | null;
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

  const submitValidationAttempt = useCallback(
    (revisionUnitId: string, responses: ValidationResponse[]) => {
      if (!plan) return null;

      const session = plan.sessions.find(
        (candidate) => candidate.revisionUnitId === revisionUnitId,
      );
      if (!session) return null;

      const now = new Date().toISOString();
      const attempt = createValidationAttempt(session, responses, {
        startedAt: now,
        completedAt: now,
      });
      const updated = recordValidationAttempt(plan, revisionUnitId, attempt);
      setPlan(updated);
      saveRevisionPlan(updated);
      return attempt;
    },
    [plan],
  );

  const clearPlan = useCallback(() => {
    clearRevisionPlan();
    setPlan(null);
  }, []);

  return { plan, startSession, submitValidationAttempt, clearPlan };
}
