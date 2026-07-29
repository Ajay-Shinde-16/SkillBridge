package com.skillbridge.dto;

import lombok.Data;
import java.util.List;

public class AuthDTOs {

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String role; // SEEKER, EMPLOYER, ADMIN
        private String phone;
        private String companyName;
        private List<String> skills;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String id;
        private String name;
        private String email;
        private String role;

        public AuthResponse(String token, String id, String name, String email, String role) {
            this.token = token;
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }
    }
}
