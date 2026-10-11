package com.typingiq.dto;

import java.time.LocalDateTime;
import java.util.List;

public class HistoryTrendResponse {

    private List<HistoryPoint> points;

    public HistoryTrendResponse() {
    }

    public HistoryTrendResponse(List<HistoryPoint> points) {
        this.points = points;
    }

    public List<HistoryPoint> getPoints() {
        return points;
    }

    public void setPoints(List<HistoryPoint> points) {
        this.points = points;
    }

    public static class HistoryPoint {
        private int sessionIndex;
        private String sessionId;
        private double netWpm;
        private double grossWpm;
        private double accuracy;
        private String difficulty;
        private int durationSeconds;
        private LocalDateTime completedAt;

        public HistoryPoint() {
        }

        public HistoryPoint(int sessionIndex, String sessionId, double netWpm, double grossWpm, double accuracy, String difficulty, int durationSeconds, LocalDateTime completedAt) {
            this.sessionIndex = sessionIndex;
            this.sessionId = sessionId;
            this.netWpm = netWpm;
            this.grossWpm = grossWpm;
            this.accuracy = accuracy;
            this.difficulty = difficulty;
            this.durationSeconds = durationSeconds;
            this.completedAt = completedAt;
        }

        public int getSessionIndex() {
            return sessionIndex;
        }

        public void setSessionIndex(int sessionIndex) {
            this.sessionIndex = sessionIndex;
        }

        public String getSessionId() {
            return sessionId;
        }

        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }

        public double getNetWpm() {
            return netWpm;
        }

        public void setNetWpm(double netWpm) {
            this.netWpm = netWpm;
        }

        public double getGrossWpm() {
            return grossWpm;
        }

        public void setGrossWpm(double grossWpm) {
            this.grossWpm = grossWpm;
        }

        public double getAccuracy() {
            return accuracy;
        }

        public void setAccuracy(double accuracy) {
            this.accuracy = accuracy;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }

        public int getDurationSeconds() {
            return durationSeconds;
        }

        public void setDurationSeconds(int durationSeconds) {
            this.durationSeconds = durationSeconds;
        }

        public LocalDateTime getCompletedAt() {
            return completedAt;
        }

        public void setCompletedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
        }
    }
}
