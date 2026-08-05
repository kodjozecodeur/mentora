import type { RevisionPlan, RevisionSession } from '@/types/revision';
import { type CompetencyStatus, getCompetencyStatuses } from './progress';

export type RevisionTimelineBucketId = 'today' | 'tomorrow' | 'week';

export type RevisionTimelineEntry = {
  session: RevisionSession;
  status: CompetencyStatus;
  bucket: RevisionTimelineBucketId;
};

/**
 * Groups sessions into "Aujourd'hui" / "Demain" / "Cette semaine" relative to the day of the
 * first not-yet-validated session (or the last day, once everything is validated).
 */
export function getRevisionTimeline(plan: Pick<RevisionPlan, 'sessions'>): RevisionTimelineEntry[] {
  const orderedSessions = [...plan.sessions].sort((left, right) => left.order - right.order);
  if (orderedSessions.length === 0) return [];

  const statuses = getCompetencyStatuses(plan);
  const currentIndex = statuses.findIndex((status) => status !== 'validated');
  const currentDay =
    currentIndex === -1
      ? orderedSessions[orderedSessions.length - 1].dayNumber
      : orderedSessions[currentIndex].dayNumber;

  return orderedSessions.map((session, index) => ({
    session,
    status: statuses[index],
    bucket: bucketFor(session.dayNumber, currentDay),
  }));
}

function bucketFor(dayNumber: number, currentDay: number): RevisionTimelineBucketId {
  if (dayNumber === currentDay) return 'today';
  if (dayNumber === currentDay + 1) return 'tomorrow';
  return 'week';
}
