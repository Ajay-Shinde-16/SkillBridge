package com.skillbridge.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "jobs")
public class Job {

    @Id
    private String id;

    private String title;

    private String description;

    private String employerId;

    private String companyName;

    private String companyLogo;

    private String location;

    private boolean remote = true;

    private String jobType; // FULL_TIME, PART_TIME, CONTRACT, FREELANCE

    private String experienceLevel; // ENTRY, MID, SENIOR

    private List<String> requiredSkills;

    private double minSalary;

    private double maxSalary;

    private String currency = "INR";

    private String status; // OPEN, CLOSED, PAUSED

    private int applicationCount = 0;

    private LocalDateTime postedAt;

    private LocalDateTime deadline;
}
