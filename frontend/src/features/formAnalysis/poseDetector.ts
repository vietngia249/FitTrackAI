import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { Landmark } from './poseGeometry';

let poseLandmarkerInstance: PoseLandmarker | null = null;
let initPromise: Promise<PoseLandmarker | null> | null = null;

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

// High-precision Full model (filters out domestic background objects 3x better than Lite)
const FULL_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';
const LITE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/**
 * Initializes and caches the MediaPipe PoseLandmarker singleton.
 * Uses the High-Precision Full model with GPU acceleration, falling back to Lite / CPU if needed.
 */
export async function getPoseLandmarker(): Promise<PoseLandmarker | null> {
  if (poseLandmarkerInstance) return poseLandmarkerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);

      // 1. Try High-Precision Full Model on GPU
      try {
        poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: FULL_MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.65, // Stricter threshold to avoid detecting chairs/clothes
          minPosePresenceConfidence: 0.65,
          minTrackingConfidence: 0.65,
        });
        return poseLandmarkerInstance;
      } catch (fullGpuErr) {
        console.warn('Full GPU model initialization failed, trying Lite GPU...', fullGpuErr);
      }

      // 2. Try Lite Model on GPU
      try {
        poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: LITE_MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.6,
          minPosePresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
        return poseLandmarkerInstance;
      } catch (liteGpuErr) {
        console.warn('Lite GPU model failed, falling back to CPU delegate...', liteGpuErr);
      }

      // 3. Final Fallback: Lite on CPU
      poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: LITE_MODEL_URL,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.55,
        minPosePresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });
      return poseLandmarkerInstance;
    } catch (err) {
      console.error('Failed to initialize MediaPipe PoseLandmarker:', err);
      initPromise = null;
      return null;
    }
  })();

  return initPromise;
}

/**
 * Anatomical Sanity Filter:
 * Verifies that the detected landmarks correspond to a genuine human body,
 * eliminating false-positive skeletons hallucinated on chairs, wall shadows, or clothes racks.
 */
export function isValidHumanPose(landmarks: Landmark[]): boolean {
  if (!landmarks || landmarks.length < 33) return false;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return false;
  }

  // 1. Core Keypoint Visibility Check:
  // Shoulders and hips are essential for human torso structure.
  const lsVis = leftShoulder.visibility ?? 1;
  const rsVis = rightShoulder.visibility ?? 1;
  const lhVis = leftHip.visibility ?? 1;
  const rhVis = rightHip.visibility ?? 1;

  // At least one shoulder must be clearly visible and at least one hip
  if ((lsVis < 0.55 && rsVis < 0.55) || (lhVis < 0.45 && rhVis < 0.45)) {
    return false;
  }

  // 2. Anatomical Orientation Check:
  // Shoulders must be vertically higher than hips (in normalized coordinates, 0 is top, 1 is bottom)
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const avgHipY = (leftHip.y + rightHip.y) / 2;
  if (avgShoulderY > avgHipY + 0.1) {
    return false; // Inverted or scrambled geometry
  }

  // 3. Human Scale & Bounding Box Check:
  let minX = 1;
  let maxX = 0;
  let minY = 1;
  let maxY = 0;
  let visibleCount = 0;

  for (const lm of landmarks) {
    const vis = lm.visibility ?? 1;
    if (vis > 0.4) {
      visibleCount++;
      if (lm.x < minX) minX = lm.x;
      if (lm.x > maxX) maxX = lm.x;
      if (lm.y < minY) minY = lm.y;
      if (lm.y > maxY) maxY = lm.y;
    }
  }

  // Must have at least 12 reasonably visible landmarks
  if (visibleCount < 12) return false;

  const bboxWidth = maxX - minX;
  const bboxHeight = maxY - minY;

  // A genuine user in camera frame will occupy a non-trivial area
  if (bboxWidth < 0.08 || bboxHeight < 0.16) {
    return false;
  }

  return true;
}

/**
 * Exponential Moving Average (EMA) Pose Smoother:
 * Blends consecutive frame landmark positions to eliminate high-frequency jitter.
 */
export class PoseSmoother {
  private prevLandmarks: Landmark[] | null = null;
  private alpha: number;

  constructor(alpha = 0.65) {
    this.alpha = alpha; // 0.65 balances responsiveness with smooth fluidity
  }

  smooth(landmarks: Landmark[]): Landmark[] {
    if (!this.prevLandmarks || this.prevLandmarks.length !== landmarks.length) {
      this.prevLandmarks = landmarks;
      return landmarks;
    }

    const smoothed: Landmark[] = landmarks.map((curr, i) => {
      const prev = this.prevLandmarks![i];
      return {
        x: this.alpha * curr.x + (1 - this.alpha) * prev.x,
        y: this.alpha * curr.y + (1 - this.alpha) * prev.y,
        z:
          curr.z !== undefined && prev.z !== undefined
            ? this.alpha * curr.z + (1 - this.alpha) * prev.z
            : curr.z,
        visibility: curr.visibility,
      };
    });

    this.prevLandmarks = smoothed;
    return smoothed;
  }

  reset() {
    this.prevLandmarks = null;
  }
}

/**
 * Runs inference on a single frame from an HTMLVideoElement.
 * Returns smoothed 33 normalized landmarks, or null if no valid human pose detected.
 */
export function detectPoseFromVideo(
  landmarker: PoseLandmarker,
  videoElement: HTMLVideoElement,
  timestampMs: number,
  smoother?: PoseSmoother
): Landmark[] | null {
  if (!videoElement || videoElement.readyState < 2) {
    return null;
  }

  try {
    const result = landmarker.detectForVideo(videoElement, timestampMs);
    if (result.landmarks && result.landmarks.length > 0) {
      const rawLandmarks = result.landmarks[0].map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
      }));

      // Reject non-human or object false positives
      if (!isValidHumanPose(rawLandmarks)) {
        return null;
      }

      // Smooth jitter if smoother provided
      if (smoother) {
        return smoother.smooth(rawLandmarks);
      }

      return rawLandmarks;
    }
    return null;
  } catch {
    return null;
  }
}
