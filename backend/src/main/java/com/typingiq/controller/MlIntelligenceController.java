package com.typingiq.controller;

import com.typingiq.dto.MlClusterDto;
import com.typingiq.dto.MlErrorPredictionDto;
import com.typingiq.dto.MlForecastDto;
import com.typingiq.dto.MlRecommendationDto;
import com.typingiq.service.MlProxyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
public class MlIntelligenceController {

    private final MlProxyService mlProxyService;

    public MlIntelligenceController(MlProxyService mlProxyService) {
        this.mlProxyService = mlProxyService;
    }

    @GetMapping("/error-prediction")
    public ResponseEntity<MlErrorPredictionDto.Response> getErrorPrediction(
            @RequestParam(defaultValue = "30") Integer duration,
            @RequestParam(defaultValue = "MEDIUM") String difficulty) {
        return ResponseEntity.ok(mlProxyService.predictErrors(duration, difficulty));
    }

    @GetMapping("/forecast")
    public ResponseEntity<MlForecastDto.Response> getPerformanceForecast(
            @RequestParam(defaultValue = "10") Integer horizon) {
        return ResponseEntity.ok(mlProxyService.forecastPerformance(horizon));
    }

    @GetMapping("/clustering")
    public ResponseEntity<MlClusterDto.Response> getClusterPersona() {
        return ResponseEntity.ok(mlProxyService.getClusterProfile());
    }

    @GetMapping("/recommendations")
    public ResponseEntity<MlRecommendationDto.Response> getRecommendations() {
        return ResponseEntity.ok(mlProxyService.getRecommendations());
    }
}
