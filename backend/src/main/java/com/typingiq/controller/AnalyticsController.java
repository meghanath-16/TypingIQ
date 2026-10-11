package com.typingiq.controller;

import com.typingiq.dto.DashboardStatsResponse;
import com.typingiq.dto.HistoryTrendResponse;
import com.typingiq.dto.KeyboardHeatmapResponse;
import com.typingiq.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/history")
    public ResponseEntity<HistoryTrendResponse> getHistoryTrend() {
        return ResponseEntity.ok(analyticsService.getHistoryTrend());
    }

    @GetMapping("/keyboard-heatmap")
    public ResponseEntity<KeyboardHeatmapResponse> getKeyboardHeatmap() {
        return ResponseEntity.ok(analyticsService.getKeyboardHeatmap());
    }
}
