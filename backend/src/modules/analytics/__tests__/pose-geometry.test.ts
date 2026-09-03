import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

export interface Landmark2D {
  x: number;
  y: number;
}

export function calculateAngle(
  a: Landmark2D,
  b: Landmark2D,
  c: Landmark2D
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle * 10) / 10;
}

describe('AI Pose Angle Geometry & Kinematic Calculations', () => {
  it('calculates 90-degree right angle accurately', () => {
    // A=(0, 1), B=(0, 0), C=(1, 0) forms a 90-degree corner
    const a = { x: 0, y: 1 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };

    const angle = calculateAngle(a, b, c);
    assert.equal(angle, 90.0);
  });

  it('calculates 180-degree straight line accurately', () => {
    // Horizontal line: (-1, 0) -> (0, 0) -> (1, 0)
    const a = { x: -1, y: 0 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };

    const angle = calculateAngle(a, b, c);
    assert.equal(angle, 180.0);
  });

  it('calculates 45-degree acute angle accurately', () => {
    const a = { x: 1, y: 1 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };

    const angle = calculateAngle(a, b, c);
    assert.equal(angle, 45.0);
  });

  it('handles vertical straight body alignment (180 degrees)', () => {
    // Shoulder (0.5, 0.2) -> Hip (0.5, 0.5) -> Ankle (0.5, 0.9)
    const shoulder = { x: 0.5, y: 0.2 };
    const hip = { x: 0.5, y: 0.5 };
    const ankle = { x: 0.5, y: 0.9 };

    const angle = calculateAngle(shoulder, hip, ankle);
    assert.equal(angle, 180.0);
  });

  it('detects parallel squat depth when knee angle drops below 90 degrees', () => {
    // Knee is vertex at (0.5, 0.7)
    // Femur is parallel/below horizontal: Hip at (0.2, 0.72)
    // Tibia is vertical: Ankle at (0.5, 0.95)
    const hip = { x: 0.2, y: 0.72 };
    const knee = { x: 0.5, y: 0.7 };
    const ankle = { x: 0.5, y: 0.95 };

    const angle = calculateAngle(hip, knee, ankle);
    assert.ok(angle <= 90, `Expected parallel depth <= 90 deg, got ${angle}`);
  });
});
