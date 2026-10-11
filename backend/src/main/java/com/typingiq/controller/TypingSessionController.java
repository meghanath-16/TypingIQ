package com.typingiq.controller;

import com.typingiq.dto.SessionSubmitRequest;
import com.typingiq.dto.TypingSessionResponse;
import com.typingiq.service.TypingSessionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sessions")
public class TypingSessionController {

    private final TypingSessionService sessionService;

    public TypingSessionController(TypingSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<TypingSessionResponse> submitSession(@Valid @RequestBody SessionSubmitRequest req) {
        return ResponseEntity.ok(sessionService.submitSession(req));
    }

    @GetMapping
    public ResponseEntity<Page<TypingSessionResponse>> getUserSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(sessionService.getUserSessions(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TypingSessionResponse> getSessionById(@PathVariable String id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }
}
