package com.typingiq.repository;

import com.typingiq.entity.UserExerciseProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserExerciseProgressRepository extends MongoRepository<UserExerciseProgress, String> {
    List<UserExerciseProgress> findByUserIdOrderByCompletedAtDesc(String userId);
    List<UserExerciseProgress> findByUserIdAndExerciseId(String userId, String exerciseId);
    long countByUserIdAndPassedTrue(String userId);
}
