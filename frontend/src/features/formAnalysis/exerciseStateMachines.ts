/**
 * exerciseStateMachines.ts
 *
 * Generic, config-driven exercise FSM evaluator.
 * Previously hardcoded per-exercise logic (squat / push_up / bicep_curl only).
 * Now reads ExerciseDefinition configs from exerciseDefinitions.ts to support
 * 16+ exercises without per-exercise code duplication.
 *
 * Architecture:
 *   ExerciseEvaluator.evaluateFrame(landmarks)
 *     → resolves primaryAngle + secondaryAngle from ExerciseDefinition
 *     → drives FSM states (ready → descending → bottom → ascending → rep counted)
 *     → scores depth + stability from config thresholds
 *     → emits FormEvaluation with repCount, stage, formScore, feedback, activeFault
 */

import { Landmark, POSE_LANDMARKS, calculateAngle } from './poseGeometry';
import {
  ExerciseDefinition,
  ExerciseId,
  EXERCISE_CATALOG,
  AnglePoints,
} from './exerciseDefinitions';

// Re-export ExerciseId as ExerciseType for backwards compatibility with AiFormPage
export type ExerciseType = ExerciseId;

export interface FormEvaluation {
  exerciseType: ExerciseType;
  repCount: number;
  stage: string;
  primaryAngle: number;
  secondaryAngle: number;
  feedback: string;
  formScore: number;
  subScores: {
    depth: number;
    alignment: number;
    stability: number;
  };
  isRepCompletedThisFrame: boolean;
  activeFault?: string;
}

export interface RepDetail {
  repNumber: number;
  formScore: number;
  minAngle: number;
  durationSec: number;
  status: 'clean' | 'acceptable' | 'needs_work';
  primaryFault?: string;
  feedback: string;
  subScores: {
    depth: number;
    alignment: number;
    stability: number;
  };
}

export interface ExerciseDiagnostics {
  totalReps: number;
  avgScore: number;
  cleanReps: number;
  cleanPercentage: number;
  avgDurationSec: number;
  faultsSummary: Array<{ fault: string; count: number }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves an AnglePoints triplet against the landmark array.
 * Returns the angle in degrees, or null if any landmark is missing.
 */
function resolveAngle(
  landmarks: Landmark[],
  points: AnglePoints
): number | null {
  const a = landmarks[points.a];
  const b = landmarks[points.b];
  const c = landmarks[points.c];
  if (!a || !b || !c) return null;
  return calculateAngle(a, b, c);
}

/**
 * For bilateral exercises (bicep curl, hammer curl) we auto-select
 * the more visible arm to track.
 */
function selectBestArmAngle(landmarks: Landmark[], def: ExerciseDefinition): number | null {
  // Try right arm first (default primary), then left
  const rightAngle = resolveAngle(landmarks, def.primaryAngle);
  if (rightAngle !== null) return rightAngle;

  // Fallback: mirror primary to left side (swap R↔L indices by -1 offset for arm landmarks)
  // LEFT elbow = 13, RIGHT elbow = 14 → diff is +1 for right.
  // For arms: left = right - 1. We remap dynamically:
  const leftPoints: AnglePoints = {
    a: def.primaryAngle.a === POSE_LANDMARKS.RIGHT_SHOULDER ? POSE_LANDMARKS.LEFT_SHOULDER : def.primaryAngle.a,
    b: def.primaryAngle.b === POSE_LANDMARKS.RIGHT_ELBOW ? POSE_LANDMARKS.LEFT_ELBOW : def.primaryAngle.b,
    c: def.primaryAngle.c === POSE_LANDMARKS.RIGHT_WRIST ? POSE_LANDMARKS.LEFT_WRIST : def.primaryAngle.c,
  };
  return resolveAngle(landmarks, leftPoints);
}

// ─────────────────────────────────────────────────────────────────────────────
// ExerciseEvaluator — generic config-driven evaluator
// ─────────────────────────────────────────────────────────────────────────────

export class ExerciseEvaluator {
  private def: ExerciseDefinition;
  private repCount = 0;
  private stage = 'ready';
  private peakReached = false;
  private minAngleInRep = 180;
  private repStartTime = performance.now();
  private repHistory: RepDetail[] = [];

