import { Landmark, POSE_LANDMARKS, calculateAngle } from './poseGeometry';

export type ExerciseType = 'bicep_curl' | 'squat' | 'push_up';

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
}

export class ExerciseEvaluator {
  private exerciseType: ExerciseType;
  private repCount = 0;
  private stage = 'ready';
  private peakReached = false;
  private minAngleInRep = 180;

  constructor(exerciseType: ExerciseType) {
    this.exerciseType = exerciseType;
    this.reset();
  }

  reset() {
    this.repCount = 0;
    this.stage = 'ready';
    this.peakReached = false;
    this.minAngleInRep = 180;
  }

  setExercise(type: ExerciseType) {
    this.exerciseType = type;
    this.reset();
  }

  evaluateFrame(landmarks: Landmark[]): FormEvaluation {
    switch (this.exerciseType) {
      case 'bicep_curl':
        return this.evaluateBicepCurl(landmarks);
      case 'squat':
        return this.evaluateSquat(landmarks);
      case 'push_up':
        return this.evaluatePushUp(landmarks);
    }
  }

  private evaluateBicepCurl(landmarks: Landmark[]): FormEvaluation {
    // Prefer right side or left side based on visibility
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];

    const useRight = (rightElbow?.visibility ?? 1) >= (leftElbow?.visibility ?? 0);
    const shoulder = useRight ? rightShoulder : leftShoulder;
    const elbow = useRight ? rightElbow : leftElbow;
    const wrist = useRight ? rightWrist : leftWrist;
    const hip = useRight ? rightHip : leftHip;

    if (!shoulder || !elbow || !wrist) {
      return this.defaultEvaluation(this.stage, 0, 0, 'Detecting pose...');
    }

    // Elbow flexion angle: Shoulder - Elbow - Wrist
    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    // Torso angle: Shoulder - Hip - Vertical
    const torsoAngle = hip ? calculateAngle({ x: hip.x, y: hip.y - 0.5 }, hip, shoulder) : 90;

    let isCompleted = false;
    let feedback = 'Stand tall with elbows pinned to sides.';

    // Track min angle (peak contraction)
    if (elbowAngle < this.minAngleInRep) {
      this.minAngleInRep = elbowAngle;
    }

    if (this.stage === 'ready' || this.stage === 'extended') {
      if (elbowAngle > 145) {
        this.stage = 'extended';
        feedback = 'Ready to curl. Pull upward smoothly.';
      } else if (elbowAngle <= 140) {
        this.stage = 'flexing';
        feedback = 'Curling up... Squeeze at the top!';
      }
    } else if (this.stage === 'flexing') {
      if (elbowAngle <= 45) {
        this.stage = 'peak';
        this.peakReached = true;
        feedback = 'Peak contraction reached! Excellent!';
      } else {
        feedback = 'Curl higher for full range of motion.';
      }
    } else if (this.stage === 'peak') {
      if (elbowAngle > 60) {
        this.stage = 'extending';
        feedback = 'Control the negative on the way down.';
      }
    } else if (this.stage === 'extending') {
      if (elbowAngle >= 145) {
        if (this.peakReached) {
          this.repCount++;
          isCompleted = true;
          feedback = 'Rep completed! Full extension.';
        }
        this.stage = 'extended';
        this.peakReached = false;
        this.minAngleInRep = 180;
      } else {
        feedback = 'Lower all the way to complete the rep.';
      }
    }

    // Sub-scores
    const depthScore = Math.min(Math.max(Math.round(((160 - this.minAngleInRep) / 115) * 100), 70), 100);
    const stabilityScore = torsoAngle >= 80 && torsoAngle <= 100 ? 95 : 75;
    const alignmentScore = 90;
    const overallForm = Math.round((depthScore + stabilityScore + alignmentScore) / 3);

