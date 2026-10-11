package com.typingiq.dto;

import com.typingiq.entity.TypingSession;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class TypingSessionResponse {

    private String id;
    private Integer durationSeconds;
    private String difficulty;
    private Double grossWpm;
    private Double netWpm;
    private Double accuracyPercentage;
    private Integer totalKeystrokes;
    private Integer correctKeystrokes;
    private Integer errorCount;
    private Integer backspaceCount;

    // Advanced Metrics
    private Integer correctedErrors;
    private Integer uncorrectedErrors;
    private Double correctionRate;
    private Double avgInterKeyIntervalMs;
    private Double avgPauseDurationMs;
    private Double errorRecoveryTimeMs;

    private LocalDateTime completedAt;
    private List<SecondTelemetryDto> telemetry = new ArrayList<>();
    private List<CharErrorDto> charErrors = new ArrayList<>();
    private List<BigramErrorDto> bigramErrors = new ArrayList<>();

    public TypingSessionResponse() {
    }

    public static TypingSessionResponse fromEntity(TypingSession session) {
        if (session == null) return null;
        TypingSessionResponse res = new TypingSessionResponse();
        res.setId(session.getId());
        res.setDurationSeconds(session.getDurationSeconds());
        res.setDifficulty(session.getDifficulty());
        res.setGrossWpm(session.getGrossWpm());
        res.setNetWpm(session.getNetWpm());
        res.setAccuracyPercentage(session.getAccuracyPercentage());
        res.setTotalKeystrokes(session.getTotalKeystrokes());
        res.setCorrectKeystrokes(session.getCorrectKeystrokes());
        res.setErrorCount(session.getErrorCount());
        res.setBackspaceCount(session.getBackspaceCount());

        res.setCorrectedErrors(session.getCorrectedErrors() != null ? session.getCorrectedErrors() : 0);
        res.setUncorrectedErrors(session.getUncorrectedErrors() != null ? session.getUncorrectedErrors() : 0);
        res.setCorrectionRate(session.getCorrectionRate() != null ? session.getCorrectionRate() : 100.0);
        res.setAvgInterKeyIntervalMs(session.getAvgInterKeyIntervalMs() != null ? session.getAvgInterKeyIntervalMs() : 0.0);
        res.setAvgPauseDurationMs(session.getAvgPauseDurationMs() != null ? session.getAvgPauseDurationMs() : 0.0);
        res.setErrorRecoveryTimeMs(session.getErrorRecoveryTimeMs() != null ? session.getErrorRecoveryTimeMs() : 0.0);

        res.setCompletedAt(session.getCompletedAt());

        if (session.getTelemetry() != null) {
            res.setTelemetry(session.getTelemetry().stream()
                    .map(t -> new SecondTelemetryDto(t.getSecondMarker(), t.getInstantWpm(), t.getInstantAccuracy(), t.getCumulativeErrors()))
                    .collect(Collectors.toList()));
        }

        if (session.getCharErrors() != null) {
            res.setCharErrors(session.getCharErrors().stream()
                    .map(c -> new CharErrorDto(c.getTargetChar(), c.getTypedChar(), c.getOccurrenceCount()))
                    .collect(Collectors.toList()));
        }

        if (session.getBigramErrors() != null) {
            res.setBigramErrors(session.getBigramErrors().stream()
                    .map(b -> new BigramErrorDto(b.getTargetBigram(), b.getTypedBigram(), b.getOccurrenceCount()))
                    .collect(Collectors.toList()));
        }

        return res;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
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
