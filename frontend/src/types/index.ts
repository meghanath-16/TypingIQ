// Frontend TypeScript interfaces matching Spring Boot DTOs

export interface User {
  id: string | number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface SecondTelemetry {
  secondMarker: number;
  instantWpm: number;
  instantAccuracy: number;
  cumulativeErrors: number;
}

export interface CharError {
  targetChar: string;
  typedChar: string;
  occurrenceCount: number;
}

export interface BigramError {
  targetBigram: string;
  typedBigram: string;
  occurrenceCount: number;
}

export interface TypingSession {
  id: string | number;
  durationSeconds: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  grossWpm: number;
  netWpm: number;
  accuracyPercentage: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errorCount: number;
  backspaceCount: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  correctionRate: number;
  avgInterKeyIntervalMs: number;
  avgPauseDurationMs: number;
  errorRecoveryTimeMs: number;
  completedAt: string;
  telemetry: SecondTelemetry[];
  charErrors: CharError[];
  bigramErrors: BigramError[];
  keyStats?: KeyMetric[];
}

export interface SessionSubmitPayload {
  durationSeconds: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  grossWpm: number;
  netWpm: number;
  accuracyPercentage: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errorCount: number;
  backspaceCount: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  correctionRate: number;
  avgInterKeyIntervalMs: number;
  avgPauseDurationMs: number;
  errorRecoveryTimeMs: number;
  telemetry: SecondTelemetry[];
  charErrors: CharError[];
  bigramErrors: BigramError[];
  keyStats?: KeyMetric[];
}

export interface DashboardStats {
  totalSessions: number;
  bestWpm: number;
  avgWpm: number;
  avgGrossWpm: number;
  avgAccuracy: number;
  totalKeystrokes: number;
  totalCorrectKeystrokes: number;
  totalErrorKeystrokes: number;
  avgCorrectionRate: number;
  avgInterKeyIntervalMs: number;
  avgPauseDurationMs: number;
  avgErrorRecoveryTimeMs: number;
  currentStreakDays: number;
  recentSessions: TypingSession[];
}

export interface HistoryPoint {
  sessionIndex: number;
  sessionId: string | number;
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  difficulty: string;
  durationSeconds: number;
  completedAt: string;
}

export interface HistoryTrend {
  points: HistoryPoint[];
}

export interface KeyMetric {
  keyChar: string;
  totalPresses: number;
  errorPresses: number;
  errorRate: number;
}

export interface KeyboardHeatmapData {
  keys: KeyMetric[];
  mostFrequentErrorKeys: string[];
  overallKeyAccuracy: number;
}

export interface Exercise {
  id: string | number;
  title: string;
  targetKeys: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  contentText: string;
  targetAccuracy: number;
  targetWpm: number;
  userPassed: boolean;
}

export interface ExerciseAttemptResult {
  id: string | number;
  exerciseId: string | number;
  exerciseTitle: string;
  achievedWpm: number;
  achievedAccuracy: number;
  passed: boolean;
  completedAt: string;
}

// AI / ML Intelligence Interfaces
export interface ModelBenchmarkMetrics {
  model_name: string;
  mae: number;
  rmse: number;
  r2_score: number;
}

export interface ErrorPredictionResult {
  predicted_error_count: number;
  predicted_accuracy: number;
  risk_level: 'LOW' | 'MODERATE' | 'ELEVATED';
  risk_factors: string[];
  confidence_score: number;
  evaluation_benchmark?: Record<string, ModelBenchmarkMetrics>;
  baseline_comparison?: string;
}

export interface ForecastPoint {
  session_index: number;
  projected_wpm: number;
  lower_bound_wpm: number;
  upper_bound_wpm: number;
}

export interface PerformanceForecastResult {
  insufficient_data?: boolean;
  message?: string;
  trend_type: 'RAPID_GROWTH' | 'STEADY_PROGRESS' | 'PLATEAU' | 'EARLY_STAGE' | 'INSUFFICIENT_DATA';
  growth_rate_per_10_tests: number;
  estimated_ceiling_wpm: number;
  forecast_points: ForecastPoint[];
  model_r2_score: number;
  confidence_interval_level?: string;
  disclaimer?: string;
}

export interface ClusterPersonaResult {
  insufficient_data?: boolean;
  message?: string;
  cluster_id: number;
  persona_title: string;
  persona_tagline: string;
  strengths: string[];
  growth_areas: string[];
  speed_percentile: number;
  accuracy_percentile: number;
}

export interface ExerciseSuggestion {
  title: string;
  target_keys: string[];
  difficulty: string;
  recommended_duration: number;
  focus_objective: string;
  rationale: string;
  target_weakness: string;
}

export interface RecommendationsResult {
  headline: string;
  priority_keys_to_drill: string[];
  pacing_advice: string;
  recommended_test_duration: number;
  recommended_difficulty: string;
  generation_method?: string;
  recommendation_type?: string;
  rationale?: string;
  weakness_targeted?: string;
  suggested_exercises: ExerciseSuggestion[];
}
