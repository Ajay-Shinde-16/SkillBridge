package com.skillbridge.repository;

import com.skillbridge.model.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface SkillRepository extends MongoRepository<Skill, String> {
    Optional<Skill> findByNameIgnoreCase(String name);
    List<Skill> findByVerified(boolean verified);
    List<Skill> findByCategory(String category);
}
