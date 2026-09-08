import { calculateWeeklyDigest } from './jobs/weeklyDigestJob.js';
import { evaluateDeloadNeed } from './jobs/deloadDetectorJob.js';

export class BackgroundWorker {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalMs: number = 30000) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[Worker] Started background processing loop (interval: ${intervalMs}ms)`);

    // Run first batch immediately
    this.processPendingTasks();

    this.timer = setInterval(() => {
      this.processPendingTasks();
    }, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[Worker] Stopped background processing loop');
  }

  /**
   * Dispatches periodic analysis tasks: weekly digests, deload detection.
   */
  async processPendingTasks() {
    const timestamp = new Date().toISOString();
    console.log(`[Worker][${timestamp}] Executing scheduled health & analysis tasks...`);

    try {
      // Mock / Sample processing pipeline
      const sampleSessions = [
        { completed: true, totalVolumeKg: 4200, rpeAvg: 7.5, date: '2026-09-11' },
        { completed: true, totalVolumeKg: 3800, rpeAvg: 8.0, date: '2026-09-13' },
        { completed: true, totalVolumeKg: 4500, rpeAvg: 7.8, date: '2026-09-15' },
      ];

      const digest = calculateWeeklyDigest('user-sample-1', sampleSessions, 4);
      console.log(`[Worker] Weekly digest computed: Volume=${digest.totalVolumeKg}kg, Adherence=${digest.adherenceRate}%`);

      const deload = evaluateDeloadNeed('user-sample-1', [10000, 11500, 12800, 14200], [7.5, 8.0, 7.8]);
      if (deload.deloadNeeded) {
        console.log(`[Worker] ⚠️ Deload recommendation flagged for ${deload.userId}: ${deload.reason}`);
      } else {
        console.log(`[Worker] ✅ User training fatigue optimal.`);
      }
    } catch (err) {
      console.error('[Worker] Error executing background task:', err);
    }
  }
}
