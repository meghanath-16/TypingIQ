from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import (
    ErrorPredictionRequest, ErrorPredictionResponse,
    ForecastRequest, ForecastResponse,
    ClusterRequest, ClusterResponse,
    RecommendationRequest, RecommendationResponse
)
from app.ml.error_predictor import error_predictor_instance
from app.ml.forecaster import forecaster_instance
from app.ml.clusterer import clusterer_instance
from app.ml.recommender import recommender_instance

app = FastAPI(
    title="TypingIQ AI/ML Intelligence Service",
    description="Internal machine learning service for typing analytics, forecasting, and clustering",
    version="1.0.0"
)

# Only accessible within internal loopback / backend network
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "UP", "service": "TypingIQ-ML-Engine"}

@app.post("/internal/v1/ml/predict-errors", response_model=ErrorPredictionResponse)
@app.post("/predict-errors", response_model=ErrorPredictionResponse)
def predict_errors(req: ErrorPredictionRequest):
    return error_predictor_instance.predict(req)

@app.post("/internal/v1/ml/forecast-wpm", response_model=ForecastResponse)
@app.post("/forecast-wpm", response_model=ForecastResponse)
def forecast_wpm(req: ForecastRequest):
    return forecaster_instance.forecast(req)

@app.post("/internal/v1/ml/cluster-profile", response_model=ClusterResponse)
@app.post("/cluster-profile", response_model=ClusterResponse)
def cluster_profile(req: ClusterRequest):
    return clusterer_instance.analyze(req)

@app.post("/internal/v1/ml/recommend", response_model=RecommendationResponse)
@app.post("/recommend", response_model=RecommendationResponse)
def recommend(req: RecommendationRequest):
    return recommender_instance.recommend(req)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
