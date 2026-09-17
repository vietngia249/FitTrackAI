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

export class ExerciseEvaluator {
  private exerciseType: ExerciseType;
  private repCount = 0;
  private stage = 'ready';
  private peakReached = false;
  private minAngleInRep = 180;
  private repStartTime = performance.now();
  private repHistory: RepDetail[] = [];

  constructor(exerciseType: ExerciseType) {
    this.exerciseType = exerciseType;
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
    this.exerciseType = type;
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
      return this.defaultEvaluation(this.stage, 0, 0, 'Detecting arm joints...');
    }

    // Elbow flexion angle: Shoulder - Elbow - Wrist
    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    // Torso angle: Shoulder - Hip - Vertical
    const torsoAngle = hip ? calculateAngle({ x: hip.x, y: hip.y - 0.5 }, hip, shoulder) : 90;

    let isCompleted = false;
    let feedback = 'Stand tall with elbows pinned to sides.';
    let activeFault: string | undefined;

    if (elbowAngle < this.minAngleInRep) {
      this.minAngleInRep = elbowAngle;
    }

    if (this.stage === 'ready' || this.stage === 'extended') {
      if (elbowAngle > 145) {
        this.stage = 'extended';
        feedback = 'Ready to curl. Pull upward smoothly.';
      } else if (elbowAngle <= 140) {
        this.stage = 'flexing';
        feedback = 'Curling up... Squeeze biceps at peak!';
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
        feedback = 'Control the descent on the way down.';
      }
    } else if (this.stage === 'extending') {
      if (elbowAngle >= 145) {
        if (this.peakReached) {
          this.repCount++;
          isCompleted = true;
          feedback = 'Rep completed! Full extension.';

          const depthScore = Math.min(
            Math.max(Math.round(((160 - this.minAngleInRep) / 115) * 100), 70),
            100
          );
          const stabilityScore = torsoAngle >= 80 && torsoAngle <= 100 ? 95 : 75;
          const alignmentScore = 90;
          const overallForm = Math.round((depthScore + stabilityScore + alignmentScore) / 3);

          if (this.minAngleInRep > 55) {
            activeFault = 'Chưa co hết biên độ đỉnh';
          } else if (torsoAngle < 80 || torsoAngle > 100) {
            activeFault = 'Đung đưa thân người khi cuốn tạ';
          }

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
        this.stage = 'extended';
        this.peakReached = false;
        this.minAngleInRep = 180;
      } else {
        feedback = 'Lower all the way to finish rep.';
      }
    }

    const depthScore = Math.min(
      Math.max(Math.round(((160 - this.minAngleInRep) / 115) * 100), 70),
      100
    );
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
      activeFault,
    };
  }

  private evaluateSquat(landmarks: Landmark[]): FormEvaluation {
    const hip = landmarks[POSE_LANDMARKS.RIGHT_HIP] || landmarks[POSE_LANDMARKS.LEFT_HIP];
    const knee = landmarks[POSE_LANDMARKS.RIGHT_KNEE] || landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const ankle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE] || landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const shoulder =
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER] || landmarks[POSE_LANDMARKS.LEFT_SHOULDER];

    if (!hip || !knee || !ankle) {
      return this.defaultEvaluation(this.stage, 0, 0, 'Detecting lower body...');
    }

    // Knee angle: Hip - Knee - Ankle (180 = standing straight, <= 90 = parallel squat)
    const kneeAngle = calculateAngle(hip, knee, ankle);
    // Torso angle: Shoulder - Hip - Knee
    const hipAngle = shoulder ? calculateAngle(shoulder, hip, knee) : 90;

    let isCompleted = false;
    let feedback = 'Stand upright with feet shoulder-width apart.';
    let activeFault: string | undefined;

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
        feedback = 'Squat deeper - thighs parallel to floor.';
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

          const depthScore =
            this.minAngleInRep <= 90 ? 98 : this.minAngleInRep <= 105 ? 82 : 65;
          const stabilityScore = hipAngle >= 60 ? 92 : 72;
          const alignmentScore = 90;
          const overallForm = Math.round((depthScore + stabilityScore + alignmentScore) / 3);

          if (this.minAngleInRep > 95) {
            activeFault = 'Chưa xuống đủ độ sâu song song';
          } else if (hipAngle < 55) {
            activeFault = 'Thân người gập quá mức về trước';
          }

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
        this.stage = 'standing';
        this.peakReached = false;
        this.minAngleInRep = 180;
      } else {
        feedback = 'Lockout standing tall at the top.';
      }
    }

    const depthScore =
      this.minAngleInRep <= 90 ? 98 : this.minAngleInRep <= 105 ? 82 : 65;
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
      activeFault,
    };
  }

  private evaluatePushUp(landmarks: Landmark[]): FormEvaluation {
    const shoulder =
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER] || landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
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
    let activeFault: string | undefined;

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

          const depthScore = this.minAngleInRep <= 90 ? 96 : 75;
          const stabilityScore = spineAngle >= 165 && spineAngle <= 180 ? 94 : 68;
          const alignmentScore = 88;
          const overallForm = Math.round((depthScore + stabilityScore + alignmentScore) / 3);

          if (this.minAngleInRep > 95) {
            activeFault = 'Hạ ngực chưa đủ thấp';
          } else if (spineAngle < 160) {
            activeFault = 'Võng lưng / hông chùng';
          }

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
        this.stage = 'top';
        this.peakReached = false;
        this.minAngleInRep = 180;
      }
    }

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
      activeFault,
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