    return {
      exerciseType: 'bicep_curl',
      repCount: this.repCount,
      stage: this.stage,
      primaryAngle: elbowAngle,
      secondaryAngle: torsoAngle,
      feedback,
      formScore: overallForm,
      subScores: {
        depth: depthScore,
        alignment: alignmentScore,
        stability: stabilityScore,
      },
      isRepCompletedThisFrame: isCompleted,
    };
  }

  private evaluateSquat(landmarks: Landmark[]): FormEvaluation {
    const hip = landmarks[POSE_LANDMARKS.RIGHT_HIP] || landmarks[POSE_LANDMARKS.LEFT_HIP];
    const knee = landmarks[POSE_LANDMARKS.RIGHT_KNEE] || landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const ankle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE] || landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const shoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER] || landmarks[POSE_LANDMARKS.LEFT_SHOULDER];

    if (!hip || !knee || !ankle) {
      return this.defaultEvaluation(this.stage, 0, 0, 'Detecting lower body...');
    }

    // Knee angle: Hip - Knee - Ankle (180 = standing straight, <= 90 = parallel squat)
    const kneeAngle = calculateAngle(hip, knee, ankle);
    // Torso angle: Shoulder - Hip - Knee
    const hipAngle = shoulder ? calculateAngle(shoulder, hip, knee) : 90;

    let isCompleted = false;
    let feedback = 'Stand upright with feet shoulder-width apart.';

    if (kneeAngle < this.minAngleInRep) {
      this.minAngleInRep = kneeAngle;
    }

    if (this.stage === 'ready' || this.stage === 'standing') {
      if (kneeAngle >= 165) {
        this.stage = 'standing';
        feedback = 'Standing tall. Begin descent with hip hinge.';
      } else if (kneeAngle < 155) {
        this.stage = 'descending';
        feedback = 'Descending... Keep knees tracking outwards.';
      }
    } else if (this.stage === 'descending') {
      if (kneeAngle <= 90) {
        this.stage = 'bottom';
        this.peakReached = true;
        feedback = 'Parallel depth reached! Drive through heels!';
      } else {
        feedback = 'Squat deeper - get thighs parallel to floor.';
      }
    } else if (this.stage === 'bottom') {
      if (kneeAngle > 105) {
        this.stage = 'ascending';
        feedback = 'Push up through mid-foot and squeeze glutes.';
      }
    } else if (this.stage === 'ascending') {
      if (kneeAngle >= 160) {
        if (this.peakReached) {
          this.repCount++;
          isCompleted = true;
          feedback = 'Rep finished! Full hip extension.';
        }
        this.stage = 'standing';
        this.peakReached = false;
        this.minAngleInRep = 180;
      } else {
        feedback = 'Lockout standing tall at the top.';
      }
    }

    // Sub-scores
    const depthScore = this.minAngleInRep <= 90 ? 98 : this.minAngleInRep <= 105 ? 82 : 65;
    const stabilityScore = hipAngle >= 60 ? 92 : 72;
    const alignmentScore = 90;
    const overallForm = Math.round((depthScore + stabilityScore + alignmentScore) / 3);

    return {
      exerciseType: 'squat',
      repCount: this.repCount,
      stage: this.stage,
      primaryAngle: kneeAngle,
      secondaryAngle: hipAngle,
      feedback,
      formScore: overallForm,
      subScores: {
        depth: depthScore,
        alignment: alignmentScore,
        stability: stabilityScore,
      },
      isRepCompletedThisFrame: isCompleted,
    };
  }

  private evaluatePushUp(landmarks: Landmark[]): FormEvaluation {
    const shoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER] || landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const elbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW] || landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const wrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST] || landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const hip = landmarks[POSE_LANDMARKS.RIGHT_HIP] || landmarks[POSE_LANDMARKS.LEFT_HIP];
    const ankle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE] || landmarks[POSE_LANDMARKS.LEFT_ANKLE];

    if (!shoulder || !elbow || !wrist) {
      return this.defaultEvaluation(this.stage, 0, 0, 'Detecting plank position...');
    }

    // Elbow angle: Shoulder - Elbow - Wrist
    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    // Spine alignment: Shoulder - Hip - Ankle (170-180 is straight plank)
    const spineAngle = hip && ankle ? calculateAngle(shoulder, hip, ankle) : 175;

    let isCompleted = false;
    let feedback = 'Hold solid plank, brace core and glutes.';

    if (elbowAngle < this.minAngleInRep) {
      this.minAngleInRep = elbowAngle;
    }

    if (this.stage === 'ready' || this.stage === 'top') {
      if (elbowAngle >= 155) {
        this.stage = 'top';
        feedback = 'Top plank lockout. Lower chest smoothly.';
      } else if (elbowAngle < 145) {
        this.stage = 'descending';
        feedback = 'Descending... Keep elbows at 45 degrees.';
      }
    } else if (this.stage === 'descending') {
      if (elbowAngle <= 90) {
        this.stage = 'bottom';
        this.peakReached = true;
        feedback = 'Chest to deck depth! Press upward!';
      } else {
        feedback = 'Lower chest closer to the floor.';
      }
    } else if (this.stage === 'bottom') {
      if (elbowAngle > 105) {
        this.stage = 'ascending';
        feedback = 'Pressing up... keep body rigid like a plank.';
      }
    } else if (this.stage === 'ascending') {
      if (elbowAngle >= 155) {
        if (this.peakReached) {
          this.repCount++;
          isCompleted = true;
          feedback = 'Rep counted! Solid lockout.';
        }
        this.stage = 'top';
        this.peakReached = false;
        this.minAngleInRep = 180;
      }
    }

    // Spine check
    if (spineAngle < 160) {
      feedback = 'Warning: Hips sagging! Engage abs and glutes.';
    }

    const depthScore = this.minAngleInRep <= 90 ? 96 : 75;
    const stabilityScore = spineAngle >= 165 && spineAngle <= 180 ? 94 : 68;
    const alignmentScore = 88;
    const overallForm = Math.round((depthScore + stabilityScore + alignmentScore) / 3);

    return {
      exerciseType: 'push_up',
      repCount: this.repCount,
      stage: this.stage,
      primaryAngle: elbowAngle,
      secondaryAngle: spineAngle,
      feedback,
      formScore: overallForm,
      subScores: {
        depth: depthScore,
        alignment: alignmentScore,
        stability: stabilityScore,
      },
      isRepCompletedThisFrame: isCompleted,
    };
  }

  private defaultEvaluation(
    stage: string,
    primaryAngle: number,
    secondaryAngle: number,
    feedback: string
  ): FormEvaluation {
    return {
      exerciseType: this.exerciseType,
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
