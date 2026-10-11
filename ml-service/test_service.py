from app.main import app
from app.schemas import ErrorPredictionRequest, ForecastRequest, SessionHistoricalPoint, ClusterRequest, TypistFeatures, RecommendationRequest
from app.ml.error_predictor import error_predictor_instance
from app.ml.forecaster import forecaster_instance
from app.ml.clusterer import clusterer_instance
from app.ml.recommender import recommender_instance

print("Testing Error Predictor...")
p_res = error_predictor_instance.predict(ErrorPredictionRequest(target_duration=30, difficulty="MEDIUM", avg_wpm_last_5=65.0, avg_acc_last_5=96.0))
print("Prediction Result:", p_res.model_dump())

print("Testing Forecaster...")
f_res = forecaster_instance.forecast(ForecastRequest(
    historical_sessions=[
        SessionHistoricalPoint(session_index=1, wpm=45.0, accuracy=94.0),
        SessionHistoricalPoint(session_index=2, wpm=52.0, accuracy=95.0),
        SessionHistoricalPoint(session_index=3, wpm=58.0, accuracy=96.0)
    ]
))
print("Forecast Result:", f_res.model_dump()["trend_type"], "Ceiling:", f_res.model_dump()["estimated_ceiling_wpm"])

print("Testing Clusterer...")
c_res = clusterer_instance.analyze(ClusterRequest(
    user_features=TypistFeatures(user_id=1, avg_wpm=72.0, avg_accuracy=97.0, error_rate=3.0, backspace_rate=0.06, session_count=10)
))
print("Cluster Result:", c_res.model_dump()["persona_title"])

print("Testing Recommender...")
r_res = recommender_instance.recommend(RecommendationRequest(avg_wpm=60.0, avg_accuracy=94.0, recent_difficulty="MEDIUM", weakest_keys=["R", "T"]))
print("Recommender Result:", r_res.model_dump()["headline"])

print("ALL ML TESTS PASSED PERFECTLY!")
