package com.typingiq.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_exercise_progress")
public class UserExerciseProgress {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String exerciseId;

    private Double achievedWpm;
    private Double achievedAccuracy;
    private Boolean passed = false;

    private LocalDateTime completedAt = LocalDateTime.now();

    public UserExerciseProgress() {}

    public UserExerciseProgress(String userId, String exerciseId, Double achievedWpm, Double achievedAccuracy, Boolean passed) {
        this.userId = userId;
        this.exerciseId = exerciseId;
        this.achievedWpm = achievedWpm;
        this.achievedAccuracy = achievedAccuracy;
        this.passed = passed;
        this.completedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getExerciseId() { return exerciseId; }
    public void setExerciseId(String exerciseId) { this.exerciseId = exerciseId; }
    public Double getAchievedWpm() { return achievedWpm; }
    public void setAchievedWpm(Double achievedWpm) { this.achievedWpm = achievedWpm; }
    public Double getAchievedAccuracy() { return achievedAccuracy; }
    public void setAchievedAccuracy(Double achievedAccuracy) { this.achievedAccuracy = achievedAccuracy; }
    public Boolean getPassed() { return passed; }
    public void setPassed(Boolean passed) { this.passed = passed; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
