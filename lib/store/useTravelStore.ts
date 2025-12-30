import { create } from 'zustand';
import { TravelProgress, Activity } from '@/types/travel';

interface TravelState {
  // 상태
  currentProgress: TravelProgress | null;
  selectedActivity: Activity | null;
  isMapView: boolean;
  isOffline: boolean;

  // 액션
  setProgress: (progress: TravelProgress) => void;
  selectActivity: (activity: Activity | null) => void;
  toggleMapView: () => void;
  setOffline: (offline: boolean) => void;
}

export const useTravelStore = create<TravelState>((set) => ({
  // 초기 상태
  currentProgress: null,
  selectedActivity: null,
  isMapView: false,
  isOffline: false,

  // 액션 구현
  setProgress: (progress) => set({ currentProgress: progress }),
  selectActivity: (activity) => set({ selectedActivity: activity }),
  toggleMapView: () => set((state) => ({ isMapView: !state.isMapView })),
  setOffline: (offline) => set({ isOffline: offline }),
}));
