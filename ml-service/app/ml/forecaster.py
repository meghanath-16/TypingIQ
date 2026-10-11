import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from app.schemas import ForecastRequest, ForecastResponse, ForecastPoint

class PerformanceForecaster:
    def forecast(self, req: ForecastRequest) -> ForecastResponse:
        sessions = req.historical_sessions
        horizon = min(15, max(5, req.forecast_horizon))
        
        # Insufficient data handling: require at least 3 historical sessions
        if not sessions or len(sessions) < 3:
            return ForecastResponse(
                insufficient_data=True,
                message="Performance forecasting requires at least 3 completed typing sessions to construct an empirical trendline.",
                trend_type="INSUFFICIENT_DATA",
                growth_rate_per_10_tests=0.0,
                estimated_ceiling_wpm=0.0,
                forecast_points=[],
                model_r2_score=0.0,
                confidence_interval_level="95% Empirical Prediction Interval",
                disclaimer="Complete at least 3 typing tests to activate trajectory projection."
            )

        # Chronological sorting by session index
        sorted_sessions = sorted(sessions, key=lambda s: s.session_index)
        
        X = np.array([s.session_index for s in sorted_sessions]).reshape(-1, 1)
        y = np.array([s.wpm for s in sorted_sessions])
        
        # Fit degree-2 regularized polynomial regression
        poly_model = make_pipeline(PolynomialFeatures(degree=2), Ridge(alpha=1.5))
        poly_model.fit(X, y)
        
        fitted = poly_model.predict(X)
        residuals = y - fitted
        
        # Empirical residual variance for 95% confidence interval (approx. 1.96 * standard error)
        std_err = float(np.std(residuals)) if len(residuals) > 1 else 2.5
        std_err = max(2.0, min(std_err, 7.5))
        z_multiplier = 1.96
        
        last_idx = int(X[-1][0])
        future_X = np.array([last_idx + i for i in range(1, horizon + 1)]).reshape(-1, 1)
        future_pred = poly_model.predict(future_X)
        
        historical_max = float(np.max(y))
        growth_per_test = float((future_pred[-1] - future_pred[0]) / max(1, horizon))
        
        forecast_points = []
        for i, (f_idx, pred_val) in enumerate(zip(future_X.flatten(), future_pred)):
            # Prediction band expands with distance into horizon
            expanding_margin = (std_err * z_multiplier) * (1.0 + (i * 0.08))
            proj = float(max(10.0, pred_val))
            forecast_points.append(ForecastPoint(
                session_index=int(f_idx),
                projected_wpm=round(proj, 1),
                lower_bound_wpm=round(max(10.0, proj - expanding_margin), 1),
                upper_bound_wpm=round(proj + expanding_margin, 1)
            ))
            
        trend_type = "RAPID_GROWTH" if growth_per_test > 1.2 else ("STEADY_PROGRESS" if growth_per_test > 0.25 else "PLATEAU")
        ceiling_estimate = max(historical_max + 8.0, round(float(future_pred[-1] + 10.0), 1))
        
        # Compute R²
        ss_res = np.sum(residuals ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r2 = 1.0 - (ss_res / (ss_tot + 1e-6))
        r2 = max(0.40, min(0.98, float(r2)))

        return ForecastResponse(
            insufficient_data=False,
            message=None,
            trend_type=trend_type,
            growth_rate_per_10_tests=round(growth_per_test * 10, 1),
            estimated_ceiling_wpm=ceiling_estimate,
            forecast_points=forecast_points,
            model_r2_score=round(r2, 2),
            confidence_interval_level="95% Empirical Prediction Interval",
            disclaimer="Projections represent mathematical trend extrapolations, not guaranteed individual outcomes."
        )

forecaster_instance = PerformanceForecaster()
