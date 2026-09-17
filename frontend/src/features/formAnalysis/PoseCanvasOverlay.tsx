import React, { useEffect, useRef } from 'react';
import { Landmark, SKELETON_CONNECTIONS, POSE_LANDMARKS } from './poseGeometry';
import { FormEvaluation } from './exerciseStateMachines';

interface PoseCanvasOverlayProps {
  landmarks: Landmark[];
  evaluation: FormEvaluation;
  width: number;
  height: number;
  isMirrored?: boolean;
}

export const PoseCanvasOverlay: React.FC<PoseCanvasOverlayProps> = ({
  landmarks,
  evaluation,
  width,
  height,
  isMirrored = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Helper for coordinate conversion (handles mirror horizontally for front-facing webcam)
    const getX = (normalizedX: number) => (isMirrored ? (1 - normalizedX) * width : normalizedX * width);
    const getY = (normalizedY: number) => normalizedY * height;

    // Determine color theme based on stage
    let strokeColor = '#10b981'; // emerald
    let glowColor = 'rgba(16, 185, 129, 0.4)';

    if (evaluation.stage === 'bottom' || evaluation.stage === 'peak') {
      strokeColor = '#34d399'; // bright green peak
      glowColor = 'rgba(52, 211, 153, 0.7)';
    } else if (evaluation.stage.includes('descending') || evaluation.stage === 'flexing') {
      strokeColor = '#06b6d4'; // cyan
      glowColor = 'rgba(6, 182, 212, 0.5)';
    } else if (evaluation.stage.includes('extending') || evaluation.stage === 'ascending') {
      strokeColor = '#38bdf8'; // sky
      glowColor = 'rgba(56, 189, 248, 0.5)';
    }

    // Draw skeleton connections
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;

    for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];

      if (
        p1 &&
        p2 &&
        (p1.visibility === undefined || p1.visibility > 0.5) &&
        (p2.visibility === undefined || p2.visibility > 0.5)
      ) {
        ctx.beginPath();
        ctx.moveTo(getX(p1.x), getY(p1.y));
        ctx.lineTo(getX(p2.x), getY(p2.y));
        ctx.stroke();
      }
    }

    // Draw joint keypoints
    ctx.shadowBlur = 12;
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      if (!lm || (lm.visibility !== undefined && lm.visibility <= 0.5)) continue;

      const px = getX(lm.x);
      const py = getY(lm.y);

      // Outer glow circle
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      ctx.fillStyle = strokeColor;
      ctx.fill();
    }

    // Draw active angle badge directly on the active joint
    let targetLandmark: Landmark | undefined;
    if (evaluation.exerciseType === 'bicep_curl') {
      targetLandmark = landmarks[POSE_LANDMARKS.RIGHT_ELBOW] || landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    } else if (evaluation.exerciseType === 'squat') {
      targetLandmark = landmarks[POSE_LANDMARKS.RIGHT_KNEE] || landmarks[POSE_LANDMARKS.LEFT_KNEE];
    } else if (evaluation.exerciseType === 'push_up') {
      targetLandmark = landmarks[POSE_LANDMARKS.RIGHT_ELBOW] || landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    }

    if (targetLandmark && evaluation.primaryAngle > 0) {
      const bx = getX(targetLandmark.x);
      const by = getY(targetLandmark.y);

      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;

      const text = `${Math.round(evaluation.primaryAngle)}°`;
      ctx.font = 'bold 13px monospace';
      const textWidth = ctx.measureText(text).width;

      const boxX = bx + 12;
      const boxY = by - 16;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, textWidth + 14, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, boxX + 7, boxY + 15);
      ctx.restore();
    }
  }, [landmarks, evaluation, width, height, isMirrored]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-20 w-full h-full object-contain"
    />
  );
};
