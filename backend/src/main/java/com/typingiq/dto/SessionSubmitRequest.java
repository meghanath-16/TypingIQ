package com.typingiq.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class SessionSubmitRequest {

    @NotNull(message = "durationSeconds is required")
    @Min(value = 5, message = "Duration must be at least 5 seconds")
    @Max(value = 300, message = "Duration cannot exceed 300 seconds")
    private Integer durationSeconds;

    @NotBlank(message = "difficulty is required")
    private String difficulty; // EASY, MEDIUM, HARD

    @NotNull(message = "grossWpm is required")
    @DecimalMin(value = "0.0", message = "grossWpm cannot be negative")
    private Double grossWpm;

    @NotNull(message = "netWpm is required")
    @DecimalMin(value = "0.0", message = "netWpm cannot be negative")
    private Double netWpm;

    @NotNull(message = "accuracyPercentage is required")
    @DecimalMin(value = "0.0", message = "accuracy cannot be negative")
    @DecimalMax(value = "100.0", message = "accuracy cannot exceed 100")
    private Double accuracyPercentage;

    @NotNull(message = "totalKeystrokes is required")
    @Min(value = 0, message = "totalKeystrokes cannot be negative")
    private Integer totalKeystrokes;

    @NotNull(message = "correctKeystrokes is required")
    @Min(value = 0, message = "correctKeystrokes cannot be negative")
    private Integer correctKeystrokes;

    @NotNull(message = "errorCount is required")
    @Min(value = 0, message = "errorCount cannot be negative")
    private Integer errorCount;

    @NotNull(message = "backspaceCount is required")
    @Min(value = 0, message = "backspaceCount cannot be negative")
    private Integer backspaceCount;

    // Advanced Metrics
    private Integer correctedErrors = 0;
    private Integer uncorrectedErrors = 0;
    private Double correctionRate = 100.0;
    private Double avgInterKeyIntervalMs = 0.0;
    private Double avgPauseDurationMs = 0.0;
    private Double errorRecoveryTimeMs = 0.0;

    private List<SecondTelemetryDto> telemetry;
    private List<CharErrorDto> charErrors;
    private List<BigramErrorDto> bigramErrors;
    private List<KeyStatDto> keyStats;

    public SessionSubmitRequest() {
    }

    public List<KeyStatDto> getKeyStats() {
        return keyStats;
    }

    public void setKeyStats(List<KeyStatDto> keyStats) {
        this.keyStats = keyStats;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Double getGrossWpm() {
        return grossWpm;
    }

    public void setGrossWpm(Double grossWpm) {
        this.grossWpm = grossWpm;
    }

    public Double getNetWpm() {
        return netWpm;
    }

    public void setNetWpm(Double netWpm) {
        this.netWpm = netWpm;
    }

    public Double getAccuracyPercentage() {
        return accuracyPercentage;
    }

    public void setAccuracyPercentage(Double accuracyPercentage) {
        this.accuracyPercentage = accuracyPercentage;
    }

    public Integer getTotalKeystrokes() {
        return totalKeystrokes;
    }

    public void setTotalKeystrokes(Integer totalKeystrokes) {
        this.totalKeystrokes = totalKeystrokes;
    }

    public Integer getCorrectKeystrokes() {
        return correctKeystrokes;
    }

    public void setCorrectKeystrokes(Integer correctKeystrokes) {
        this.correctKeystrokes = correctKeystrokes;
    }

    public Integer getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(Integer errorCount) {
        this.errorCount = errorCount;
    }

    public Integer getBackspaceCount() {
        return backspaceCount;
    }

    public void setBackspaceCount(Integer backspaceCount) {
        this.backspaceCount = backspaceCount;
    }

    public Integer getCorrectedErrors() {
        return correctedErrors;
    }

    public void setCorrectedErrors(Integer correctedErrors) {
        this.correctedErrors = correctedErrors;
    }

    public Integer getUncorrectedErrors() {
        return uncorrectedErrors;
    }

    public void setUncorrectedErrors(Integer uncorrectedErrors) {
        this.uncorrectedErrors = uncorrectedErrors;
    }

    public Double getCorrectionRate() {
        return correctionRate;
    }

    public void setCorrectionRate(Double correctionRate) {
        this.correctionRate = correctionRate;
    }

    public Double getAvgInterKeyIntervalMs() {
        return avgInterKeyIntervalMs;
    }

    public void setAvgInterKeyIntervalMs(Double avgInterKeyIntervalMs) {
        this.avgInterKeyIntervalMs = avgInterKeyIntervalMs;
    }

    public Double getAvgPauseDurationMs() {
        return avgPauseDurationMs;
    }

    public void setAvgPauseDurationMs(Double avgPauseDurationMs) {
        this.avgPauseDurationMs = avgPauseDurationMs;
    }

    public Double getErrorRecoveryTimeMs() {
        return errorRecoveryTimeMs;
    }

    public void setErrorRecoveryTimeMs(Double errorRecoveryTimeMs) {
        this.errorRecoveryTimeMs = errorRecoveryTimeMs;
    }

    public List<SecondTelemetryDto> getTelemetry() {
        return telemetry;
    }

    public void setTelemetry(List<SecondTelemetryDto> telemetry) {
        this.telemetry = telemetry;
    }

    public List<CharErrorDto> getCharErrors() {
        return charErrors;
    }

    public void setCharErrors(List<CharErrorDto> charErrors) {
        this.charErrors = charErrors;
    }

    public List<BigramErrorDto> getBigramErrors() {
        return bigramErrors;
    }

    public void setBigramErrors(List<BigramErrorDto> bigramErrors) {
        this.bigramErrors = bigramErrors;
    }
}
