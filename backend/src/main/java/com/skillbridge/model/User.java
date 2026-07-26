package com.skillbridge.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String role; // SEEKER, EMPLOYER, ADMIN

    private String phone;

    private String location;

    private String bio;

    private String resumeUrl;

    private String companyName; // for EMPLOYER

    private String companyWebsite; // for EMPLOYER

    private List<String> skills; // for SEEKER

    private List<String> verifiedSkills; // verified skill names

    private int experienceYears;

    private String profilePicture;

    private LocalDateTime createdAt;

    private boolean active = true;
}
