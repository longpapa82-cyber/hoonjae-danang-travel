import { Activity, TravelData, TravelProgress, TravelStatus, ActivityStatus } from '@/types/travel';
import { parseISOString, combineDateAndTime, calculateTimeDifference, getActivityEndTime, KOREA_TIMEZONE } from './timeUtils';

/**
 * 현재 여행 진행 상태를 계산합니다
 */
export function calculateTravelProgress(
  travelData: TravelData,
  currentTime: Date
): TravelProgress {
  const startDate = parseISOString(travelData.startDate);
  const endDate = parseISOString(travelData.endDate);

  // 여행 상태 판별
  let status: TravelStatus;
  if (currentTime < startDate) {
    status = 'BEFORE_TRIP';
  } else if (currentTime > endDate) {
    status = 'COMPLETED';
  } else {
    status = 'IN_PROGRESS';
  }

  // 전체 활동 수 계산
  const allActivities = travelData.days.flatMap(day =>
    day.activities.map(activity => ({
      ...activity,
      date: day.date,
    }))
  );
  const totalActivities = allActivities.length;

  // 완료된 활동과 현재 활동 찾기
  let completedActivities = 0;
  let currentActivity: Activity | null = null;
  let currentDay: number | null = null;

  for (const day of travelData.days) {
    for (const activity of day.activities) {
      const activityStartTime = combineDateAndTime(day.date, activity.time, KOREA_TIMEZONE);
      const activityEndTime = getActivityEndTime(activityStartTime, activity.duration);

      if (currentTime >= activityEndTime) {
        completedActivities++;
      } else if (currentTime >= activityStartTime && currentTime < activityEndTime) {
        currentActivity = activity;
        currentDay = day.day;
        break;
      }
    }
    if (currentActivity) break;
  }

  // 진행률 계산
  const progressPercentage = totalActivities > 0
    ? Math.round((completedActivities / totalActivities) * 100)
    : 0;

  // 여행 시작까지 남은 시간 (여행 전인 경우)
  const timeUntilStart = status === 'BEFORE_TRIP'
    ? calculateTimeDifference(currentTime, startDate)
    : undefined;

  return {
    status,
    currentDay,
    currentActivity,
    completedActivities,
    totalActivities,
    progressPercentage,
    timeUntilStart,
  };
}

/**
 * 특정 활동의 상태를 판별합니다
 */
export function getActivityStatus(
  activity: Activity,
  date: string,
  currentTime: Date
): ActivityStatus {
  const activityStartTime = combineDateAndTime(date, activity.time, KOREA_TIMEZONE);
  const activityEndTime = getActivityEndTime(activityStartTime, activity.duration);

  if (currentTime >= activityEndTime) {
    return 'COMPLETED';
  } else if (currentTime >= activityStartTime && currentTime < activityEndTime) {
    return 'IN_PROGRESS';
  } else {
    return 'UPCOMING';
  }
}

/**
 * 특정 날짜의 진행률을 계산합니다
 */
export function calculateDayProgress(
  activities: Activity[],
  date: string,
  currentTime: Date
): number {
  if (activities.length === 0) return 0;

  const completedCount = activities.filter(activity => {
    const status = getActivityStatus(activity, date, currentTime);
    return status === 'COMPLETED';
  }).length;

  return Math.round((completedCount / activities.length) * 100);
}
