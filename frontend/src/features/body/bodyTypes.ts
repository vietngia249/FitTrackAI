export interface WeightHistoryPoint {
  id?: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  movingAverageKg: number;
  notes?: string | null;
}

export interface WeightStats {
  currentWeightKg: number;
  currentSevenDayAvgKg: number;
  totalChangeKg: number;
  totalEntries: number;
}

export interface WeightHistoryResponse {
  points: WeightHistoryPoint[];
  stats: WeightStats;
}

export interface BodyMeasurement {
  id: string;
  loggedDate: string;
  neckCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  bicepsLeftCm?: number | null;
  bicepsRightCm?: number | null;
  thighLeftCm?: number | null;
  thighRightCm?: number | null;
  calvesCm?: number | null;
  notes?: string | null;
  createdAt?: string;
}

export type PhotoType = 'front' | 'side' | 'back';

export interface ProgressPhoto {
  id: string;
  photoType: PhotoType;
  loggedDate: string;
  storageKey?: string;
  photoUrl?: string;
  notes?: string | null;
  createdAt?: string;
}

export interface LogWeightPayload {
  weightKg: number;
  loggedDate: string;
  notes?: string | null;
}

export interface LogMeasurementPayload {
  loggedDate: string;
  neckCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  bicepsLeftCm?: number | null;
  bicepsRightCm?: number | null;
  thighLeftCm?: number | null;
  thighRightCm?: number | null;
  calvesCm?: number | null;
  notes?: string | null;
}

export interface LogPhotoPayload {
  photoType: PhotoType;
  loggedDate: string;
  storageKey?: string;
  photoUrl?: string;
  notes?: string | null;
}
