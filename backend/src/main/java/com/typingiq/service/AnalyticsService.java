package com.typingiq.service;

import com.typingiq.dto.DashboardStatsResponse;
import com.typingiq.dto.HistoryTrendResponse;
import com.typingiq.dto.KeyboardHeatmapResponse;
import com.typingiq.dto.TypingSessionResponse;
import com.typingiq.entity.TypingSession;
import com.typingiq.entity.User;
import com.typingiq.entity.UserKeyStat;
import com.typingiq.repository.TypingSessionRepository;
import com.typingiq.repository.UserKeyStatRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final TypingSessionRepository sessionRepository;
    private final UserKeyStatRepository keyStatRepository;
    private final AuthService authService;

    public AnalyticsService(TypingSessionRepository sessionRepository,
                            UserKeyStatRepository keyStatRepository,
                            AuthService authService) {
        this.sessionRepository = sessionRepository;
        this.keyStatRepository = keyStatRepository;
        this.authService = authService;
    }

    public DashboardStatsResponse getDashboardStats() {
        User user = authService.getCurrentUser();

        List<TypingSession> allSessions = sessionRepository.findByUserIdOrderByCompletedAtAsc(user.getId());
        List<TypingSession> recent = sessionRepository.findTop10ByUserIdOrderByCompletedAtDesc(user.getId());
        List<TypingSessionResponse> recentResponses = recent.stream()
                .map(TypingSessionResponse::fromEntity)
                .collect(Collectors.toList());

        long count = allSessions.size();
        double bestWpm = allSessions.stream().mapToDouble(s -> s.getNetWpm() != null ? s.getNetWpm() : 0.0).max().orElse(0.0);
        double avgWpm = allSessions.stream().mapToDouble(s -> s.getNetWpm() != null ? s.getNetWpm() : 0.0).average().orElse(0.0);
        double avgAcc = allSessions.stream().mapToDouble(s -> s.getAccuracyPercentage() != null ? s.getAccuracyPercentage() : 0.0).average().orElse(0.0);
        long totalKeystrokes = allSessions.stream().mapToLong(s -> s.getTotalKeystrokes() != null ? s.getTotalKeystrokes() : 0L).sum();

        double avgGrossWpm = allSessions.isEmpty() ? 0.0 :
                allSessions.stream().mapToDouble(s -> s.getGrossWpm() != null ? s.getGrossWpm() : 0.0).average().orElse(0.0);

        long totalCorrectKeystrokes = allSessions.stream()
                .mapToLong(s -> s.getCorrectKeystrokes() != null ? s.getCorrectKeystrokes() : 0L)
                .sum();

        long totalErrorKeystrokes = allSessions.stream()
                .mapToLong(s -> s.getErrorCount() != null ? s.getErrorCount() : 0L)
                .sum();

        double avgCorrectionRate = allSessions.stream()
                .filter(s -> s.getCorrectionRate() != null)
                .mapToDouble(TypingSession::getCorrectionRate)
                .average()
                .orElse(100.0);

        double avgInterKeyIntervalMs = allSessions.stream()
                .filter(s -> s.getAvgInterKeyIntervalMs() != null && s.getAvgInterKeyIntervalMs() > 0)
                .mapToDouble(TypingSession::getAvgInterKeyIntervalMs)
                .average()
                .orElse(0.0);

        double avgPauseDurationMs = allSessions.stream()
                .filter(s -> s.getAvgPauseDurationMs() != null && s.getAvgPauseDurationMs() > 0)
                .mapToDouble(TypingSession::getAvgPauseDurationMs)
                .average()
                .orElse(0.0);

        double avgErrorRecoveryTimeMs = allSessions.stream()
                .filter(s -> s.getErrorRecoveryTimeMs() != null && s.getErrorRecoveryTimeMs() > 0)
                .mapToDouble(TypingSession::getErrorRecoveryTimeMs)
                .average()
                .orElse(0.0);

        int streak = count > 0 ? 1 : 0;

        return new DashboardStatsResponse(
                count,
                Math.round(bestWpm * 10.0) / 10.0,
                Math.round(avgWpm * 10.0) / 10.0,
                Math.round(avgGrossWpm * 10.0) / 10.0,
                Math.round(avgAcc * 10.0) / 10.0,
                totalKeystrokes,
                totalCorrectKeystrokes,
                totalErrorKeystrokes,
                Math.round(avgCorrectionRate * 10.0) / 10.0,
                Math.round(avgInterKeyIntervalMs * 10.0) / 10.0,
                Math.round(avgPauseDurationMs * 10.0) / 10.0,
                Math.round(avgErrorRecoveryTimeMs * 10.0) / 10.0,
                streak,
                recentResponses
        );
    }

    public HistoryTrendResponse getHistoryTrend() {
        User user = authService.getCurrentUser();
        List<TypingSession> chronological = sessionRepository.findByUserIdOrderByCompletedAtAsc(user.getId());

        List<HistoryTrendResponse.HistoryPoint> points = new ArrayList<>();
        int idx = 1;
        for (TypingSession s : chronological) {
            points.add(new HistoryTrendResponse.HistoryPoint(
                    idx++,
                    s.getId(),
                    s.getNetWpm(),
                    s.getGrossWpm(),
                    s.getAccuracyPercentage(),
                    s.getDifficulty(),
                    s.getDurationSeconds(),
                    s.getCompletedAt()
            ));
        }

        return new HistoryTrendResponse(points);
    }

    public KeyboardHeatmapResponse getKeyboardHeatmap() {
        User user = authService.getCurrentUser();
        List<UserKeyStat> stats = keyStatRepository.findByUserId(user.getId());

        Map<String, UserKeyStat> statMap = stats.stream()
                .collect(Collectors.toMap(s -> s.getKeyChar().toUpperCase(), s -> s, (a, b) -> a));

        String allKeys = "QWERTYUIOPASDFGHJKLZXCVBNM";
        List<KeyboardHeatmapResponse.KeyMetric> metrics = new ArrayList<>();

        long totalAllPresses = 0;
        long totalAllErrors = 0;

        for (char c : allKeys.toCharArray()) {
            String keyStr = String.valueOf(c);
            UserKeyStat s = statMap.get(keyStr);
            if (s != null) {
                totalAllPresses += s.getTotalAttempts();
                totalAllErrors += s.getErrorAttempts();
                metrics.add(new KeyboardHeatmapResponse.KeyMetric(
                        keyStr,
                        s.getTotalAttempts(),
                        s.getErrorAttempts(),
                        Math.round(s.getErrorRate() * 10.0) / 10.0
                ));
            } else {
                metrics.add(new KeyboardHeatmapResponse.KeyMetric(keyStr, 0L, 0L, 0.0));
            }
        }

        List<String> topErrorKeys = metrics.stream()
                .filter(k -> k.getErrorPresses() > 0)
                .sorted(Comparator.comparingDouble(KeyboardHeatmapResponse.KeyMetric::getErrorRate).reversed())
                .limit(5)
                .map(KeyboardHeatmapResponse.KeyMetric::getKeyChar)
                .collect(Collectors.toList());

        double overallAcc = totalAllPresses > 0
                ? Math.round((((double) (totalAllPresses - totalAllErrors) / totalAllPresses) * 100.0) * 10.0) / 10.0
                : 100.0;

        return new KeyboardHeatmapResponse(metrics, topErrorKeys, overallAcc);
    }
}
