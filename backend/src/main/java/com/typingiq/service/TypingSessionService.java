package com.typingiq.service;

import com.typingiq.dto.*;
import com.typingiq.entity.*;
import com.typingiq.exception.ResourceNotFoundException;
import com.typingiq.repository.TypingSessionRepository;
import com.typingiq.repository.UserKeyStatRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TypingSessionService {

    private final TypingSessionRepository sessionRepository;
    private final UserKeyStatRepository keyStatRepository;
    private final AuthService authService;

    public TypingSessionService(TypingSessionRepository sessionRepository,
                                UserKeyStatRepository keyStatRepository,
                                AuthService authService) {
        this.sessionRepository = sessionRepository;
        this.keyStatRepository = keyStatRepository;
        this.authService = authService;
    }

    public TypingSessionResponse submitSession(SessionSubmitRequest req) {
        User user = authService.getCurrentUser();

        TypingSession session = new TypingSession();
        session.setUserId(user.getId());
        session.setDurationSeconds(req.getDurationSeconds() != null ? req.getDurationSeconds() : 30);
        session.setDifficulty(req.getDifficulty() != null ? req.getDifficulty().toUpperCase() : "MEDIUM");
        session.setGrossWpm(req.getGrossWpm() != null ? req.getGrossWpm() : 0.0);
        session.setNetWpm(req.getNetWpm() != null ? req.getNetWpm() : 0.0);
        session.setAccuracyPercentage(req.getAccuracyPercentage() != null ? req.getAccuracyPercentage() : 100.0);
        session.setTotalKeystrokes(req.getTotalKeystrokes() != null ? req.getTotalKeystrokes() : 0);
        session.setCorrectKeystrokes(req.getCorrectKeystrokes() != null ? req.getCorrectKeystrokes() : 0);
        session.setErrorCount(req.getErrorCount() != null ? req.getErrorCount() : 0);
        session.setBackspaceCount(req.getBackspaceCount() != null ? req.getBackspaceCount() : 0);

        // Advanced Metrics
        session.setCorrectedErrors(req.getCorrectedErrors() != null ? req.getCorrectedErrors() : 0);
        session.setUncorrectedErrors(req.getUncorrectedErrors() != null ? req.getUncorrectedErrors() : 0);
        session.setCorrectionRate(req.getCorrectionRate() != null ? req.getCorrectionRate() : 100.0);
        session.setAvgInterKeyIntervalMs(req.getAvgInterKeyIntervalMs() != null ? req.getAvgInterKeyIntervalMs() : 0.0);
        session.setAvgPauseDurationMs(req.getAvgPauseDurationMs() != null ? req.getAvgPauseDurationMs() : 0.0);
        session.setErrorRecoveryTimeMs(req.getErrorRecoveryTimeMs() != null ? req.getErrorRecoveryTimeMs() : 0.0);

        // Save Telemetry slices
        if (req.getTelemetry() != null && !req.getTelemetry().isEmpty()) {
            List<SessionSecondTelemetry> telemetryList = new ArrayList<>();
            for (SecondTelemetryDto t : req.getTelemetry()) {
                telemetryList.add(new SessionSecondTelemetry(
                        t.getSecondMarker(),
                        t.getInstantWpm(),
                        t.getInstantAccuracy(),
                        t.getCumulativeErrors()
                ));
            }
            session.setTelemetry(telemetryList);
        }

        // Save Character Errors
        if (req.getCharErrors() != null && !req.getCharErrors().isEmpty()) {
            List<SessionCharError> charErrors = new ArrayList<>();
            for (CharErrorDto c : req.getCharErrors()) {
                charErrors.add(new SessionCharError(
                        c.getTargetChar(),
                        c.getTypedChar(),
                        c.getOccurrenceCount() != null ? c.getOccurrenceCount() : 1
                ));
            }
            session.setCharErrors(charErrors);
        }

        // Update User Key Stats Heatmap (from full key attempts)
        if (req.getKeyStats() != null && !req.getKeyStats().isEmpty()) {
            for (com.typingiq.dto.KeyStatDto k : req.getKeyStats()) {
                if (k.getKeyChar() == null || k.getKeyChar().isBlank()) continue;
                String targetChar = k.getKeyChar().toUpperCase();
                UserKeyStat stat = keyStatRepository.findByUserIdAndKeyChar(user.getId(), targetChar)
                        .orElse(new UserKeyStat(user.getId(), targetChar, 0L, 0L, 0.0, 0.0));

                stat.setTotalAttempts(stat.getTotalAttempts() + k.getTotalAttempts());
                stat.setErrorAttempts(stat.getErrorAttempts() + k.getErrorAttempts());
                if (stat.getTotalAttempts() > 0) {
                    double errRate = ((double) stat.getErrorAttempts() / stat.getTotalAttempts()) * 100.0;
                    stat.setErrorRate(Math.round(errRate * 10.0) / 10.0);
                }
                keyStatRepository.save(stat);
            }
        }

        // Save Bigram Errors
        if (req.getBigramErrors() != null && !req.getBigramErrors().isEmpty()) {
            List<SessionBigramError> bigramErrors = new ArrayList<>();
            for (BigramErrorDto b : req.getBigramErrors()) {
                bigramErrors.add(new SessionBigramError(
                        b.getTargetBigram(),
                        b.getTypedBigram(),
                        b.getOccurrenceCount() != null ? b.getOccurrenceCount() : 1
                ));
            }
            session.setBigramErrors(bigramErrors);
        }

        TypingSession savedSession = sessionRepository.save(session);
        return TypingSessionResponse.fromEntity(savedSession);
    }

    public Page<TypingSessionResponse> getUserSessions(int page, int size) {
        User user = authService.getCurrentUser();
        return sessionRepository.findByUserIdOrderByCompletedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(TypingSessionResponse::fromEntity);
    }

    public TypingSessionResponse getSessionById(String id) {
        User user = authService.getCurrentUser();
        TypingSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Typing session not found with id: " + id));

        // Strict User Authorization Verification
        if (!session.getUserId().equals(user.getId())) {
            throw new ResourceNotFoundException("Typing session not found for this user");
        }

        return TypingSessionResponse.fromEntity(session);
    }
}
