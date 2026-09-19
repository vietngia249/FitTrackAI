/**
 * exerciseDefinitions.ts
 *
 * Declarative exercise config catalog — ported & adapted from:
 * yakupzengin/fitness-trainer-pose-estimation (MIT License)
 * YAML definitions → TypeScript interface + MediaPipe landmark indices.
 *
 * Each ExerciseDefinition fully describes the FSM thresholds, angle landmarks,
 * scoring rubric, and fault detection for one exercise. The generic
 * ExerciseEvaluator in exerciseStateMachines.ts reads these configs at runtime.
 */

import { POSE_LANDMARKS } from './poseGeometry';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MuscleGroup = 'lower_body' | 'upper_body' | 'core' | 'cardio';

/** Three landmark indices (A-B-C) used by calculateAngle(A, B, C) — B is the vertex. */
export interface AnglePoints {
  a: number; // landmark index
  b: number; // vertex landmark index
  c: number; // landmark index
}

/**
 * One fault rule checked every frame during the rep.
 */
export interface FaultRule {
  id: string;
  /** Plain-English description used as activeFault key */
  label: string;
  /** Vietnamese display text for UI */
  labelVi: string;
  severity: 'warning' | 'info';
}

/**
 * FSM thresholds for a repetition-based exercise.
 * All angles are in degrees (0–180).
 */
export interface RepFSM {
  /** Angle above which the user is at the "top/start" of a rep */
  startAngle: number;
  /** Angle below which the user enters the "descending" phase */
  descendAngle: number;
  /** Angle at or below which the rep bottom is reached (triggers peakReached) */
  bottomAngle: number;
  /** Angle above which the ascending phase begins */
  ascendAngle: number;
  /** Angle at or above which the rep is counted (full lockout) */
  lockoutAngle: number;
}

/**
 * Depth scoring thresholds — maps min angle reached during rep → score.
 */
export interface DepthScoring {
  /** minAngle <= excellent → score = excellentScore */
  excellent: number;
  excellentScore: number;
  /** minAngle <= good → score = goodScore */
  good: number;
  goodScore: number;
  /** Otherwise → score = poorScore */
  poorScore: number;
  /** minAngle above which "insufficient depth" fault fires */
  faultThreshold: number;
}

/**
 * Secondary angle scoring (stability / spine alignment / torso).
 */
export interface StabilityScoring {
  /** Angle range [min, max] that scores `goodScore` */
  goodRangeMin: number;
  goodRangeMax: number;
  goodScore: number;
  poorScore: number;
  /** If secondary angle is outside good range, this fault label fires */
  faultLabel?: string;
  faultLabelVi?: string;
  /** Secondary angle threshold that fires a real-time warning feedback override */
  warningBelow?: number;
  warningFeedback?: string;
}

/** Full exercise definition */
export interface ExerciseDefinition {
  id: string;
  displayName: string;
  displayNameVi: string;
  muscleGroup: MuscleGroup;
  targetMuscles: string[];
  targetMusclesVi: string[];
  equipment: string;
  equipmentVi: string;
  difficulty: ExerciseDifficulty;
  defaultReps: number;
  description: string;
  descriptionVi: string;

  /**
   * Primary angle landmark triplet (A-B-C). B is the vertex.
   * This angle drives the FSM and depth scoring.
   */
  primaryAngle: AnglePoints;

  /**
   * Secondary angle landmark triplet for stability/alignment scoring.
   * Optional — some exercises only track the primary angle.
   */
  secondaryAngle?: AnglePoints;

  /** FSM state thresholds */
  fsm: RepFSM;

  /** How depth is scored based on min primary angle in the rep */
  depthScoring: DepthScoring;

  /** How stability is scored based on secondary angle */
  stabilityScoring?: StabilityScoring;

  /** Feedback messages for FSM stages */
  feedback: {
    ready: string;
    descending: string;
    bottom: string;
    ascending: string;
    completed: string;
    detecting: string;
  };

  /** Additional fault rules (beyond depth & stability) */
  faults?: FaultRule[];

  /** Whether this is a "peak contraction" exercise (curl vs squat style) */
  isPeakContraction: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shorthand alias
// ─────────────────────────────────────────────────────────────────────────────

const L = POSE_LANDMARKS;

// ─────────────────────────────────────────────────────────────────────────────
// Exercise Definitions — Lower Body (see next commit)
// ─────────────────────────────────────────────────────────────────────────────

// (definitions to be added progressively)

export const EXERCISE_CATALOG: Record<string, ExerciseDefinition> = {};
export const EXERCISE_LIST: ExerciseDefinition[] = [];
export type ExerciseId = keyof typeof EXERCISE_CATALOG;

// Suppress unused import warning — L will be used by exercise definitions
void L;
