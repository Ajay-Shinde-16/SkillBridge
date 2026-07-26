package com.skillbridge.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "skills")
public class Skill {

    @Id
    private String id;

    private String name;

    private String category; // PROGRAMMING, DESIGN, MANAGEMENT, etc.

    private String description;

    private boolean verified = false;

    private LocalDateTime createdAt;
}
