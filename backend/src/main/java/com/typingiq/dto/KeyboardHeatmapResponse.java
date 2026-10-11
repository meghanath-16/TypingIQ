package com.typingiq.dto;

import java.util.List;

public class KeyboardHeatmapResponse {

    private List<KeyMetric> keys;
    private List<String> mostFrequentErrorKeys;
    private double overallKeyAccuracy;

    public KeyboardHeatmapResponse() {
    }

    public KeyboardHeatmapResponse(List<KeyMetric> keys, List<String> mostFrequentErrorKeys, double overallKeyAccuracy) {
        this.keys = keys;
        this.mostFrequentErrorKeys = mostFrequentErrorKeys;
        this.overallKeyAccuracy = overallKeyAccuracy;
    }

    public List<KeyMetric> getKeys() {
        return keys;
    }

    public void setKeys(List<KeyMetric> keys) {
        this.keys = keys;
    }

    public List<String> getMostFrequentErrorKeys() {
        return mostFrequentErrorKeys;
    }

    public void setMostFrequentErrorKeys(List<String> mostFrequentErrorKeys) {
        this.mostFrequentErrorKeys = mostFrequentErrorKeys;
    }

    public double getOverallKeyAccuracy() {
        return overallKeyAccuracy;
    }

    public void setOverallKeyAccuracy(double overallKeyAccuracy) {
        this.overallKeyAccuracy = overallKeyAccuracy;
    }

    public static class KeyMetric {
        private String keyChar;
        private long totalPresses;
        private long errorPresses;
        private double errorRate;

        public KeyMetric() {
        }

        public KeyMetric(String keyChar, long totalPresses, long errorPresses, double errorRate) {
            this.keyChar = keyChar;
            this.totalPresses = totalPresses;
            this.errorPresses = errorPresses;
            this.errorRate = errorRate;
        }

        public String getKeyChar() {
            return keyChar;
        }

        public void setKeyChar(String keyChar) {
            this.keyChar = keyChar;
        }

        public long getTotalPresses() {
            return totalPresses;
        }

        public void setTotalPresses(long totalPresses) {
            this.totalPresses = totalPresses;
        }

        public long getErrorPresses() {
            return errorPresses;
        }

        public void setErrorPresses(long errorPresses) {
            this.errorPresses = errorPresses;
        }

        public double getErrorRate() {
            return errorRate;
        }

        public void setErrorRate(double errorRate) {
            this.errorRate = errorRate;
        }
    }
}
