package com.typingiq.repository;

import com.typingiq.entity.TypingSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TypingSessionRepository extends MongoRepository<TypingSession, String> {
    Page<TypingSession> findByUserIdOrderByCompletedAtDesc(String userId, Pageable pageable);
    List<TypingSession> findByUserIdOrderByCompletedAtAsc(String userId);
    List<TypingSession> findTop10ByUserIdOrderByCompletedAtDesc(String userId);
    long countByUserId(String userId);
}
