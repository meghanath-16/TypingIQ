package com.typingiq.dto;

public class BigramErrorDto {

    private String targetBigram;
    private String typedBigram;
    private Integer occurrenceCount;

    public BigramErrorDto() {
    }

    public BigramErrorDto(String targetBigram, String typedBigram, Integer occurrenceCount) {
        this.targetBigram = targetBigram;
        this.typedBigram = typedBigram;
        this.occurrenceCount = occurrenceCount;
    }

    public String getTargetBigram() {
        return targetBigram;
    }

    public void setTargetBigram(String targetBigram) {
        this.targetBigram = targetBigram;
    }

    public String getTypedBigram() {
        return typedBigram;
    }

    public void setTypedBigram(String typedBigram) {
        this.typedBigram = typedBigram;
    }

    public Integer getOccurrenceCount() {
        return occurrenceCount;
    }

    public void setOccurrenceCount(Integer occurrenceCount) {
        this.occurrenceCount = occurrenceCount;
    }
}
