package com.typingiq.dto;

public class ExerciseProgressRequest {

    private Double achievedWpm;
    private Double achievedAccuracy;

    public ExerciseProgressRequest() {
    }

    public ExerciseProgressRequest(Double achievedWpm, Double achievedAccuracy) {
        this.achievedWpm = achievedWpm;
        this.achievedAccuracy = achievedAccuracy;
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
}
