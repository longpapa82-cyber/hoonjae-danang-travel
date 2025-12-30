export type ActivityStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
export type TravelStatus = 'BEFORE_TRIP' | 'IN_PROGRESS' | 'COMPLETED';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Activity {
  id: string;
  time: string; // HH:mm format
  title: string;
  description?: string;
  imageUrl?: string;
  duration?: number; // minutes
  tip?: string;
  location?: Location; // GPS 좌표
}

export interface Meal {
  type: '조식' | '중식' | '석식';
  menu: string;
}

export interface TravelDay {
  day: number;
  date: string; // YYYY-MM-DD format
  dayOfWeek: string;
  activities: Activity[];
  meals: Meal[];
}

export interface TravelData {
  title: string;
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
  days: TravelDay[];
}

export interface TravelProgress {
  status: TravelStatus;
  currentDay: number | null;
  currentActivity: Activity | null;
  completedActivities: number;
  totalActivities: number;
  progressPercentage: number;
  timeUntilStart?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}
