package com.typingiq.dto;

public class CharErrorDto {

    private String targetChar;
    private String typedChar;
    private Integer occurrenceCount;

    public CharErrorDto() {
    }

    public CharErrorDto(String targetChar, String typedChar, Integer occurrenceCount) {
        this.targetChar = targetChar;
        this.typedChar = typedChar;
        this.occurrenceCount = occurrenceCount;
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

    public Integer getOccurrenceCount() {
        return occurrenceCount;
    }

    public void setOccurrenceCount(Integer occurrenceCount) {
        this.occurrenceCount = occurrenceCount;
    }
}
