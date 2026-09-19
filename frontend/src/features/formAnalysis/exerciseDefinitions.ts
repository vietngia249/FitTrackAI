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
// Exercise Definitions — Lower Body
// ─────────────────────────────────────────────────────────────────────────────

/** Squat — knee angle (Hip→Knee→Ankle), torso secondary (Shoulder→Hip→Knee) */
const squat: ExerciseDefinition = {
  id: 'squat',
  displayName: 'Squat',
  displayNameVi: 'Squat',
  muscleGroup: 'lower_body',
  targetMuscles: ['Quadriceps', 'Gluteus', 'Hamstrings'],
  targetMusclesVi: ['Tứ đầu đùi', 'Cơ mông', 'Gân kheo'],
  equipment: 'Bodyweight or Barbell',
  equipmentVi: 'Trọng lượng cơ thể hoặc tạ đòn',
  difficulty: 'beginner',
  defaultReps: 10,
  description: 'Classic squat targeting lower body strength.',
  descriptionVi: 'Squat cơ bản tăng cường sức mạnh phần dưới cơ thể.',
  primaryAngle: { a: L.RIGHT_HIP, b: L.RIGHT_KNEE, c: L.RIGHT_ANKLE },
  secondaryAngle: { a: L.RIGHT_SHOULDER, b: L.RIGHT_HIP, c: L.RIGHT_KNEE },
  isPeakContraction: false,
  fsm: {
    startAngle: 165,
    descendAngle: 155,
    bottomAngle: 90,
    ascendAngle: 105,
    lockoutAngle: 160,
  },
  depthScoring: {
    excellent: 90, excellentScore: 98,
    good: 105, goodScore: 82,
    poorScore: 65,
    faultThreshold: 95,
  },
  stabilityScoring: {
    goodRangeMin: 60, goodRangeMax: 180,
    goodScore: 92, poorScore: 72,
    faultLabelVi: 'Thân người gập quá mức về trước',
    faultLabel: 'Excessive forward lean',
  },
  feedback: {
    ready: 'Stand upright with feet shoulder-width apart.',
    descending: 'Descending... Keep knees tracking outwards.',
    bottom: 'Parallel depth reached! Drive through heels!',
    ascending: 'Push up through mid-foot and squeeze glutes.',
    completed: 'Rep finished! Full hip extension.',
    detecting: 'Detecting lower body...',
  },
};

/** Lunge — knee angle (Hip→Knee→Ankle), torso secondary (Shoulder→Hip→Knee) */
const lunge: ExerciseDefinition = {
  id: 'lunge',
  displayName: 'Lunge',
  displayNameVi: 'Bước chân tấn',
  muscleGroup: 'lower_body',
  targetMuscles: ['Quadriceps', 'Gluteus', 'Hamstrings', 'Calves'],
  targetMusclesVi: ['Tứ đầu đùi', 'Cơ mông', 'Gân kheo', 'Cơ bắp chân'],
  equipment: 'Bodyweight',
  equipmentVi: 'Trọng lượng cơ thể',
  difficulty: 'beginner',
  defaultReps: 10,
  description: 'Forward lunge for leg strength and balance.',
  descriptionVi: 'Bước chân về phía trước tăng sức mạnh chân và cân bằng.',
  primaryAngle: { a: L.LEFT_HIP, b: L.LEFT_KNEE, c: L.LEFT_ANKLE },
  secondaryAngle: { a: L.LEFT_SHOULDER, b: L.LEFT_HIP, c: L.LEFT_KNEE },
  isPeakContraction: false,
  fsm: {
    startAngle: 160,
    descendAngle: 150,
    bottomAngle: 90,
    ascendAngle: 105,
    lockoutAngle: 155,
  },
  depthScoring: {
    excellent: 90, excellentScore: 97,
    good: 105, goodScore: 80,
    poorScore: 63,
    faultThreshold: 100,
  },
  stabilityScoring: {
    goodRangeMin: 60, goodRangeMax: 180,
    goodScore: 90, poorScore: 70,
    faultLabelVi: 'Thân người nghiêng về trước',
    faultLabel: 'Torso leaning forward',
  },
  feedback: {
    ready: 'Stand tall with feet hip-width apart.',
    descending: 'Stepping forward... keep torso upright.',
    bottom: 'Front knee at 90°! Drive back up.',
    ascending: 'Pushing back to start through front heel.',
    completed: 'Rep counted! Legs together.',
    detecting: 'Detecting lower body...',
  },
};

