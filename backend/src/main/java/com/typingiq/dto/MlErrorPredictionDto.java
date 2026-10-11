package com.typingiq.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MlErrorPredictionDto {

    public static class Request {
        @JsonProperty("user_id")
        private String userId;

        @JsonProperty("target_duration")
        private Integer targetDuration;

        private String difficulty;

        @JsonProperty("avg_wpm_last_5")
        private Double avgWpmLast5;

        @JsonProperty("avg_acc_last_5")
        private Double avgAccLast5;

        @JsonProperty("sessions_completed")
        private Integer sessionsCompleted;

        @JsonProperty("historical_backspace_rate")
        private Double historicalBackspaceRate;

        public Request() {
        }

        public Request(String userId, Integer targetDuration, String difficulty, Double avgWpmLast5, Double avgAccLast5, Integer sessionsCompleted, Double historicalBackspaceRate) {
            this.userId = userId;
            this.targetDuration = targetDuration;
            this.difficulty = difficulty;
            this.avgWpmLast5 = avgWpmLast5;
            this.avgAccLast5 = avgAccLast5;
            this.sessionsCompleted = sessionsCompleted;
            this.historicalBackspaceRate = historicalBackspaceRate;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public Integer getTargetDuration() {
            return targetDuration;
        }

        public void setTargetDuration(Integer targetDuration) {
            this.targetDuration = targetDuration;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }

        public Double getAvgWpmLast5() {
            return avgWpmLast5;
        }

        public void setAvgWpmLast5(Double avgWpmLast5) {
            this.avgWpmLast5 = avgWpmLast5;
        }

        public Double getAvgAccLast5() {
            return avgAccLast5;
        }

        public void setAvgAccLast5(Double avgAccLast5) {
            this.avgAccLast5 = avgAccLast5;
        }

        public Integer getSessionsCompleted() {
            return sessionsCompleted;
        }

        public void setSessionsCompleted(Integer sessionsCompleted) {
            this.sessionsCompleted = sessionsCompleted;
        }

        public Double getHistoricalBackspaceRate() {
            return historicalBackspaceRate;
        }

        public void setHistoricalBackspaceRate(Double historicalBackspaceRate) {
            this.historicalBackspaceRate = historicalBackspaceRate;
        }
    }

    public static class Response {
        @JsonProperty("predicted_error_count")
        private Integer predictedErrorCount;

        @JsonProperty("predicted_accuracy")
        private Double predictedAccuracy;

        @JsonProperty("risk_level")
        private String riskLevel;

        @JsonProperty("risk_factors")
        private List<String> riskFactors;

        @JsonProperty("confidence_score")
        private Double confidenceScore;

        public Response() {
        }

        public Integer getPredictedErrorCount() {
            return predictedErrorCount;
        }

        public void setPredictedErrorCount(Integer predictedErrorCount) {
            this.predictedErrorCount = predictedErrorCount;
        }

        public Double getPredictedAccuracy() {
            return predictedAccuracy;
        }

        public void setPredictedAccuracy(Double predictedAccuracy) {
            this.predictedAccuracy = predictedAccuracy;
        }

        public String getRiskLevel() {
            return riskLevel;
        }

        public void setRiskLevel(String riskLevel) {
            this.riskLevel = riskLevel;
        }

        public List<String> getRiskFactors() {
            return riskFactors;
        }

        public void setRiskFactors(List<String> riskFactors) {
            this.riskFactors = riskFactors;
        }

        public Double getConfidenceScore() {
            return confidenceScore;
        }

        public void setConfidenceScore(Double confidenceScore) {
            this.confidenceScore = confidenceScore;
        }
    }
}
