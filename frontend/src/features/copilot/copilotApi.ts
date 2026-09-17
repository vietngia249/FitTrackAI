import { CopilotRecommendationsResponse } from './copilotTypes';

const API_BASE = '/api/v1/gemini';
const REC_CACHE_KEY = 'fittrack_gemini_recommendations';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('fittrack_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const EMPTY_RECOMMENDATIONS: CopilotRecommendationsResponse = {
  overloadTips: [],
  deload: {
    needed: false,
    reason: '',
    recommendedVolumeReductionPercent: 0,
  },
  recoveryScore: 100,
  dailyBudgetRemaining: 15,
};

export const FALLBACK_RECOMMENDATIONS: CopilotRecommendationsResponse = EMPTY_RECOMMENDATIONS;

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
