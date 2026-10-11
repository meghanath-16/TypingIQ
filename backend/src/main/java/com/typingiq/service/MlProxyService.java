package com.typingiq.service;

import com.typingiq.dto.*;
import com.typingiq.entity.TypingSession;
import com.typingiq.entity.User;
import com.typingiq.entity.UserKeyStat;
import com.typingiq.repository.TypingSessionRepository;
import com.typingiq.repository.UserKeyStatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MlProxyService {

    private static final Logger log = LoggerFactory.getLogger(MlProxyService.class);

    private final WebClient mlWebClient;
    private final TypingSessionRepository sessionRepository;
    private final UserKeyStatRepository keyStatRepository;
    private final AuthService authService;

    public MlProxyService(WebClient mlWebClient,
                          TypingSessionRepository sessionRepository,
                          UserKeyStatRepository keyStatRepository,
                          AuthService authService) {
        this.mlWebClient = mlWebClient;
        this.sessionRepository = sessionRepository;
        this.keyStatRepository = keyStatRepository;
        this.authService = authService;
    }

    public MlErrorPredictionDto.Response predictErrors(Integer targetDuration, String difficulty) {
        User user = authService.getCurrentUser();
        List<TypingSession> recent = sessionRepository.findTop10ByUserIdOrderByCompletedAtDesc(user.getId());

        double avgWpm = recent.isEmpty() ? 50.0 : recent.stream().mapToDouble(TypingSession::getNetWpm).average().orElse(50.0);
        double avgAcc = recent.isEmpty() ? 95.0 : recent.stream().mapToDouble(TypingSession::getAccuracyPercentage).average().orElse(95.0);
        double avgBackspace = recent.isEmpty() ? 0.08 : recent.stream()
                .mapToDouble(s -> s.getTotalKeystrokes() > 0 ? (double) s.getBackspaceCount() / s.getTotalKeystrokes() : 0.08)
                .average().orElse(0.08);

        MlErrorPredictionDto.Request req = new MlErrorPredictionDto.Request(
                user.getId(),
                targetDuration != null ? targetDuration : 30,
                difficulty != null ? difficulty.toUpperCase() : "MEDIUM",
                Math.round(avgWpm * 10.0) / 10.0,
                Math.round(avgAcc * 10.0) / 10.0,
                recent.size(),
                Math.round(avgBackspace * 100.0) / 100.0
        );

        try {
            return mlWebClient.post()
                    .uri("/predict-errors")
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(MlErrorPredictionDto.Response.class)
                    .block();
        } catch (Exception ex) {
            log.warn("FastAPI ML service predict call fallback: {}", ex.getMessage());
            // Fallback graceful response if ML service is warming up
            MlErrorPredictionDto.Response fallback = new MlErrorPredictionDto.Response();
            fallback.setPredictedErrorCount(3);
            fallback.setPredictedAccuracy(96.0);
            fallback.setRiskLevel("LOW");
            fallback.setRiskFactors(List.of("Steady baseline predicted"));
            fallback.setConfidenceScore(0.85);
            return fallback;
        }
    }

    public MlForecastDto.Response forecastPerformance(Integer horizon) {
        User user = authService.getCurrentUser();
        List<TypingSession> chronological = sessionRepository.findByUserIdOrderByCompletedAtAsc(user.getId());

        List<MlForecastDto.HistoricalPoint> history = new ArrayList<>();
        int idx = 1;
        for (TypingSession s : chronological) {
            history.add(new MlForecastDto.HistoricalPoint(
                    idx++,
                    s.getNetWpm(),
                    s.getAccuracyPercentage(),
                    s.getCompletedAt() != null ? s.getCompletedAt().toString() : null
            ));
        }

        MlForecastDto.Request req = new MlForecastDto.Request(
                user.getId(),
                history,
                horizon != null ? horizon : 10
        );

        try {
            return mlWebClient.post()
                    .uri("/forecast-wpm")
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(MlForecastDto.Response.class)
                    .block();
        } catch (Exception ex) {
            log.warn("FastAPI ML forecast call fallback: {}", ex.getMessage());
            MlForecastDto.Response fallback = new MlForecastDto.Response();
            fallback.setTrendType("EARLY_STAGE");
            fallback.setGrowthRatePer10Tests(5.0);
            fallback.setEstimatedCeilingWpm(75.0);
            fallback.setForecastPoints(new ArrayList<>());
            fallback.setModelR2Score(0.70);
            return fallback;
        }
    }

    public MlClusterDto.Response getClusterProfile() {
        User user = authService.getCurrentUser();
        List<TypingSession> allSessions = sessionRepository.findByUserIdOrderByCompletedAtAsc(user.getId());

        double avgWpm = allSessions.isEmpty() ? 50.0 : allSessions.stream().mapToDouble(TypingSession::getNetWpm).average().orElse(50.0);
        double avgAcc = allSessions.isEmpty() ? 95.0 : allSessions.stream().mapToDouble(TypingSession::getAccuracyPercentage).average().orElse(95.0);
        double errRate = Math.max(0.0, 100.0 - avgAcc);
        double backspaceRate = allSessions.isEmpty() ? 0.08 : allSessions.stream()
                .mapToDouble(s -> s.getTotalKeystrokes() > 0 ? (double) s.getBackspaceCount() / s.getTotalKeystrokes() : 0.08)
                .average().orElse(0.08);

        MlClusterDto.TypistFeatures features = new MlClusterDto.TypistFeatures(
                user.getId(),
                Math.round(avgWpm * 10.0) / 10.0,
                Math.round(avgAcc * 10.0) / 10.0,
                Math.round(errRate * 10.0) / 10.0,
                Math.round(backspaceRate * 100.0) / 100.0,
                allSessions.size()
        );

        MlClusterDto.Request req = new MlClusterDto.Request(features);

        try {
            return mlWebClient.post()
                    .uri("/cluster-profile")
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(MlClusterDto.Response.class)
                    .block();
        } catch (Exception ex) {
            log.warn("FastAPI ML cluster call fallback: {}", ex.getMessage());
            MlClusterDto.Response fallback = new MlClusterDto.Response();
            fallback.setClusterId(2);
            fallback.setPersonaTitle("Balanced Pacer (Steadfast Builder)");
            fallback.setPersonaTagline("Consistent rhythm with solid motor memory foundation.");
            fallback.setStrengths(List.of("Steady cadence", "Consistent posture"));
            fallback.setGrowthAreas(List.of("Accelerate on high frequency words"));
            fallback.setSpeedPercentile(50.0);
            fallback.setAccuracyPercentile(85.0);
            return fallback;
        }
    }

    public MlRecommendationDto.Response getRecommendations() {
        User user = authService.getCurrentUser();
        List<TypingSession> recent = sessionRepository.findTop10ByUserIdOrderByCompletedAtDesc(user.getId());
        List<UserKeyStat> keyStats = keyStatRepository.findByUserIdOrderByErrorRateDesc(user.getId());

        double avgWpm = recent.isEmpty() ? 50.0 : recent.stream().mapToDouble(TypingSession::getNetWpm).average().orElse(50.0);
        double avgAcc = recent.isEmpty() ? 95.0 : recent.stream().mapToDouble(TypingSession::getAccuracyPercentage).average().orElse(95.0);
        String recentDiff = recent.isEmpty() ? "MEDIUM" : recent.get(0).getDifficulty();

        List<String> weakestKeys = keyStats.stream()
                .filter(k -> k.getErrorAttempts() > 0)
                .limit(4)
                .map(UserKeyStat::getKeyChar)
                .collect(Collectors.toList());

        MlRecommendationDto.Request req = new MlRecommendationDto.Request(
                user.getId(),
                Math.round(avgWpm * 10.0) / 10.0,
                Math.round(avgAcc * 10.0) / 10.0,
                recentDiff,
                new ArrayList<>(),
                weakestKeys
        );

        try {
            return mlWebClient.post()
                    .uri("/recommend")
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(MlRecommendationDto.Response.class)
                    .block();
        } catch (Exception ex) {
            log.warn("FastAPI ML recommendation call fallback: {}", ex.getMessage());
            MlRecommendationDto.Response fallback = new MlRecommendationDto.Response();
            fallback.setHeadline("Maintain Flow & Accuracy Rhythm");
            fallback.setPriorityKeysToDrill(List.of("E", "R", "T"));
            fallback.setPacingAdvice("Focus on steady cadence without rushing unfamiliar bigrams.");
            fallback.setRecommendedTestDuration(30);
            fallback.setRecommendedDifficulty("MEDIUM");
            fallback.setSuggestedExercises(new ArrayList<>());
            return fallback;
        }
    }
}
