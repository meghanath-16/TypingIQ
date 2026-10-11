package com.typingiq.controller;

import com.typingiq.dto.ExerciseDto;
import com.typingiq.dto.ExerciseProgressRequest;
import com.typingiq.dto.ExerciseProgressResponse;
import com.typingiq.service.PracticeExerciseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exercises")
public class PracticeExerciseController {

    private final PracticeExerciseService exerciseService;

    public PracticeExerciseController(PracticeExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public ResponseEntity<List<ExerciseDto>> getAllExercises() {
        return ResponseEntity.ok(exerciseService.getAllExercises());
    }

    @PostMapping("/{id}/attempt")
    public ResponseEntity<ExerciseProgressResponse> submitAttempt(
            @PathVariable String id,
            @RequestBody ExerciseProgressRequest req) {
        return ResponseEntity.ok(exerciseService.submitProgress(id, req));
    }

    @GetMapping("/progress")
    public ResponseEntity<List<ExerciseProgressResponse>> getUserProgress() {
        return ResponseEntity.ok(exerciseService.getUserProgress());
    }

    @PostMapping("/generate-targeted")
    public ResponseEntity<ExerciseDto> generateTargetedExercise() {
        return ResponseEntity.ok(exerciseService.generateTargetedExerciseForUser());
    }
}
