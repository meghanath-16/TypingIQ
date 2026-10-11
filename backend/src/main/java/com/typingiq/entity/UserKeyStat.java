package com.typingiq.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_key_stats")
@CompoundIndex(name = "user_key_idx", def = "{'userId': 1, 'keyChar': 1}", unique = true)
public class UserKeyStat {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String keyChar;
    private Long totalAttempts = 0L;
    private Long errorAttempts = 0L;
    private Double errorRate = 0.0;
    private Double avgLatencyMs = 0.0;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public UserKeyStat() {}

    public UserKeyStat(String userId, String keyChar, Long totalAttempts, Long errorAttempts, Double errorRate, Double avgLatencyMs) {
        this.userId = userId;
        this.keyChar = keyChar;
        this.totalAttempts = totalAttempts;
        this.errorAttempts = errorAttempts;
        this.errorRate = errorRate;
        this.avgLatencyMs = avgLatencyMs;
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getKeyChar() { return keyChar; }
    public void setKeyChar(String keyChar) { this.keyChar = keyChar; }
    public Long getTotalAttempts() { return totalAttempts; }
    public void setTotalAttempts(Long totalAttempts) { this.totalAttempts = totalAttempts; }
    public Long getErrorAttempts() { return errorAttempts; }
    public void setErrorAttempts(Long errorAttempts) { this.errorAttempts = errorAttempts; }
    public Double getErrorRate() { return errorRate; }
    public void setErrorRate(Double errorRate) { this.errorRate = errorRate; }
    public Double getAvgLatencyMs() { return avgLatencyMs; }
    public void setAvgLatencyMs(Double avgLatencyMs) { this.avgLatencyMs = avgLatencyMs; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
