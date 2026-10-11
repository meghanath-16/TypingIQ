package com.typingiq.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "practice_exercises")
public class PracticeExercise {

    @Id
    private String id;

    private String title;
    private String targetKeys;
    private String difficulty;
    private String contentText;

    private Integer targetAccuracy;
    private Integer targetWpm;

    private LocalDateTime createdAt = LocalDateTime.now();

    public PracticeExercise() {}

    public PracticeExercise(String title, String targetKeys, String difficulty, String contentText, Integer targetAccuracy, Integer targetWpm) {
        this.title = title;
        this.targetKeys = targetKeys;
        this.difficulty = difficulty;
        this.contentText = contentText;
        this.targetAccuracy = targetAccuracy;
        this.targetWpm = targetWpm;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTargetKeys() { return targetKeys; }
    public void setTargetKeys(String targetKeys) { this.targetKeys = targetKeys; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getContentText() { return contentText; }
    public void setContentText(String contentText) { this.contentText = contentText; }
    public Integer getTargetAccuracy() { return targetAccuracy; }
    public void setTargetAccuracy(Integer targetAccuracy) { this.targetAccuracy = targetAccuracy; }
    public Integer getTargetWpm() { return targetWpm; }
    public void setTargetWpm(Integer targetWpm) { this.targetWpm = targetWpm; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