/** Deadlift — hip hinge angle (Shoulder→Hip→Knee) */
const deadlift: ExerciseDefinition = {
  id: 'deadlift',
  displayName: 'Deadlift',
  displayNameVi: 'Kéo tạ đất',
  muscleGroup: 'lower_body',
  targetMuscles: ['Hamstrings', 'Gluteus', 'Lower Back', 'Traps'],
  targetMusclesVi: ['Gân kheo', 'Cơ mông', 'Lưng dưới', 'Cơ thang'],
  equipment: 'Barbell or Dumbbells',
  equipmentVi: 'Tạ đòn hoặc tạ đơn',
  difficulty: 'intermediate',
  defaultReps: 8,
  description: 'Hip hinge deadlift for posterior chain.',
  descriptionVi: 'Kéo tạ đất gập hông cho chuỗi cơ sau.',
  primaryAngle: { a: L.RIGHT_SHOULDER, b: L.RIGHT_HIP, c: L.RIGHT_KNEE },
  secondaryAngle: { a: L.LEFT_SHOULDER, b: L.LEFT_HIP, c: L.LEFT_KNEE },
  isPeakContraction: false,
  fsm: {
    startAngle: 160,
    descendAngle: 150,
    bottomAngle: 60,    // deep hip hinge, torso close to parallel
    ascendAngle: 75,
    lockoutAngle: 155,
  },
  depthScoring: {
    excellent: 65, excellentScore: 97,
    good: 80, goodScore: 80,
    poorScore: 62,
    faultThreshold: 75,
  },
  stabilityScoring: {
    goodRangeMin: 155, goodRangeMax: 180,
    goodScore: 93, poorScore: 70,
    faultLabelVi: 'Lưng tròn khi kéo tạ',
    faultLabel: 'Rounded back during deadlift',
    warningBelow: 150,
    warningFeedback: 'Warning: Back rounding! Hinge from hips.',
  },
  feedback: {
    ready: 'Stand over bar, hip-width. Neutral spine.',
    descending: 'Hinging from hips, bar close to legs.',
    bottom: 'Bar at floor! Drive hips forward.',
    ascending: 'Pushing floor away, lockout hips!',
    completed: 'Rep counted! Strong lockout.',
    detecting: 'Detecting hip hinge from side...',
  },
};

/** Glute Bridge — hip angle (Shoulder→Hip→Knee) */
const glute_bridge: ExerciseDefinition = {
  id: 'glute_bridge',
  displayName: 'Glute Bridge',
  displayNameVi: 'Cầu mông',
  muscleGroup: 'lower_body',
  targetMuscles: ['Gluteus Maximus', 'Hamstrings', 'Core'],
  targetMusclesVi: ['Cơ mông lớn', 'Gân kheo', 'Core'],
  equipment: 'Bodyweight',
  equipmentVi: 'Trọng lượng cơ thể',
  difficulty: 'beginner',
  defaultReps: 12,
  description: 'Glute bridge for posterior chain activation.',
  descriptionVi: 'Cầu mông kích hoạt chuỗi cơ sau.',
  primaryAngle: { a: L.RIGHT_SHOULDER, b: L.RIGHT_HIP, c: L.RIGHT_KNEE },
  secondaryAngle: { a: L.RIGHT_HIP, b: L.RIGHT_KNEE, c: L.RIGHT_ANKLE },
  isPeakContraction: true,
  fsm: {
    startAngle: 160,
    descendAngle: 150,
    bottomAngle: 120,   // hips driven up — hip extension
    ascendAngle: 130,
    lockoutAngle: 155,
  },
  depthScoring: {
    excellent: 120, excellentScore: 97,
    good: 140, goodScore: 80,
    poorScore: 63,
    faultThreshold: 135,
  },
  feedback: {
    ready: 'Lie on back, knees bent, feet flat.',
    descending: 'Driving hips upward...',
    bottom: 'Full hip extension! Squeeze glutes hard.',
    ascending: 'Lowering hips to ground.',
    completed: 'Rep counted!',
    detecting: 'Detecting hips from side view...',
  },
};

