package com.typingiq.service;

import com.typingiq.dto.ExerciseDto;
import com.typingiq.dto.ExerciseProgressRequest;
import com.typingiq.dto.ExerciseProgressResponse;
import com.typingiq.entity.*;
import com.typingiq.exception.ResourceNotFoundException;
import com.typingiq.repository.PracticeExerciseRepository;
import com.typingiq.repository.UserExerciseProgressRepository;
import com.typingiq.repository.UserKeyStatRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PracticeExerciseService {

    private final PracticeExerciseRepository exerciseRepository;
    private final UserExerciseProgressRepository progressRepository;
    private final UserKeyStatRepository keyStatRepository;
    private final AuthService authService;

    public PracticeExerciseService(PracticeExerciseRepository exerciseRepository,
                                   UserExerciseProgressRepository progressRepository,
                                   UserKeyStatRepository keyStatRepository,
                                   AuthService authService) {
        this.exerciseRepository = exerciseRepository;
        this.progressRepository = progressRepository;
        this.keyStatRepository = keyStatRepository;
        this.authService = authService;
    }

    @PostConstruct
    public void seedDefaultExercises() {
        if (exerciseRepository.count() == 0) {
            List<PracticeExercise> defaults = List.of(
                    new PracticeExercise(
                            "Home Row Fundamentals (A, S, D, F, J, K, L)",
                            "A,S,D,F,J,K,L",
                            "EASY",
                            "ask all fall flash glad salad dash flasks half alfalfa flash sad fall glad flasks",
                            95,
                            35
                    ),
                    new PracticeExercise(
                            "Top Row Expansion (E, R, T, U, I, O, P)",
                            "E,R,T,U,I,O,P",
                            "EASY",
                            "tree trip port quiet power route prior pepper report tower pure repeat proper",
                            95,
                            40
                    ),
                    new PracticeExercise(
                            "Bottom Row Agility (Z, X, C, V, B, N, M)",
                            "Z,X,C,V,B,N,M",
                            "MEDIUM",
                            "brave zinc civic calm zero cabin mimic bonus vibrant blank vanish balance combine",
                            95,
                            45
                    ),
                    new PracticeExercise(
                            "Adjacent Key Disambiguation (E vs R, T vs Y)",
                            "E,R,T,Y",
                            "MEDIUM",
                            "try yesterday treaty retry return energy typical rarely territory trendy battery",
                            96,
                            50
                    ),
                    new PracticeExercise(
                            "Pinky Finger Mastery (Q, P, Z, Caps, Shift)",
                            "Q,P,Z",
                            "HARD",
                            "Quiet quartz puzzled people promptly. Quick puppies zoomed past zebras quietly.",
                            96,
                            55
                    ),
                    new PracticeExercise(
                            "Punctuation & Syntax Sprint (Colons, Quotes, Symbols)",
                            ",,.,;,:,!,\"",
                            "HARD",
                            "\"Typing accurately; that's true mastery: speed is merely a byproduct of rhythm!\"",
                            97,
                            50
                    )
            );
            exerciseRepository.saveAll(defaults);
        }
    }

    public List<ExerciseDto> getAllExercises() {
        User user = authService.getCurrentUser();
        List<PracticeExercise> exercises = exerciseRepository.findAll();
        List<UserExerciseProgress> userHistory = progressRepository.findByUserIdOrderByCompletedAtDesc(user.getId());

        Set<String> passedExerciseIds = userHistory.stream()
                .filter(UserExerciseProgress::getPassed)
                .map(UserExerciseProgress::getExerciseId)
                .collect(Collectors.toSet());

        return exercises.stream()
                .map(e -> ExerciseDto.fromEntity(e, passedExerciseIds.contains(e.getId())))
                .collect(Collectors.toList());
    }

    public ExerciseDto generateTargetedExerciseForUser() {
        User user = authService.getCurrentUser();
        List<UserKeyStat> keyStats = keyStatRepository.findByUserIdOrderByErrorRateDesc(user.getId());

        List<String> weakestKeys = keyStats.stream()
                .filter(k -> k.getErrorAttempts() > 0)
                .limit(3)
                .map(UserKeyStat::getKeyChar)
                .collect(Collectors.toList());

        if (weakestKeys.isEmpty()) {
            weakestKeys = List.of("T", "R", "E");
        }

        String targetKeyStr = String.join(",", weakestKeys);
        String k0 = weakestKeys.get(0).toLowerCase();
        String k1 = weakestKeys.size() > 1 ? weakestKeys.get(1).toLowerCase() : "e";

        String title = "Personalized Target Drill: [" + String.join(" + ", weakestKeys) + "]";
        String drillContent = String.format(
                "retrain muscle memory on %s and %s: %s%s %s%s %s%s pattern practice %s rhythm speed precision %s%s",
                k0, k1, k0, k1, k1, k0, k0, k1, k0, k1, k0
        );

        PracticeExercise customEx = new PracticeExercise(
                title,
                targetKeyStr,
                "MEDIUM",
                drillContent,
                95,
                45
        );
        PracticeExercise saved = exerciseRepository.save(customEx);
        return ExerciseDto.fromEntity(saved, false);
    }

    public ExerciseProgressResponse submitProgress(String exerciseId, ExerciseProgressRequest req) {
        User user = authService.getCurrentUser();
        PracticeExercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + exerciseId));

        boolean passed = req.getAchievedAccuracy() >= exercise.getTargetAccuracy()
                && req.getAchievedWpm() >= exercise.getTargetWpm();

        UserExerciseProgress progress = new UserExerciseProgress(
                user.getId(),
                exercise.getId(),
                req.getAchievedWpm(),
                req.getAchievedAccuracy(),
                passed
        );
        UserExerciseProgress saved = progressRepository.save(progress);

        return new ExerciseProgressResponse(
                saved.getId(),
                exercise.getId(),
                exercise.getTitle(),
                saved.getAchievedWpm(),
                saved.getAchievedAccuracy(),
                saved.getPassed(),
                saved.getCompletedAt()
        );
    }

    public List<ExerciseProgressResponse> getUserProgress() {
        User user = authService.getCurrentUser();
        Map<String, String> exerciseTitleMap = exerciseRepository.findAll().stream()
                .collect(Collectors.toMap(PracticeExercise::getId, PracticeExercise::getTitle, (a, b) -> a));

        return progressRepository.findByUserIdOrderByCompletedAtDesc(user.getId()).stream()
                .map(p -> new ExerciseProgressResponse(
                        p.getId(),
                        p.getExerciseId(),
                        exerciseTitleMap.getOrDefault(p.getExerciseId(), "Targeted Drill"),
                        p.getAchievedWpm(),
                        p.getAchievedAccuracy(),
                        p.getPassed(),
                        p.getCompletedAt()
                ))
                .collect(Collectors.toList());
    }
}
