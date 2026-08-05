import type { ResultsBranch } from '@/features/diagnostic/resultCopy';
import type { RevisionShellView } from './types';

/** Spec: revision-plan opens the plan first, learning-journey opens the journey hub directly. */
export function resolveInitialRevisionView(branch: ResultsBranch): RevisionShellView {
  return branch === 'learning-journey' ? 'overview' : 'plan';
}
