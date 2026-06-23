package com.skillbridge.controller;

import com.skillbridge.model.Message;
import com.skillbridge.model.User;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    @GetMapping("/{applicationId}")
    public ResponseEntity<?> getThread(@PathVariable String applicationId, Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            List<Message> thread = messageService.getThread(applicationId, user);
            return ResponseEntity.ok(thread);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{applicationId}")
    public ResponseEntity<?> sendMessage(@PathVariable String applicationId,
                                          @RequestBody Map<String, String> body,
                                          Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            Message saved = messageService.sendMessage(applicationId, body.get("content"), user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}