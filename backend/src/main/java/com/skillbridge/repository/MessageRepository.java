package com.skillbridge.repository;

import com.skillbridge.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findByApplicationIdOrderByCreatedAtAsc(String applicationId);
    long countByApplicationIdAndReadByRecipientFalseAndSenderIdNot(String applicationId, String currentUserId);
}