package com.typingiq.dto;

import com.typingiq.entity.PracticeExercise;

public class ExerciseDto {

    private String id;
    private String title;
    private String targetKeys;
    private String difficulty;
    private String contentText;
    private Integer targetAccuracy;
    private Integer targetWpm;
    private Boolean userPassed;

    public ExerciseDto() {
    }

    public static ExerciseDto fromEntity(PracticeExercise exercise, Boolean userPassed) {
        if (exercise == null) return null;
        ExerciseDto dto = new ExerciseDto();
        dto.setId(exercise.getId());
        dto.setTitle(exercise.getTitle());
        dto.setTargetKeys(exercise.getTargetKeys());
        dto.setDifficulty(exercise.getDifficulty());
        dto.setContentText(exercise.getContentText());
        dto.setTargetAccuracy(exercise.getTargetAccuracy());
        dto.setTargetWpm(exercise.getTargetWpm());
        dto.setUserPassed(userPassed != null ? userPassed : false);
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTargetKeys() {
        return targetKeys;
    }

    public void setTargetKeys(String targetKeys) {
        this.targetKeys = targetKeys;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getContentText() {
        return contentText;
    }

    public void setContentText(String contentText) {
        this.contentText = contentText;
    }

    public Integer getTargetAccuracy() {
        return targetAccuracy;
    }

    public void setTargetAccuracy(Integer targetAccuracy) {
        this.targetAccuracy = targetAccuracy;
    }

    public Integer getTargetWpm() {
        return targetWpm;
    }

    public void setTargetWpm(Integer targetWpm) {
        this.targetWpm = targetWpm;
    }

    public Boolean getUserPassed() {
        return userPassed;
    }

    public void setUserPassed(Boolean userPassed) {
        this.userPassed = userPassed;
    }
}
