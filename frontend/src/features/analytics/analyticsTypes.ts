export interface MuscleVolumeItem {
  muscle: string;
  volumeKg: number;
}

export interface AnalyticsOverview {
  weeklyVolumeKg: number;
  monthlyVolumeKg: number;
  totalCompletedSessions: number;
  streakDays: number;
  muscleDistribution: MuscleVolumeItem[];
  lastUpdated: string;
}

export interface ProgressionDataPoint {
  date: string;
  sessionName: string;
  maxWeightKg: number;
  estimated1RM: number;
  totalVolumeKg: number;
}

export interface ExercisePRs {
  maxWeightKg: number;
  maxEstimated1RM: number;
  maxSetVolumeKg: number;
  bestRepsAtMaxWeight: number;
}

export interface ExerciseAnalyticsResponse {
  exerciseId: string;
  progression: ProgressionDataPoint[];
  prs: ExercisePRs;
  totalSessions: number;
}

export interface PersonalRecordItem {
  exerciseId: string;
  exerciseName: string;
  category: string;
  primaryMuscle: string;
  prs: ExercisePRs;
}
