from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

# Prediction Schemas
class ErrorPredictionRequest(BaseModel):
    user_id: Optional[Any] = None
    target_duration: int = Field(default=30, description="Test duration in seconds: 15, 30, or 60")
    difficulty: str = Field(default="MEDIUM", description="EASY, MEDIUM, or HARD")
    avg_wpm_last_5: float = Field(default=55.0, description="User's rolling average WPM")
    avg_acc_last_5: float = Field(default=95.0, description="User's rolling average accuracy")
    sessions_completed: int = Field(default=5, description="Total sessions user has completed")
    historical_backspace_rate: float = Field(default=0.08, description="Backspaces per keystroke")

class ModelBenchmarkMetrics(BaseModel):
    model_name: str
    mae: float
    rmse: float
    r2_score: float

class ErrorPredictionResponse(BaseModel):
    predicted_error_count: int
    predicted_accuracy: float
    risk_level: str  # "LOW", "MODERATE", "ELEVATED"
    risk_factors: List[str]
    confidence_score: float
    evaluation_benchmark: Optional[Dict[str, ModelBenchmarkMetrics]] = None
    baseline_comparison: Optional[str] = None

# Forecasting Schemas
class SessionHistoricalPoint(BaseModel):
    session_index: int
    wpm: float
    accuracy: float
    timestamp: Optional[str] = None

class ForecastRequest(BaseModel):
    user_id: Optional[Any] = None
    historical_sessions: List[SessionHistoricalPoint]
    forecast_horizon: int = Field(default=10, description="Number of future sessions to forecast (5-10)")

class ForecastPoint(BaseModel):
    session_index: int
    projected_wpm: float
    lower_bound_wpm: float
    upper_bound_wpm: float

class ForecastResponse(BaseModel):
    insufficient_data: bool = False
    message: Optional[str] = None
    trend_type: str = "STEADY_PROGRESS"  # "RAPID_GROWTH", "STEADY_PROGRESS", "PLATEAU", "EARLY_STAGE", "INSUFFICIENT_DATA"
    growth_rate_per_10_tests: float = 0.0
    estimated_ceiling_wpm: float = 0.0
    forecast_points: List[ForecastPoint] = []
    model_r2_score: float = 0.0
    confidence_interval_level: str = "95% Empirical Prediction Interval"
    disclaimer: str = "Projections are mathematical trend extrapolations, not guaranteed outcomes."

# Clustering Schemas
class TypistFeatures(BaseModel):
    user_id: Any
    avg_wpm: float
    avg_accuracy: float
    error_rate: float
    backspace_rate: float
    session_count: int

class ClusterRequest(BaseModel):
    user_features: TypistFeatures
    all_users_summary: Optional[List[TypistFeatures]] = None

class ClusterResponse(BaseModel):
    insufficient_data: bool = False
    message: Optional[str] = None
    cluster_id: int = -1
    persona_title: str = "Unassigned"
    persona_tagline: str = ""
    strengths: List[str] = []
    growth_areas: List[str] = []
    speed_percentile: float = 0.0
    accuracy_percentile: float = 0.0

# Recommendation Schemas
class KeyConfusionStat(BaseModel):
    target_char: str
    typed_char: str
    count: int

class RecommendationRequest(BaseModel):
    user_id: Optional[Any] = None
    avg_wpm: float
    avg_accuracy: float
    recent_difficulty: str
    key_errors: List[KeyConfusionStat] = []
    weakest_keys: List[str] = []
    frequent_mistyped_bigrams: List[str] = []

class TargetedExerciseSuggestion(BaseModel):
    title: str
    target_keys: List[str]
    difficulty: str
    recommended_duration: int
    focus_objective: str
    rationale: str
    target_weakness: str

class RecommendationResponse(BaseModel):
    headline: str
    priority_keys_to_drill: List[str]
    pacing_advice: str
    recommended_test_duration: int
    recommended_difficulty: str
    generation_method: str = "RULE_BASED_ERROR_MATRIX"  # "RULE_BASED_ERROR_MATRIX" or "ML_CLUSTERING_INFERENCE"
    suggested_exercises: List[TargetedExerciseSuggestion]
