package com.typingiq.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MlClusterDto {

    public static class TypistFeatures {
        @JsonProperty("user_id")
        private String userId;

        @JsonProperty("avg_wpm")
        private Double avgWpm;

        @JsonProperty("avg_accuracy")
        private Double avgAccuracy;

        @JsonProperty("error_rate")
        private Double errorRate;

        @JsonProperty("backspace_rate")
        private Double backspaceRate;

        @JsonProperty("session_count")
        private Integer sessionCount;

        public TypistFeatures() {
        }

        public TypistFeatures(String userId, Double avgWpm, Double avgAccuracy, Double errorRate, Double backspaceRate, Integer sessionCount) {
            this.userId = userId;
            this.avgWpm = avgWpm;
            this.avgAccuracy = avgAccuracy;
            this.errorRate = errorRate;
            this.backspaceRate = backspaceRate;
            this.sessionCount = sessionCount;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public Double getAvgWpm() {
            return avgWpm;
        }

        public void setAvgWpm(Double avgWpm) {
            this.avgWpm = avgWpm;
        }

        public Double getAvgAccuracy() {
            return avgAccuracy;
        }

        public void setAvgAccuracy(Double avgAccuracy) {
            this.avgAccuracy = avgAccuracy;
        }

        public Double getErrorRate() {
            return errorRate;
        }

        public void setErrorRate(Double errorRate) {
            this.errorRate = errorRate;
        }

        public Double getBackspaceRate() {
            return backspaceRate;
        }

        public void setBackspaceRate(Double backspaceRate) {
            this.backspaceRate = backspaceRate;
        }

        public Integer getSessionCount() {
            return sessionCount;
        }

        public void setSessionCount(Integer sessionCount) {
            this.sessionCount = sessionCount;
        }
    }

    public static class Request {
        @JsonProperty("user_features")
        private TypistFeatures userFeatures;

        public Request() {
        }

        public Request(TypistFeatures userFeatures) {
            this.userFeatures = userFeatures;
        }

        public TypistFeatures getUserFeatures() {
            return userFeatures;
        }

        public void setUserFeatures(TypistFeatures userFeatures) {
            this.userFeatures = userFeatures;
        }
    }

    public static class Response {
        @JsonProperty("cluster_id")
        private Integer clusterId;

        @JsonProperty("persona_title")
        private String personaTitle;

        @JsonProperty("persona_tagline")
        private String personaTagline;

        private List<String> strengths;

        @JsonProperty("growth_areas")
        private List<String> growthAreas;

        @JsonProperty("speed_percentile")
        private Double speedPercentile;

        @JsonProperty("accuracy_percentile")
        private Double accuracyPercentile;

        public Response() {
        }

        public Integer getClusterId() {
            return clusterId;
        }

        public void setClusterId(Integer clusterId) {
            this.clusterId = clusterId;
        }

        public String getPersonaTitle() {
            return personaTitle;
        }

        public void setPersonaTitle(String personaTitle) {
            this.personaTitle = personaTitle;
        }

        public String getPersonaTagline() {
            return personaTagline;
        }

        public void setPersonaTagline(String personaTagline) {
            this.personaTagline = personaTagline;
        }

        public List<String> getStrengths() {
            return strengths;
        }

        public void setStrengths(List<String> strengths) {
            this.strengths = strengths;
        }

        public List<String> getGrowthAreas() {
            return growthAreas;
        }

        public void setGrowthAreas(List<String> growthAreas) {
            this.growthAreas = growthAreas;
        }

        public Double getSpeedPercentile() {
            return speedPercentile;
        }

        public void setSpeedPercentile(Double speedPercentile) {
            this.speedPercentile = speedPercentile;
        }

        public Double getAccuracyPercentile() {
            return accuracyPercentile;
        }

        public void setAccuracyPercentile(Double accuracyPercentile) {
            this.accuracyPercentile = accuracyPercentile;
        }
    }
}
