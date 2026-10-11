package com.typingiq.repository;

import com.typingiq.entity.UserKeyStat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserKeyStatRepository extends MongoRepository<UserKeyStat, String> {
    List<UserKeyStat> findByUserIdOrderByErrorRateDesc(String userId);
    Optional<UserKeyStat> findByUserIdAndKeyChar(String userId, String keyChar);
    List<UserKeyStat> findByUserId(String userId);
}
