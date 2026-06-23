package com.skillbridge.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String applicationId;

    @Column(nullable = false)
    private String senderId;

    private String senderName;
    private String senderRole; // SEEKER or EMPLOYER

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private boolean readByRecipient = false;

    private LocalDateTime createdAt;
}