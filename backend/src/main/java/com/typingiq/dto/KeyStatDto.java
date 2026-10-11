package com.typingiq.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class KeyStatDto {
    private String keyChar;

    @JsonProperty("totalAttempts")
    @JsonAlias({"totalPresses", "total"})
    private Long totalAttempts;

    @JsonProperty("errorAttempts")
    @JsonAlias({"errorPresses", "errors"})
    private Long errorAttempts;

    public KeyStatDto() {
    }

    public KeyStatDto(String keyChar, Long totalAttempts, Long errorAttempts) {
        this.keyChar = keyChar;
        this.totalAttempts = totalAttempts;
        this.errorAttempts = errorAttempts;
    }

    public String getKeyChar() {
        return keyChar;
    }

    public void setKeyChar(String keyChar) {
        this.keyChar = keyChar;
    }

    public Long getTotalAttempts() {
        return totalAttempts != null ? totalAttempts : 0L;
    }

    public void setTotalAttempts(Long totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public Long getTotalPresses() {
        return getTotalAttempts();
    }

    public void setTotalPresses(Long totalPresses) {
        this.totalAttempts = totalPresses;
    }

    public Long getErrorAttempts() {
        return errorAttempts != null ? errorAttempts : 0L;
    }

    public void setErrorAttempts(Long errorAttempts) {
        this.errorAttempts = errorAttempts;
    }

    public Long getErrorPresses() {
        return getErrorAttempts();
    }

    public void setErrorPresses(Long errorPresses) {
        this.errorAttempts = errorPresses;
    }
}
