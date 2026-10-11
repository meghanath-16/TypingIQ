package com.typingiq.dto;

import java.time.LocalDateTime;

public class ExerciseProgressResponse {

    private String id;
    private String exerciseId;
    private String exerciseTitle;
    private Double achievedWpm;
    private Double achievedAccuracy;
    private Boolean passed;
    private LocalDateTime completedAt;

    public ExerciseProgressResponse() {
    }

    public ExerciseProgressResponse(String id, String exerciseId, String exerciseTitle, Double achievedWpm, Double achievedAccuracy, Boolean passed, LocalDateTime completedAt) {
        this.id = id;
        this.exerciseId = exerciseId;
        this.exerciseTitle = exerciseTitle;
        this.achievedWpm = achievedWpm;
        this.achievedAccuracy = achievedAccuracy;
        this.passed = passed;
        this.completedAt = completedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(String exerciseId) {
        this.exerciseId = exerciseId;
    }

    public String getExerciseTitle() {
        return exerciseTitle;
    }

    public void setExerciseTitle(String exerciseTitle) {
        this.exerciseTitle = exerciseTitle;
    }

    public Double getAchievedWpm() {
        return achievedWpm;
    }

    public void setAchievedWpm(Double achievedWpm) {
        this.achievedWpm = achievedWpm;
    }

    public Double getAchievedAccuracy() {
        return achievedAccuracy;
    }

    public void setAchievedAccuracy(Double achievedAccuracy) {
        this.achievedAccuracy = achievedAccuracy;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
