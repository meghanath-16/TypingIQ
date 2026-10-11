package com.typingiq.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MlForecastDto {

    public static class HistoricalPoint {
        @JsonProperty("session_index")
        private Integer sessionIndex;

        private Double wpm;
        private Double accuracy;
        private String timestamp;

        public HistoricalPoint() {
        }

        public HistoricalPoint(Integer sessionIndex, Double wpm, Double accuracy, String timestamp) {
            this.sessionIndex = sessionIndex;
            this.wpm = wpm;
            this.accuracy = accuracy;
            this.timestamp = timestamp;
        }

        public Integer getSessionIndex() {
            return sessionIndex;
        }

        public void setSessionIndex(Integer sessionIndex) {
            this.sessionIndex = sessionIndex;
        }

        public Double getWpm() {
            return wpm;
        }

        public void setWpm(Double wpm) {
            this.wpm = wpm;
        }

        public Double getAccuracy() {
            return accuracy;
        }

        public void setAccuracy(Double accuracy) {
            this.accuracy = accuracy;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }
    }

    public static class Request {
        @JsonProperty("user_id")
        private String userId;

        @JsonProperty("historical_sessions")
        private List<HistoricalPoint> historicalSessions;

        @JsonProperty("forecast_horizon")
        private Integer forecastHorizon = 10;

        public Request() {
        }

        public Request(String userId, List<HistoricalPoint> historicalSessions, Integer forecastHorizon) {
            this.userId = userId;
            this.historicalSessions = historicalSessions;
            this.forecastHorizon = forecastHorizon;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public List<HistoricalPoint> getHistoricalSessions() {
            return historicalSessions;
        }

        public void setHistoricalSessions(List<HistoricalPoint> historicalSessions) {
            this.historicalSessions = historicalSessions;
        }

        public Integer getForecastHorizon() {
            return forecastHorizon;
        }

        public void setForecastHorizon(Integer forecastHorizon) {
            this.forecastHorizon = forecastHorizon;
        }
    }

    public static class ProjectedPoint {
        @JsonProperty("session_index")
        private Integer sessionIndex;

        @JsonProperty("projected_wpm")
        private Double projectedWpm;

        @JsonProperty("lower_bound_wpm")
        private Double lowerBoundWpm;

        @JsonProperty("upper_bound_wpm")
        private Double upperBoundWpm;

        public ProjectedPoint() {
        }

        public Integer getSessionIndex() {
            return sessionIndex;
        }

        public void setSessionIndex(Integer sessionIndex) {
            this.sessionIndex = sessionIndex;
        }

        public Double getProjectedWpm() {
            return projectedWpm;
        }

        public void setProjectedWpm(Double projectedWpm) {
            this.projectedWpm = projectedWpm;
        }

        public Double getLowerBoundWpm() {
            return lowerBoundWpm;
        }

        public void setLowerBoundWpm(Double lowerBoundWpm) {
            this.lowerBoundWpm = lowerBoundWpm;
        }

        public Double getUpperBoundWpm() {
            return upperBoundWpm;
        }

        public void setUpperBoundWpm(Double upperBoundWpm) {
            this.upperBoundWpm = upperBoundWpm;
        }
    }

    public static class Response {
        @JsonProperty("trend_type")
        private String trendType;

        @JsonProperty("growth_rate_per_10_tests")
        private Double growthRatePer10Tests;

        @JsonProperty("estimated_ceiling_wpm")
        private Double estimatedCeilingWpm;

        @JsonProperty("forecast_points")
        private List<ProjectedPoint> forecastPoints;

        @JsonProperty("model_r2_score")
        private Double modelR2Score;

        public Response() {
        }

        public String getTrendType() {
            return trendType;
        }

        public void setTrendType(String trendType) {
            this.trendType = trendType;
        }

        public Double getGrowthRatePer10Tests() {
            return growthRatePer10Tests;
        }

        public void setGrowthRatePer10Tests(Double growthRatePer10Tests) {
            this.growthRatePer10Tests = growthRatePer10Tests;
        }

        public Double getEstimatedCeilingWpm() {
            return estimatedCeilingWpm;
        }

        public void setEstimatedCeilingWpm(Double estimatedCeilingWpm) {
            this.estimatedCeilingWpm = estimatedCeilingWpm;
        }

        public List<ProjectedPoint> getForecastPoints() {
            return forecastPoints;
        }

        public void setForecastPoints(List<ProjectedPoint> forecastPoints) {
            this.forecastPoints = forecastPoints;
        }

        public Double getModelR2Score() {
            return modelR2Score;
        }

        public void setModelR2Score(Double modelR2Score) {
            this.modelR2Score = modelR2Score;
        }
    }
}
