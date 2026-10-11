package com.typingiq.repository;

import com.typingiq.entity.PracticeExercise;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeExerciseRepository extends MongoRepository<PracticeExercise, String> {
    List<PracticeExercise> findByDifficulty(String difficulty);
}
