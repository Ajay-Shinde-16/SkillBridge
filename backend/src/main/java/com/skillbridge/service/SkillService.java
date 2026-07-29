package com.skillbridge.service;

import com.skillbridge.model.Skill;
import com.skillbridge.model.User;
import com.skillbridge.repository.SkillRepository;
import com.skillbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public Skill addSkill(Skill skill) {
        skill.setCreatedAt(LocalDateTime.now());
        return skillRepository.save(skill);
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public List<Skill> getVerifiedSkills() {
        return skillRepository.findByVerified(true);
    }

    public Skill verifySkill(String skillId) {
        Skill skill = skillRepository.findById(skillId)
            .orElseThrow(() -> new RuntimeException("Skill not found"));
        skill.setVerified(true);
        return skillRepository.save(skill);
    }

    // Admin verifies a user's skill
    public User verifyUserSkill(String userId, String skillName) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<String> verifiedSkills = user.getVerifiedSkills();
        if (verifiedSkills == null) verifiedSkills = new ArrayList<>();
        if (!verifiedSkills.contains(skillName)) {
            verifiedSkills.add(skillName);
            user.setVerifiedSkills(verifiedSkills);
            userRepository.save(user);
        }
        return user;
    }

    public User updateUserSkills(String userId, List<String> skills) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSkills(skills);
        return userRepository.save(user);
    }
}
