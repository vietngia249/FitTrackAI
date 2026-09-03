import { Landmark, POSE_LANDMARKS } from './poseGeometry';
import { ExerciseType } from './exerciseStateMachines';

/**
 * Generates biomechanically accurate kinematic 33-point landmarks
 * as a function of time (t in seconds) for Bicep Curls, Squats, and Push-ups.
 */
export function generateSimulatedPose(exercise: ExerciseType, timeSec: number): Landmark[] {
  // Base neutral 33 landmarks
  const lm: Landmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.95,
  }));

  // Frequency: 1 rep every 3.2 seconds
  const cycle = (timeSec % 3.2) / 3.2; // 0 -> 1
  // Sinusoidal rep phase: 0 (start) -> 1 (peak/bottom) -> 0 (finish)
  const repPhase = Math.sin(cycle * Math.PI);

  if (exercise === 'bicep_curl') {
    // Standing person
    lm[POSE_LANDMARKS.NOSE] = { x: 0.5, y: 0.18 };
    lm[POSE_LANDMARKS.LEFT_SHOULDER] = { x: 0.43, y: 0.28 };
    lm[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: 0.57, y: 0.28 };

    // Torso / Hips
    lm[POSE_LANDMARKS.LEFT_HIP] = { x: 0.45, y: 0.52 };
    lm[POSE_LANDMARKS.RIGHT_HIP] = { x: 0.55, y: 0.52 };

    // Elbows pinned
    lm[POSE_LANDMARKS.RIGHT_ELBOW] = { x: 0.58, y: 0.44 };
    lm[POSE_LANDMARKS.LEFT_ELBOW] = { x: 0.42, y: 0.44 };

    // Wrists curl up: y goes from 0.60 (extended) to 0.30 (peak curl)
    const wristY = 0.60 - repPhase * 0.32;
    const wristX = 0.58 - repPhase * 0.04;
    lm[POSE_LANDMARKS.RIGHT_WRIST] = { x: wristX, y: wristY };
    lm[POSE_LANDMARKS.LEFT_WRIST] = { x: 0.42, y: 0.60 };

    // Legs straight
    lm[POSE_LANDMARKS.RIGHT_KNEE] = { x: 0.55, y: 0.72 };
    lm[POSE_LANDMARKS.LEFT_KNEE] = { x: 0.45, y: 0.72 };
    lm[POSE_LANDMARKS.RIGHT_ANKLE] = { x: 0.55, y: 0.90 };
    lm[POSE_LANDMARKS.LEFT_ANKLE] = { x: 0.45, y: 0.90 };
  } else if (exercise === 'squat') {
    // Squat: Hips descend, knees bend, torso leans slightly forward
    const squatDepth = repPhase * 0.22; // descent amount

    lm[POSE_LANDMARKS.NOSE] = { x: 0.5, y: 0.16 + squatDepth };
    lm[POSE_LANDMARKS.LEFT_SHOULDER] = { x: 0.43, y: 0.26 + squatDepth };
    lm[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: 0.57, y: 0.26 + squatDepth };

    // Hands out in front for balance
    lm[POSE_LANDMARKS.LEFT_ELBOW] = { x: 0.40, y: 0.36 + squatDepth };
    lm[POSE_LANDMARKS.RIGHT_ELBOW] = { x: 0.60, y: 0.36 + squatDepth };
    lm[POSE_LANDMARKS.LEFT_WRIST] = { x: 0.38, y: 0.34 + squatDepth };
    lm[POSE_LANDMARKS.RIGHT_WRIST] = { x: 0.62, y: 0.34 + squatDepth };

    // Hips drop down and back
    const hipY = 0.48 + squatDepth * 1.3;
    lm[POSE_LANDMARKS.LEFT_HIP] = { x: 0.45, y: hipY };
    lm[POSE_LANDMARKS.RIGHT_HIP] = { x: 0.55, y: hipY };

    // Knees flare forward/outward as hips drop
    const kneeY = 0.68 + squatDepth * 0.4;
    const kneeSpread = repPhase * 0.05;
    lm[POSE_LANDMARKS.LEFT_KNEE] = { x: 0.44 - kneeSpread, y: kneeY };
    lm[POSE_LANDMARKS.RIGHT_KNEE] = { x: 0.56 + kneeSpread, y: kneeY };

    // Ankles stay planted on ground
    lm[POSE_LANDMARKS.LEFT_ANKLE] = { x: 0.43, y: 0.88 };
    lm[POSE_LANDMARKS.RIGHT_ANKLE] = { x: 0.57, y: 0.88 };
  } else if (exercise === 'push_up') {
    // Push-up: horizontal prone plank
    const pushupDepth = repPhase * 0.16;

    // Head
    lm[POSE_LANDMARKS.NOSE] = { x: 0.25, y: 0.44 + pushupDepth };
    // Shoulders
    lm[POSE_LANDMARKS.LEFT_SHOULDER] = { x: 0.32, y: 0.46 + pushupDepth };
    lm[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: 0.36, y: 0.50 + pushupDepth };

    // Wrists stay planted on ground
    lm[POSE_LANDMARKS.LEFT_WRIST] = { x: 0.34, y: 0.72 };
    lm[POSE_LANDMARKS.RIGHT_WRIST] = { x: 0.38, y: 0.74 };

    // Elbows bend outward
    lm[POSE_LANDMARKS.RIGHT_ELBOW] = { x: 0.42 + repPhase * 0.06, y: 0.58 + pushupDepth * 0.7 };
    lm[POSE_LANDMARKS.LEFT_ELBOW] = { x: 0.38 + repPhase * 0.06, y: 0.56 + pushupDepth * 0.7 };

    // Rigid plank line (Shoulder -> Hip -> Ankle)
    lm[POSE_LANDMARKS.LEFT_HIP] = { x: 0.58, y: 0.48 + pushupDepth * 0.9 };
    lm[POSE_LANDMARKS.RIGHT_HIP] = { x: 0.60, y: 0.52 + pushupDepth * 0.9 };

    lm[POSE_LANDMARKS.LEFT_KNEE] = { x: 0.72, y: 0.54 + pushupDepth * 0.6 };
    lm[POSE_LANDMARKS.RIGHT_KNEE] = { x: 0.74, y: 0.58 + pushupDepth * 0.6 };

    lm[POSE_LANDMARKS.LEFT_ANKLE] = { x: 0.84, y: 0.60 };
    lm[POSE_LANDMARKS.RIGHT_ANKLE] = { x: 0.86, y: 0.64 };
  }

  return lm;
}
