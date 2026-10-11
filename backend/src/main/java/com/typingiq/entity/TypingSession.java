package com.typingiq.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "typing_sessions")
public class TypingSession {

    @Id
    private String id;

    @Indexed
    private String userId;

    private Integer durationSeconds;
    private String difficulty;

    private Double grossWpm;
    private Double netWpm;
    private Double accuracyPercentage;

    private Integer totalKeystrokes;
    private Integer correctKeystrokes;
    private Integer errorCount;
    private Integer backspaceCount;

    private Integer correctedErrors = 0;
    private Integer uncorrectedErrors = 0;
    private Double correctionRate = 0.0;

    private Double avgInterKeyIntervalMs = 0.0;
    private Double avgPauseDurationMs = 0.0;
    private Double errorRecoveryTimeMs = 0.0;

    private LocalDateTime completedAt = LocalDateTime.now();

    private List<SessionSecondTelemetry> telemetry = new ArrayList<>();
    private List<SessionCharError> charErrors = new ArrayList<>();
    private List<SessionBigramError> bigramErrors = new ArrayList<>();

    public TypingSession() {}

    public TypingSession(String userId, Integer durationSeconds, String difficulty,
                         Double grossWpm, Double netWpm, Double accuracyPercentage,
                         Integer totalKeystrokes, Integer correctKeystrokes, Integer errorCount,
                         Integer backspaceCount, Integer correctedErrors, Integer uncorrectedErrors,
                         Double correctionRate, Double avgInterKeyIntervalMs, Double avgPauseDurationMs,
                         Double errorRecoveryTimeMs) {
        this.userId = userId;
        this.durationSeconds = durationSeconds;
        this.difficulty = difficulty;
        this.grossWpm = grossWpm;
        this.netWpm = netWpm;
        this.accuracyPercentage = accuracyPercentage;
        this.totalKeystrokes = totalKeystrokes;
        this.correctKeystrokes = correctKeystrokes;
        this.errorCount = errorCount;
        this.backspaceCount = backspaceCount;
        this.correctedErrors = correctedErrors;
        this.uncorrectedErrors = uncorrectedErrors;
        this.correctionRate = correctionRate;
        this.avgInterKeyIntervalMs = avgInterKeyIntervalMs;
        this.avgPauseDurationMs = avgPauseDurationMs;
        this.errorRecoveryTimeMs = errorRecoveryTimeMs;
        this.completedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Double getGrossWpm() { return grossWpm; }
    public void setGrossWpm(Double grossWpm) { this.grossWpm = grossWpm; }

    public Double getNetWpm() { return netWpm; }
    public void setNetWpm(Double netWpm) { this.netWpm = netWpm; }

    public Double getAccuracyPercentage() { return accuracyPercentage; }
    public void setAccuracyPercentage(Double accuracyPercentage) { this.accuracyPercentage = accuracyPercentage; }

    public Integer getTotalKeystrokes() { return totalKeystrokes; }
    public void setTotalKeystrokes(Integer totalKeystrokes) { this.totalKeystrokes = totalKeystrokes; }

    public Integer getCorrectKeystrokes() { return correctKeystrokes; }
    public void setCorrectKeystrokes(Integer correctKeystrokes) { this.correctKeystrokes = correctKeystrokes; }

    public Integer getErrorCount() { return errorCount; }
    public void setErrorCount(Integer errorCount) { this.errorCount = errorCount; }

    public Integer getBackspaceCount() { return backspaceCount; }
    public void setBackspaceCount(Integer backspaceCount) { this.backspaceCount = backspaceCount; }

    public Integer getCorrectedErrors() { return correctedErrors; }
    public void setCorrectedErrors(Integer correctedErrors) { this.correctedErrors = correctedErrors; }

    public Integer getUncorrectedErrors() { return uncorrectedErrors; }
    public void setUncorrectedErrors(Integer uncorrectedErrors) { this.uncorrectedErrors = uncorrectedErrors; }

    public Double getCorrectionRate() { return correctionRate; }
    public void setCorrectionRate(Double correctionRate) { this.correctionRate = correctionRate; }

    public Double getAvgInterKeyIntervalMs() { return avgInterKeyIntervalMs; }
    public void setAvgInterKeyIntervalMs(Double avgInterKeyIntervalMs) { this.avgInterKeyIntervalMs = avgInterKeyIntervalMs; }

    public Double getAvgPauseDurationMs() { return avgPauseDurationMs; }
    public void setAvgPauseDurationMs(Double avgPauseDurationMs) { this.avgPauseDurationMs = avgPauseDurationMs; }

    public Double getErrorRecoveryTimeMs() { return errorRecoveryTimeMs; }
    public void setErrorRecoveryTimeMs(Double errorRecoveryTimeMs) { this.errorRecoveryTimeMs = errorRecoveryTimeMs; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public List<SessionSecondTelemetry> getTelemetry() { return telemetry; }
    public void setTelemetry(List<SessionSecondTelemetry> telemetry) { this.telemetry = telemetry; }

    public List<SessionCharError> getCharErrors() { return charErrors; }
    public void setCharErrors(List<SessionCharError> charErrors) { this.charErrors = charErrors; }

    public List<SessionBigramError> getBigramErrors() { return bigramErrors; }
    public void setBigramErrors(List<SessionBigramError> bigramErrors) { this.bigramErrors = bigramErrors; }
}
