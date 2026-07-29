package com.skillbridge.service;

import com.skillbridge.dto.AuthDTOs;
import com.skillbridge.model.User;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : "SEEKER");
        user.setPhone(request.getPhone());
        user.setCompanyName(request.getCompanyName());
        user.setSkills(request.getSkills() != null ? request.getSkills() : new ArrayList<>());
        user.setVerifiedSkills(new ArrayList<>());
        user.setCreatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        String token = jwtUtils.generateToken(saved.getEmail(), saved.getRole());
        return new AuthDTOs.AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        return new AuthDTOs.AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
