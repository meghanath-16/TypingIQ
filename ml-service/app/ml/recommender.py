from typing import List
from app.schemas import RecommendationRequest, RecommendationResponse, TargetedExerciseSuggestion

class AdaptiveRecommender:
    def recommend(self, req: RecommendationRequest) -> RecommendationResponse:
        priority_keys: List[str] = []
        is_ml_driven = False
        
        # 1. Inspect character error matrix
        if req.key_errors:
            sorted_errors = sorted(req.key_errors, key=lambda x: x.count, reverse=True)
            for err in sorted_errors[:4]:
                if err.target_char and err.target_char.upper() not in priority_keys:
                    priority_keys.append(err.target_char.upper())
                    
        # 2. Add weakest keys from aggregate stats
        for k in req.weakest_keys:
            if k.upper() not in priority_keys and len(priority_keys) < 4:
                priority_keys.append(k.upper())
                
        # Fallback default keys if new user
        if not priority_keys:
            priority_keys = ["E", "R", "T", "N"]
            method = "RULE_BASED_DEFAULT_HEURISTIC"
        elif req.key_errors:
            priority_keys = priority_keys[:4]
            method = "RULE_BASED_CONFUSION_MATRIX_ANALYSIS"
        else:
            method = "RULE_BASED_KEY_ERROR_RATE"
            
        # Pacing advice & targeted weakness rationale
        if req.avg_accuracy < 93.0:
            pacing_advice = "Your speed is outpacing motor accuracy. Consciously drop cadence by 10-15% and prioritize clean keypresses."
            rec_duration = 30
            rec_difficulty = "EASY"
            primary_weakness = "Cadence overextension leading to high error frequency"
        elif req.avg_accuracy >= 97.5 and req.avg_wpm < 60:
            pacing_advice = "Superb precision threshold (>97%). Motor patterns are stable. Push burst cadence on familiar word bigrams."
            rec_duration = 15
            rec_difficulty = "MEDIUM"
            primary_weakness = "Conservative finger transitions limiting peak burst throughput"
        elif req.avg_wpm >= 75:
            pacing_advice = "Advanced typist cadence detected. Maintain stamina in longer 60s stretches with complex syntax and numbers."
            rec_duration = 60
            rec_difficulty = "HARD"
            primary_weakness = "Endurance fatigue and symbol transition hesitation"
        else:
            pacing_advice = "Balanced rhythm. Target consistent finger transitions on your identified problem keys."
            rec_duration = 30
            rec_difficulty = "MEDIUM"
            primary_weakness = "Isolated friction on adjacent keyboard rows"
            
        headline = f"Targeted Corrective Focus: Keys [{', '.join(priority_keys[:3])}]"
        
        # Targeted drills with explicit rationale and target weakness
        k0 = priority_keys[0]
        k1 = priority_keys[1] if len(priority_keys) > 1 else "R"
        k2 = priority_keys[2] if len(priority_keys) > 2 else "T"
        
        exercises = [
            TargetedExerciseSuggestion(
                title=f"Disambiguation Drill: {k0} vs {k1}",
                target_keys=[k0, k1],
                difficulty="MEDIUM",
                recommended_duration=30,
                focus_objective=f"Eliminate finger confusion between '{k0}' and '{k1}' in high-frequency word patterns.",
                rationale=f"Generated because error logs indicate recurring confusion between '{k0}' and adjacent finger positions.",
                target_weakness="Finger adjacent collision & misplaced keystroke"
            ),
            TargetedExerciseSuggestion(
                title=f"Home Row Anchor Flow: {k0} & Central Keys",
                target_keys=[k0, "F", "J"],
                difficulty="EASY",
                recommended_duration=15,
                focus_objective=f"Re-establish muscle memory for clean return to home row anchors after typing '{k0}'.",
                rationale="Generated to reinforce home-row resting posture and minimize finger drift.",
                target_weakness="Post-keystroke finger drift"
            ),
            TargetedExerciseSuggestion(
                title=f"Multi-Key Syntax Sprint: [{k0}, {k1}, {k2}]",
                target_keys=[k0, k1, k2],
                difficulty="HARD",
                recommended_duration=60,
                focus_objective="Sustain >96% accuracy under high cognitive load with punctuation and capitalization.",
                rationale="Generated to build muscular endurance over extended 60-second typing tests.",
                target_weakness=primary_weakness
            )
        ]
        
        return RecommendationResponse(
            headline=headline,
            priority_keys_to_drill=priority_keys,
            pacing_advice=pacing_advice,
            recommended_test_duration=rec_duration,
            recommended_difficulty=rec_difficulty,
            generation_method=method,
            suggested_exercises=exercises
        )

recommender_instance = AdaptiveRecommender()
