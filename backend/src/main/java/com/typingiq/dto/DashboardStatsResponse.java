package com.typingiq.dto;

import java.util.List;

public class DashboardStatsResponse {

    private long totalSessions;
    private double bestWpm;
    private double avgWpm;
    private double avgGrossWpm;
    private double avgAccuracy;
    private long totalKeystrokes;
    private long totalCorrectKeystrokes;
    private long totalErrorKeystrokes;
    private double avgCorrectionRate;
    private double avgInterKeyIntervalMs;
    private double avgPauseDurationMs;
    private double avgErrorRecoveryTimeMs;
    private int currentStreakDays;
    private List<TypingSessionResponse> recentSessions;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalSessions, double bestWpm, double avgWpm, double avgGrossWpm,
                                  double avgAccuracy, long totalKeystrokes, long totalCorrectKeystrokes,
                                  long totalErrorKeystrokes, double avgCorrectionRate, double avgInterKeyIntervalMs,
                                  double avgPauseDurationMs, double avgErrorRecoveryTimeMs, int currentStreakDays,
                                  List<TypingSessionResponse> recentSessions) {
        this.totalSessions = totalSessions;
        this.bestWpm = bestWpm;
        this.avgWpm = avgWpm;
        this.avgGrossWpm = avgGrossWpm;
        this.avgAccuracy = avgAccuracy;
        this.totalKeystrokes = totalKeystrokes;
        this.totalCorrectKeystrokes = totalCorrectKeystrokes;
        this.totalErrorKeystrokes = totalErrorKeystrokes;
        this.avgCorrectionRate = avgCorrectionRate;
        this.avgInterKeyIntervalMs = avgInterKeyIntervalMs;
        this.avgPauseDurationMs = avgPauseDurationMs;
        this.avgErrorRecoveryTimeMs = avgErrorRecoveryTimeMs;
        this.currentStreakDays = currentStreakDays;
        this.recentSessions = recentSessions;
    }

    public long getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(long totalSessions) {
        this.totalSessions = totalSessions;
    }

    public double getBestWpm() {
        return bestWpm;
    }

    public void setBestWpm(double bestWpm) {
        this.bestWpm = bestWpm;
    }

    public double getAvgWpm() {
        return avgWpm;
    }

    public void setAvgWpm(double avgWpm) {
        this.avgWpm = avgWpm;
    }

    public double getAvgGrossWpm() {
        return avgGrossWpm;
    }

    public void setAvgGrossWpm(double avgGrossWpm) {
        this.avgGrossWpm = avgGrossWpm;
    }

    public double getAvgAccuracy() {
        return avgAccuracy;
    }

    public void setAvgAccuracy(double avgAccuracy) {
        this.avgAccuracy = avgAccuracy;
    }

    public long getTotalKeystrokes() {
        return totalKeystrokes;
    }

    public void setTotalKeystrokes(long totalKeystrokes) {
        this.totalKeystrokes = totalKeystrokes;
    }

    public long getTotalCorrectKeystrokes() {
        return totalCorrectKeystrokes;
    }

    public void setTotalCorrectKeystrokes(long totalCorrectKeystrokes) {
        this.totalCorrectKeystrokes = totalCorrectKeystrokes;
    }

    public long getTotalErrorKeystrokes() {
        return totalErrorKeystrokes;
    }

    public void setTotalErrorKeystrokes(long totalErrorKeystrokes) {
        this.totalErrorKeystrokes = totalErrorKeystrokes;
    }

    public double getAvgCorrectionRate() {
        return avgCorrectionRate;
    }

    public void setAvgCorrectionRate(double avgCorrectionRate) {
        this.avgCorrectionRate = avgCorrectionRate;
    }

    public double getAvgInterKeyIntervalMs() {
        return avgInterKeyIntervalMs;
    }

    public void setAvgInterKeyIntervalMs(double avgInterKeyIntervalMs) {
        this.avgInterKeyIntervalMs = avgInterKeyIntervalMs;
    }

    public double getAvgPauseDurationMs() {
        return avgPauseDurationMs;
    }

    public void setAvgPauseDurationMs(double avgPauseDurationMs) {
        this.avgPauseDurationMs = avgPauseDurationMs;
    }

    public double getErrorRecoveryTimeMs() {
        return avgErrorRecoveryTimeMs;
    }

    public void setErrorRecoveryTimeMs(double avgErrorRecoveryTimeMs) {
        this.avgErrorRecoveryTimeMs = avgErrorRecoveryTimeMs;
    }

    public double getAvgErrorRecoveryTimeMs() {
        return avgErrorRecoveryTimeMs;
    }

    public void setAvgErrorRecoveryTimeMs(double avgErrorRecoveryTimeMs) {
        this.avgErrorRecoveryTimeMs = avgErrorRecoveryTimeMs;
    }

    public int getCurrentStreakDays() {
        return currentStreakDays;
    }

    public void setCurrentStreakDays(int currentStreakDays) {
        this.currentStreakDays = currentStreakDays;
    }

    public List<TypingSessionResponse> getRecentSessions() {
        return recentSessions;
    }

    public void setRecentSessions(List<TypingSessionResponse> recentSessions) {
        this.recentSessions = recentSessions;
    }
}
