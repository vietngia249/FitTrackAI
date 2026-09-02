import {
  WeightHistoryResponse,
  BodyMeasurement,
  ProgressPhoto,
  LogWeightPayload,
  LogMeasurementPayload,
  LogPhotoPayload,
  PhotoType,
} from './bodyTypes';

const API_BASE = '/api/v1/body';
const WEIGHT_CACHE_KEY = 'fittrack_body_weight_logs';
const MEASURE_CACHE_KEY = 'fittrack_body_measurements';
const PHOTOS_CACHE_KEY = 'fittrack_progress_photos';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('fittrack_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const SAMPLE_WEIGHT_HISTORY: WeightHistoryResponse = {
  points: [
    { date: '2026-08-25', weightKg: 78.8, movingAverageKg: 78.8 },
    { date: '2026-08-27', weightKg: 78.4, movingAverageKg: 78.6 },
    { date: '2026-08-29', weightKg: 78.1, movingAverageKg: 78.43 },
    { date: '2026-08-31', weightKg: 77.9, movingAverageKg: 78.3 },
    { date: '2026-09-02', weightKg: 77.5, movingAverageKg: 78.14 },
    { date: '2026-09-04', weightKg: 77.8, movingAverageKg: 77.92 },
    { date: '2026-09-06', weightKg: 77.2, movingAverageKg: 77.68 },
    { date: '2026-09-08', weightKg: 77.0, movingAverageKg: 77.49 },
    { date: '2026-09-10', weightKg: 76.8, movingAverageKg: 77.26 },
    { date: '2026-09-12', weightKg: 76.5, movingAverageKg: 77.03 },
    { date: '2026-09-14', weightKg: 76.2, movingAverageKg: 76.8 },
    { date: '2026-09-15', weightKg: 76.0, movingAverageKg: 76.58 },
  ],
  stats: {
    currentWeightKg: 76.0,
    currentSevenDayAvgKg: 76.58,
    totalChangeKg: -2.8,
    totalEntries: 12,
  },
};

export const SAMPLE_MEASUREMENTS: BodyMeasurement[] = [
  {
    id: 'sm-1',
    loggedDate: '2026-09-15',
    chestCm: 104.5,
    waistCm: 81.0,
    bicepsRightCm: 38.5,
    thighRightCm: 60.2,
    hipsCm: 98.0,
    neckCm: 39.0,
    calvesCm: 37.5,
    notes: 'Morning tape measurement',
  },
  {
    id: 'sm-2',
    loggedDate: '2026-08-15',
    chestCm: 103.0,
    waistCm: 83.0,
    bicepsRightCm: 37.7,
    thighRightCm: 59.0,
    hipsCm: 99.5,
    neckCm: 39.2,
    calvesCm: 37.2,
    notes: 'Baseline check',
  },
];

export async function fetchWeightHistoryApi(): Promise<WeightHistoryResponse> {
  try {
    const res = await fetch(`${API_BASE}/weight`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.points && data.points.length > 0) {
        localStorage.setItem(WEIGHT_CACHE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // Fallback
  }

  try {
    const cached = localStorage.getItem(WEIGHT_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // Ignore
  }

  return SAMPLE_WEIGHT_HISTORY;
}

export async function logWeightApi(payload: LogWeightPayload): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/weight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  return {
    id: `local-weight-${Date.now()}`,
    ...payload,
  };
}

export async function fetchMeasurementsApi(): Promise<BodyMeasurement[]> {
  try {
    const res = await fetch(`${API_BASE}/measurements`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        localStorage.setItem(MEASURE_CACHE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // Fallback
  }

  try {
    const cached = localStorage.getItem(MEASURE_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // Ignore
  }

  return SAMPLE_MEASUREMENTS;
}

export async function logMeasurementApi(payload: LogMeasurementPayload): Promise<BodyMeasurement> {
  try {
    const res = await fetch(`${API_BASE}/measurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  const created: BodyMeasurement = {
    id: `local-measure-${Date.now()}`,
    ...payload,
  };

  const local = await fetchMeasurementsApi();
  local.unshift(created);
  localStorage.setItem(MEASURE_CACHE_KEY, JSON.stringify(local));
  return created;
}

export async function fetchPhotosApi(photoType?: PhotoType): Promise<ProgressPhoto[]> {
  try {
    const url = photoType ? `${API_BASE}/photos?photoType=${photoType}` : `${API_BASE}/photos`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  try {
    const cached = localStorage.getItem(PHOTOS_CACHE_KEY);
    if (cached) {
      const all: ProgressPhoto[] = JSON.parse(cached);
      return photoType ? all.filter((p) => p.photoType === photoType) : all;
    }
  } catch {
    // Ignore
  }

  return [];
}

export async function logPhotoApi(payload: LogPhotoPayload): Promise<ProgressPhoto> {
  try {
    const res = await fetch(`${API_BASE}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  const created: ProgressPhoto = {
    id: `photo-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };

  try {
    const cached = localStorage.getItem(PHOTOS_CACHE_KEY);
    const photos: ProgressPhoto[] = cached ? JSON.parse(cached) : [];
    photos.unshift(created);
    localStorage.setItem(PHOTOS_CACHE_KEY, JSON.stringify(photos));
  } catch {
    // Ignore
  }

  return created;
}
