import { CopilotRecommendationsResponse } from './copilotTypes';

const API_BASE = '/api/v1/gemini';
const REC_CACHE_KEY = 'fittrack_gemini_recommendations';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('fittrack_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const FALLBACK_RECOMMENDATIONS: CopilotRecommendationsResponse = {
  overloadTips: [
    {
      exerciseId: 'barbell-bench-press',
      exerciseName: 'Barbell Bench Press',
      currentWeightKg: 85.0,
      recommendedWeightKg: 87.5,
      increaseKg: 2.5,
      reason: 'Completed 3 sets of 8 reps at RPE 7.5 last session with solid bar velocity.',
    },
    {
      exerciseId: 'barbell-squat',
      exerciseName: 'Barbell Back Squat',
      currentWeightKg: 110.0,
      recommendedWeightKg: 115.0,
      increaseKg: 5.0,
      reason: 'Completed all 4 target sets with parallel depth and smooth cadence.',
    },
    {
      exerciseId: 'overhead-press',
      exerciseName: 'Standing Overhead Press',
      currentWeightKg: 52.5,
      recommendedWeightKg: 55.0,
      increaseKg: 2.5,
      reason: 'Hit top of rep target range (10 reps) on final working set.',
    },
  ],
  deload: {
    needed: false,
    reason: 'Current 4-week training block is progressing smoothly with fatigue in optimal range.',
    recommendedVolumeReductionPercent: 40,
  },
  recoveryScore: 88,
  dailyBudgetRemaining: 15,
};

export async function fetchCopilotRecommendations(): Promise<CopilotRecommendationsResponse> {
  try {
    const res = await fetch(`${API_BASE}/recommendations`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.overloadTips) {
        localStorage.setItem(REC_CACHE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // Network or server offline, fall through to cache/fallback
  }

  try {
    const cached = localStorage.getItem(REC_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore cache error
  }

  return FALLBACK_RECOMMENDATIONS;
}

export async function sendCopilotChat(
  message: string
): Promise<{ reply: string; budgetRemaining: number }> {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      return await res.json();
    }

    let errorDetail = `Mã lỗi ${res.status}`;
    try {
      const err = await res.json();
      errorDetail = err.message || err.error || errorDetail;
    } catch {
      // Body not JSON
    }

    return {
      reply: `⚠️ Không thể nhận phản hồi từ AI Coach (${errorDetail}). Vui lòng kiểm tra lại cấu hình hoặc thử lại sau.`,
      budgetRemaining: 0,
    };
  } catch (err: any) {
    return {
      reply: `⚠️ Lỗi kết nối mạng tới máy chủ AI Coach: ${err?.message || 'Network request failed'}.`,
      budgetRemaining: 0,
    };
  }
}