/** Calf Raise — ankle angle (Knee→Ankle→FootIndex) */
const calf_raise: ExerciseDefinition = {
  id: 'calf_raise',
  displayName: 'Calf Raise',
  displayNameVi: 'Kiễng gót',
  muscleGroup: 'lower_body',
  targetMuscles: ['Gastrocnemius', 'Soleus'],
  targetMusclesVi: ['Cơ bắp chân', 'Cơ dép'],
  equipment: 'Bodyweight',
  equipmentVi: 'Trọng lượng cơ thể',
  difficulty: 'beginner',
  defaultReps: 15,
  description: 'Calf raise for lower leg strength.',
  descriptionVi: 'Kiễng gót tăng cường cơ bắp chân.',
  primaryAngle: { a: L.RIGHT_KNEE, b: L.RIGHT_ANKLE, c: L.RIGHT_FOOT_INDEX },
  isPeakContraction: true,
  fsm: {
    startAngle: 90,
    descendAngle: 85,
    bottomAngle: 70,    // plantarflexion peak
    ascendAngle: 78,
    lockoutAngle: 88,
  },
  depthScoring: {
    excellent: 73, excellentScore: 95,
    good: 80, goodScore: 80,
    poorScore: 65,
    faultThreshold: 78,
  },
  feedback: {
    ready: 'Stand on balls of feet, feet hip-width.',
    descending: 'Rising on toes...',
    bottom: 'Maximum plantarflexion! Squeeze calves.',
    ascending: 'Lower heels with control.',
    completed: 'Rep counted!',
    detecting: 'Detecting ankles and feet...',
  },
};

/** Wall Sit — knee angle hold (Hip→Knee→Ankle at 90°) */
const wall_sit: ExerciseDefinition = {
  id: 'wall_sit',
  displayName: 'Wall Sit',
  displayNameVi: 'Ngồi tường',
  muscleGroup: 'lower_body',
  targetMuscles: ['Quadriceps', 'Gluteus', 'Calves'],
  targetMusclesVi: ['Tứ đầu đùi', 'Cơ mông', 'Cơ bắp chân'],
  equipment: 'Wall',
  equipmentVi: 'Tường',
  difficulty: 'beginner',
  defaultReps: 3,
  description: 'Wall sit isometric hold for quad endurance.',
  descriptionVi: 'Ngồi tường tĩnh tăng sức bền tứ đầu đùi.',
  primaryAngle: { a: L.RIGHT_HIP, b: L.RIGHT_KNEE, c: L.RIGHT_ANKLE },
  isPeakContraction: false,
  fsm: {
    startAngle: 160,
    descendAngle: 140,
    bottomAngle: 90,
    ascendAngle: 100,
    lockoutAngle: 155,
  },
  depthScoring: {
    excellent: 92, excellentScore: 98,
    good: 105, goodScore: 80,
    poorScore: 60,
    faultThreshold: 100,
  },
  stabilityScoring: {
    goodRangeMin: 85, goodRangeMax: 95,
    goodScore: 96, poorScore: 68,
    faultLabelVi: 'Góc gối không phải 90°',
    faultLabel: 'Knee angle not at 90°',
  },
  feedback: {
    ready: 'Stand with back flat against wall.',
    descending: 'Sliding down to 90°...',
    bottom: 'Hold 90° position! Quads burning!',
    ascending: 'Rising back up.',
    completed: 'Hold complete! Well done.',
    detecting: 'Detecting squat position at wall...',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Catalog Map & Ordering
// ─────────────────────────────────────────────────────────────────────────────

export const EXERCISE_CATALOG: Record<string, ExerciseDefinition> = {
  squat,
  lunge,
  deadlift,
  glute_bridge,
  calf_raise,
  wall_sit,
};

/** Ordered list for UI rendering, grouped by muscle group */
export const EXERCISE_LIST: ExerciseDefinition[] = [
  squat,
  lunge,
  deadlift,
  glute_bridge,
  calf_raise,
  wall_sit,
];

export type ExerciseId = keyof typeof EXERCISE_CATALOG;