  constructor(exerciseType: ExerciseType) {
    const def = EXERCISE_CATALOG[exerciseType];
    if (!def) {
      throw new Error(`Unknown exercise type: ${exerciseType}`);
    }
    this.def = def;
    this.reset();
  }

  reset() {
    this.repCount = 0;
    this.stage = 'ready';
    this.peakReached = false;
    this.minAngleInRep = 180;
    this.repStartTime = performance.now();
    this.repHistory = [];
  }

  setExercise(type: ExerciseType) {
    const def = EXERCISE_CATALOG[type];
    if (!def) {
      throw new Error(`Unknown exercise type: ${type}`);
    }
    this.def = def;
    this.reset();
  }

  getRepHistory(): RepDetail[] {
    return [...this.repHistory];
  }

  getDiagnostics(): ExerciseDiagnostics | null {
    if (this.repHistory.length === 0) return null;

    const totalReps = this.repHistory.length;
    const avgScore = Math.round(
      this.repHistory.reduce((acc, r) => acc + r.formScore, 0) / totalReps
    );
    const cleanReps = this.repHistory.filter((r) => r.status === 'clean').length;
    const cleanPercentage = Math.round((cleanReps / totalReps) * 100);
    const avgDurationSec =
      Math.round(
        (this.repHistory.reduce((acc, r) => acc + r.durationSec, 0) / totalReps) * 10
      ) / 10;

    const faultMap: Record<string, number> = {};
    for (const r of this.repHistory) {
      if (r.primaryFault) {
        faultMap[r.primaryFault] = (faultMap[r.primaryFault] || 0) + 1;
      }
    }

    const faultsSummary = Object.entries(faultMap)
      .map(([fault, count]) => ({ fault, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalReps,
      avgScore,
      cleanReps,
      cleanPercentage,
      avgDurationSec,
      faultsSummary,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main evaluation entry point
  // ─────────────────────────────────────────────────────────────────────────

  evaluateFrame(landmarks: Landmark[]): FormEvaluation {
    const def = this.def;

    // Resolve primary angle — arm exercises get bilateral fallback
    const isArmExercise = [
      'bicep_curl', 'hammer_curl', 'shoulder_press', 'lateral_raise',
    ].includes(def.id);

    let primaryAngle: number | null = isArmExercise
      ? selectBestArmAngle(landmarks, def)
      : resolveAngle(landmarks, def.primaryAngle);

    if (primaryAngle === null) {
      return this.defaultEvaluation(this.stage, 0, 0, def.feedback.detecting);
    }

    // Resolve secondary angle (optional)
    let secondaryAngle = 90;
    if (def.secondaryAngle) {
      secondaryAngle = resolveAngle(landmarks, def.secondaryAngle) ?? 90;
    }

    // Track min angle in this rep
    if (primaryAngle < this.minAngleInRep) {
      this.minAngleInRep = primaryAngle;
    }

    // ── FSM state machine ──────────────────────────────────────────────────
    const { fsm } = def;
    let feedback = def.feedback.ready;
    let isCompleted = false;
    let activeFault: string | undefined;

    if (this.stage === 'ready' || this.stage === 'top' || this.stage === 'standing' || this.stage === 'extended') {
      // Normalise stage name to 'start'
      if (primaryAngle >= fsm.startAngle) {
        this.stage = 'start';
        feedback = def.feedback.ready;
      } else if (primaryAngle < fsm.descendAngle) {
        this.stage = 'descending';
        feedback = def.feedback.descending;
      }
    } else if (this.stage === 'start') {
      if (primaryAngle < fsm.descendAngle) {
        this.stage = 'descending';
        feedback = def.feedback.descending;
      }
    } else if (this.stage === 'descending') {
      if (primaryAngle <= fsm.bottomAngle) {
        this.stage = 'bottom';
        this.peakReached = true;
        feedback = def.feedback.bottom;
      } else {
        feedback = def.feedback.descending;
      }
    } else if (this.stage === 'bottom') {
      if (primaryAngle > fsm.ascendAngle) {
        this.stage = 'ascending';
        feedback = def.feedback.ascending;
      } else {
        feedback = def.feedback.bottom;
      }
    } else if (this.stage === 'ascending') {
      if (primaryAngle >= fsm.lockoutAngle) {
        if (this.peakReached) {
          // ── Rep completion & scoring ──────────────────────────────────
          this.repCount++;
          isCompleted = true;
          feedback = def.feedback.completed;

          const { depthScore, stabilityScore, alignmentScore, fault } =
            this.computeScores(primaryAngle, secondaryAngle);

          activeFault = fault;

          const overallForm = Math.round((depthScore + stabilityScore + alignmentScore) / 3);
          const durationSec =
            Math.round(((performance.now() - this.repStartTime) / 1000) * 10) / 10;
          const status =
            overallForm >= 90 ? 'clean' : overallForm >= 78 ? 'acceptable' : 'needs_work';

          this.repHistory.push({
            repNumber: this.repCount,
            formScore: overallForm,
            minAngle: Math.round(this.minAngleInRep),
            durationSec: Math.max(0.5, durationSec),
            status,
            primaryFault: activeFault,
            feedback,
            subScores: { depth: depthScore, alignment: alignmentScore, stability: stabilityScore },
          });

          this.repStartTime = performance.now();
        }
        this.stage = 'start';
        this.peakReached = false;
        this.minAngleInRep = 180;
      } else {
        feedback = def.feedback.ascending;
      }
    }

    // ── Real-time stability warning override ──────────────────────────────
    if (
      def.stabilityScoring?.warningBelow !== undefined &&
      def.stabilityScoring?.warningFeedback &&
      secondaryAngle < def.stabilityScoring.warningBelow
    ) {
      feedback = def.stabilityScoring.warningFeedback;
    }

    // ── Live scores for HUD ───────────────────────────────────────────────
    const { depthScore, stabilityScore, alignmentScore } = this.computeScores(
      primaryAngle,
      secondaryAngle
    );
    const overallForm = Math.round((depthScore + stabilityScore + alignmentScore) / 3);

    return {
      exerciseType: def.id as ExerciseType,
      repCount: this.repCount,
      stage: this.stage,
      primaryAngle,
      secondaryAngle,
      feedback,
      formScore: overallForm,
      subScores: {
        depth: depthScore,
        alignment: alignmentScore,
        stability: stabilityScore,
      },
      isRepCompletedThisFrame: isCompleted,
      activeFault,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Score computation from config thresholds
  // ─────────────────────────────────────────────────────────────────────────

  private computeScores(
    _primaryAngle: number,
    secondaryAngle: number
  ): {
    depthScore: number;
    stabilityScore: number;
    alignmentScore: number;
    fault?: string;
  } {
    const { depthScoring, stabilityScoring } = this.def;
    let fault: string | undefined;

    // Depth — scored from minAngleInRep accumulated this rep
    let depthScore: number;
    if (this.minAngleInRep <= depthScoring.excellent) {
      depthScore = depthScoring.excellentScore;
    } else if (this.minAngleInRep <= depthScoring.good) {
      depthScore = depthScoring.goodScore;
    } else {
      depthScore = depthScoring.poorScore;
    }

    if (this.minAngleInRep > depthScoring.faultThreshold && this.stage !== 'start') {
      fault = this.def.depthScoring.faultThreshold > 100
        ? `Insufficient range of motion`
        : `Insufficient depth`;
    }

    // Stability — from secondary angle
    let stabilityScore = 85;
    if (stabilityScoring) {
      const inRange =
        secondaryAngle >= stabilityScoring.goodRangeMin &&
        secondaryAngle <= stabilityScoring.goodRangeMax;
      stabilityScore = inRange ? stabilityScoring.goodScore : stabilityScoring.poorScore;

      if (!inRange && stabilityScoring.faultLabelVi && !fault) {
        fault = stabilityScoring.faultLabelVi;
      }
    }

    // Alignment is a constant baseline (form symmetry, not angle-derived)
    const alignmentScore = 90;

    return { depthScore, stabilityScore, alignmentScore, fault };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Fallback evaluation when landmarks are missing
  // ─────────────────────────────────────────────────────────────────────────

  private defaultEvaluation(
    stage: string,
    primaryAngle: number,
    secondaryAngle: number,
    feedback: string
  ): FormEvaluation {
    return {
      exerciseType: this.def.id as ExerciseType,
      repCount: this.repCount,
      stage,
      primaryAngle,
      secondaryAngle,
      feedback,
      formScore: 85,
      subScores: {
        depth: 85,
        alignment: 85,
        stability: 85,
      },
      isRepCompletedThisFrame: false,
    };
  }
}
