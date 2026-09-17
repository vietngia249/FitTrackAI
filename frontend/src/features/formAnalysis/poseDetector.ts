import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { Landmark } from './poseGeometry';

let poseLandmarkerInstance: PoseLandmarker | null = null;
let initPromise: Promise<PoseLandmarker | null> | null = null;

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/**
 * Initializes and caches the MediaPipe PoseLandmarker singleton.
 * Uses GPU delegate if supported, with automatic CPU fallback.
 */
export async function getPoseLandmarker(): Promise<PoseLandmarker | null> {
  if (poseLandmarkerInstance) return poseLandmarkerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);

      // Attempt GPU acceleration first
      try {
        poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        return poseLandmarkerInstance;
      } catch (gpuError) {
        console.warn('PoseLandmarker GPU delegate failed, falling back to CPU:', gpuError);
        // Fallback to CPU delegate
        poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        return poseLandmarkerInstance;
      }
    } catch (err) {
      console.error('Failed to initialize MediaPipe PoseLandmarker:', err);
      initPromise = null;
      return null;
    }
  })();

  return initPromise;
}

/**
 * Runs inference on a single frame from an HTMLVideoElement.
 * Returns 33 normalized landmarks (0 to 1 range), or null if no pose detected or video not ready.
 */
export function detectPoseFromVideo(
  landmarker: PoseLandmarker,
  videoElement: HTMLVideoElement,
  timestampMs: number
): Landmark[] | null {
  if (!videoElement || videoElement.readyState < 2) {
    // Video must have current data (HAVE_CURRENT_DATA)
    return null;
  }

  try {
    const result = landmarker.detectForVideo(videoElement, timestampMs);
    if (result.landmarks && result.landmarks.length > 0) {
      const rawLandmarks = result.landmarks[0];
      return rawLandmarks.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
      }));
    }
    return null;
  } catch (err) {
    // Timestamp must be monotonically increasing in VIDEO mode; catch any skipped frame exceptions
    return null;
  }
}
