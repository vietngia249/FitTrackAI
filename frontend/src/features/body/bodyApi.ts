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

const EMPTY_WEIGHT_HISTORY: WeightHistoryResponse = {
  points: [],
  stats: {
    currentWeightKg: null,
    currentSevenDayAvgKg: null,
    totalChangeKg: 0,
    totalEntries: 0,
  },
};

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
      if (data && data.points) {
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

  return EMPTY_WEIGHT_HISTORY;
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

  // Update local cache so real user weigh-ins persist
  try {
    const cachedRaw = localStorage.getItem(WEIGHT_CACHE_KEY);
    const currentData: WeightHistoryResponse = cachedRaw
      ? JSON.parse(cachedRaw)
      : { ...EMPTY_WEIGHT_HISTORY };

    const newPoint = {
      date: payload.loggedDate,
      weightKg: payload.weightKg,
      movingAverageKg: payload.weightKg,
      notes: payload.notes,
    };

    const updatedPoints = [...currentData.points, newPoint].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const pointsWithAvg = updatedPoints.map((pt, _idx, arr) => {
      const ptDate = new Date(pt.date).getTime();
      const sevenDaysBefore = ptDate - 7 * 24 * 60 * 60 * 1000;
      const windowPts = arr.filter((p) => {
        const d = new Date(p.date).getTime();
        return d >= sevenDaysBefore && d <= ptDate;
      });
      const avg =
        windowPts.reduce((sum, p) => sum + p.weightKg, 0) / windowPts.length;
      return {
        ...pt,
        movingAverageKg: Math.round(avg * 100) / 100,
      };
    });

    const latest = pointsWithAvg[pointsWithAvg.length - 1];
    const first = pointsWithAvg[0];
    const totalChange =
      first && latest
        ? Math.round((latest.weightKg - first.weightKg) * 10) / 10
        : 0;

    const updatedData: WeightHistoryResponse = {
      points: pointsWithAvg,
      stats: {
        currentWeightKg: latest?.weightKg ?? null,
        currentSevenDayAvgKg: latest?.movingAverageKg ?? null,
        totalChangeKg: totalChange,
        totalEntries: pointsWithAvg.length,
      },
    };

    localStorage.setItem(WEIGHT_CACHE_KEY, JSON.stringify(updatedData));
  } catch {
    // Ignore cache error
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
      if (data && Array.isArray(data)) {
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

  return [];
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
