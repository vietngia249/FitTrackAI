export interface WeightEntry {
  id?: string;
  loggedDate: string | Date;
  weightKg: number;
  notes?: string | null;
}

export interface WeightHistoryPoint {
  id?: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  movingAverageKg: number;
  notes?: string | null;
}

/**
 * Calculates a 7-day simple moving average (SMA-7) for body weight.
 * Body weight fluctuates daily due to water retention, sodium, and glycogen.
 * The 7-day moving average smooths these fluctuations to reveal true tissue trend.
 */
export function calculateSevenDayMovingAverage(
  entries: WeightEntry[]
): WeightHistoryPoint[] {
  if (!entries || entries.length === 0) {
    return [];
  }

  // Sort chronologically ascending
  const sorted = [...entries].sort((a, b) => {
    return new Date(a.loggedDate).getTime() - new Date(b.loggedDate).getTime();
  });

  const points: WeightHistoryPoint[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const currentDate = new Date(current.loggedDate);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Find all entries within the last 7 calendar days up to and including this date
    // or take up to the last 7 data points
    const windowStart = new Date(currentDate);
    windowStart.setDate(windowStart.getDate() - 6); // 7-day window including today

    const windowEntries = sorted.slice(0, i + 1).filter((e) => {
      const entryDate = new Date(e.loggedDate);
      return entryDate >= windowStart && entryDate <= currentDate;
    });

    const sum = windowEntries.reduce((acc, e) => acc + e.weightKg, 0);
    const count = windowEntries.length > 0 ? windowEntries.length : 1;
    const movingAverageKg = Math.round((sum / count) * 100) / 100;

    points.push({
      id: current.id,
      date: dateStr,
      weightKg: Math.round(current.weightKg * 100) / 100,
      movingAverageKg,
      notes: current.notes,
    });
  }

  return points;
}
