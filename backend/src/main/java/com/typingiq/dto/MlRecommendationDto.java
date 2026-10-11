package com.typingiq.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MlRecommendationDto {

    public static class KeyConfusion {
        @JsonProperty("target_char")
        private String targetChar;

        @JsonProperty("typed_char")
        private String typedChar;

        private Integer count;

        public KeyConfusion() {
        }

        public KeyConfusion(String targetChar, String typedChar, Integer count) {
            this.targetChar = targetChar;
            this.typedChar = typedChar;
            this.count = count;
        }

        public String getTargetChar() {
            return targetChar;
        }

        public void setTargetChar(String targetChar) {
            this.targetChar = targetChar;
        }

        public String getTypedChar() {
            return typedChar;
        }

        public void setTypedChar(String typedChar) {
            this.typedChar = typedChar;
        }

        public Integer getCount() {
            return count;
        }

        public void setCount(Integer count) {
            this.count = count;
        }
    }

    public static class Request {
        @JsonProperty("user_id")
        private String userId;

        @JsonProperty("avg_wpm")
        private Double avgWpm;

        @JsonProperty("avg_accuracy")
        private Double avgAccuracy;

        @JsonProperty("recent_difficulty")
        private String recentDifficulty;

        @JsonProperty("key_errors")
        private List<KeyConfusion> keyErrors;

        @JsonProperty("weakest_keys")
        private List<String> weakestKeys;

        public Request() {
        }

        public Request(String userId, Double avgWpm, Double avgAccuracy, String recentDifficulty, List<KeyConfusion> keyErrors, List<String> weakestKeys) {
            this.userId = userId;
            this.avgWpm = avgWpm;
            this.avgAccuracy = avgAccuracy;
            this.recentDifficulty = recentDifficulty;
            this.keyErrors = keyErrors;
            this.weakestKeys = weakestKeys;
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

        public String getRecentDifficulty() {
            return recentDifficulty;
        }

        public void setRecentDifficulty(String recentDifficulty) {
            this.recentDifficulty = recentDifficulty;
        }

        public List<KeyConfusion> getKeyErrors() {
            return keyErrors;
        }

        public void setKeyErrors(List<KeyConfusion> keyErrors) {
            this.keyErrors = keyErrors;
        }

        public List<String> getWeakestKeys() {
            return weakestKeys;
        }

        public void setWeakestKeys(List<String> weakestKeys) {
            this.weakestKeys = weakestKeys;
        }
    }

    public static class ExerciseSuggestion {
        private String title;

        @JsonProperty("target_keys")
        private List<String> targetKeys;

        private String difficulty;

        @JsonProperty("recommended_duration")
        private Integer recommendedDuration;

        @JsonProperty("focus_objective")
        private String focusObjective;

        public ExerciseSuggestion() {
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public List<String> getTargetKeys() {
            return targetKeys;
        }

        public void setTargetKeys(List<String> targetKeys) {
            this.targetKeys = targetKeys;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }

        public Integer getRecommendedDuration() {
            return recommendedDuration;
        }

        public void setRecommendedDuration(Integer recommendedDuration) {
            this.recommendedDuration = recommendedDuration;
        }

        public String getFocusObjective() {
            return focusObjective;
        }

        public void setFocusObjective(String focusObjective) {
            this.focusObjective = focusObjective;
        }
    }

    public static class Response {
        private String headline;

        @JsonProperty("priority_keys_to_drill")
        private List<String> priorityKeysToDrill;

        @JsonProperty("pacing_advice")
        private String pacingAdvice;

        @JsonProperty("recommended_test_duration")
        private Integer recommendedTestDuration;

        @JsonProperty("recommended_difficulty")
        private String recommendedDifficulty;

        @JsonProperty("suggested_exercises")
        private List<ExerciseSuggestion> suggestedExercises;

        public Response() {
        }

        public String getHeadline() {
            return headline;
        }

        public void setHeadline(String headline) {
            this.headline = headline;
        }

        public List<String> getPriorityKeysToDrill() {
            return priorityKeysToDrill;
        }

        public void setPriorityKeysToDrill(List<String> priorityKeysToDrill) {
            this.priorityKeysToDrill = priorityKeysToDrill;
        }

        public String getPacingAdvice() {
            return pacingAdvice;
        }

        public void setPacingAdvice(String pacingAdvice) {
            this.pacingAdvice = pacingAdvice;
        }

        public Integer getRecommendedTestDuration() {
            return recommendedTestDuration;
        }

        public void setRecommendedTestDuration(Integer recommendedTestDuration) {
            this.recommendedTestDuration = recommendedTestDuration;
        }

        public String getRecommendedDifficulty() {
            return recommendedDifficulty;
        }

        public void setRecommendedDifficulty(String recommendedDifficulty) {
            this.recommendedDifficulty = recommendedDifficulty;
        }

        public List<ExerciseSuggestion> getSuggestedExercises() {
            return suggestedExercises;
        }

        public void setSuggestedExercises(List<ExerciseSuggestion> suggestedExercises) {
            this.suggestedExercises = suggestedExercises;
        }
    }
}
