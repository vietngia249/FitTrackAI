import { Exercise } from '../exercises/exerciseTypes';

export interface WorkoutPlanExercise {
  id: string;
  planId: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  notes?: string | null;
  exercise: Exercise;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  targetMuscles: string[];
  createdAt: string;
  updatedAt: string;
  exercises: WorkoutPlanExercise[];
}

export interface ExerciseSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  setType: 'warmup' | 'normal' | 'drop' | 'failure';
  weightKg: number; // strictly canonical metric kg
  reps: number;
  rpe?: number | null;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  order: number;
  notes?: string | null;
  exercise: Exercise;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  planId?: string | null;
  name: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  startedAt: string;
  completedAt?: string | null;
  totalVolumeKg: number; // metric-canonical kg
  durationSeconds: number;
  notes?: string | null;
  exercises: SessionExercise[];
}

export interface CreatePlanPayload {
  name: string;
  description?: string;
  targetMuscles: string[];
  exercises: Array<{
    exerciseId: string;
    order: number;
    targetSets: number;
    targetReps: number;
    restSeconds: number;
    notes?: string;
  }>;
}
