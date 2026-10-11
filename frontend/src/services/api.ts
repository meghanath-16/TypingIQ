import {
  AuthResponse,
  DashboardStats,
  ErrorPredictionResult,
  Exercise,
  ExerciseAttemptResult,
  HistoryTrend,
  KeyboardHeatmapData,
  PerformanceForecastResult,
  ClusterPersonaResult,
  RecommendationsResult,
  SessionSubmitPayload,
  TypingSession,
  User,
} from '../types';

const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
const API_BASE = rawBase ? (rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`) : '/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('typingiq_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('typingiq_token');
      localStorage.removeItem('typingiq_user');
      window.dispatchEvent(new Event('auth-change'));
      throw new Error('Session expired or unauthorized');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  auth = {
    login: (body: { usernameOrEmail: string; password: string }) =>
      this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    register: (body: { username: string; email: string; password: string }) =>
      this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getMe: () => this.request<User>('/auth/me'),
  };

  // Typing Sessions
  sessions = {
    submit: (payload: SessionSubmitPayload) =>
      this.request<TypingSession>('/sessions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getAll: (page = 0, size = 15) =>
      this.request<{ content: TypingSession[]; totalPages: number; totalElements: number }>(
        `/sessions?page=${page}&size=${size}`
      ),
    getById: (id: string | number) => this.request<TypingSession>(`/sessions/${id}`),
  };

  // Analytics
  analytics = {
    getDashboard: () => this.request<DashboardStats>('/analytics/dashboard'),
    getHistory: () => this.request<HistoryTrend>('/analytics/history'),
    getHeatmap: () => this.request<KeyboardHeatmapData>('/analytics/keyboard-heatmap'),
  };

  // Practice Exercises
  exercises = {
    getAll: () => this.request<Exercise[]>('/exercises'),
    generateTargeted: () =>
      this.request<Exercise>('/exercises/generate-targeted', {
        method: 'POST',
      }),
    submitAttempt: (exerciseId: string | number, body: { achievedWpm: number; achievedAccuracy: number }) =>
      this.request<ExerciseAttemptResult>(`/exercises/${exerciseId}/attempt`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getProgress: () => this.request<ExerciseAttemptResult[]>('/exercises/progress'),
  };

  // AI & ML Intelligence
  ai = {
    getErrorPrediction: (duration = 30, difficulty = 'MEDIUM') =>
      this.request<ErrorPredictionResult>(
        `/ai/error-prediction?duration=${duration}&difficulty=${difficulty}`
      ),
    getForecast: (horizon = 10) =>
      this.request<PerformanceForecastResult>(`/ai/forecast?horizon=${horizon}`),
    getClustering: () => this.request<ClusterPersonaResult>('/ai/clustering'),
    getRecommendations: () => this.request<RecommendationsResult>('/ai/recommendations'),
  };
}

export const api = new ApiClient();
