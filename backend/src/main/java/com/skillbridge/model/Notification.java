package com.skillbridge.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String userId;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String type; // APPLICATION, SHORTLIST, INTERVIEW, OFFER, SYSTEM
    private String link; // frontend route to navigate to
    private boolean read = false;
    private LocalDateTime createdAt;
}
