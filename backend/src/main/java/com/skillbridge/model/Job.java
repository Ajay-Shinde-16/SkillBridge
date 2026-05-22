package com.skillbridge.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String employerId;
    private String companyName;
    private String companyLogo;
    private String location;
    private boolean remote = true;
    private String jobType;         // FULL_TIME, PART_TIME, CONTRACT, FREELANCE
    private String experienceLevel; // ENTRY, MID, SENIOR

    // Stored as comma-separated string
    @Column(columnDefinition = "TEXT")
    private String requiredSkills;

    private double minSalary;
    private double maxSalary;
    private String currency = "INR";
    private String status = "OPEN";  // OPEN, CLOSED, PAUSED
    private int applicationCount = 0;
    private LocalDateTime postedAt;
    private LocalDateTime deadline;

    // ─── Always returns List<String> — NEVER null ───
    public List<String> getRequiredSkillsList() {
        if (requiredSkills == null || requiredSkills.trim().isEmpty()) return new ArrayList<>();
        return new ArrayList<>(Arrays.asList(requiredSkills.split(",")));
    }

    public void setRequiredSkillsList(List<String> list) {
        if (list == null || list.isEmpty()) {
            this.requiredSkills = "";
        } else {
            this.requiredSkills = list.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .map(String::trim)
                .reduce("", (a, b) -> a.isEmpty() ? b : a + "," + b);
        }
    }
}
