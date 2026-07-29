# SkillBridge — Remote Job Portal with Verified Skill Tagging
### CDAC Project | Group: PGCP-AC-002 | Leader: Sudarshan Bhandare

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Bootstrap 5 + Axios |
| Backend | Java 17 + Spring Boot 3.2 + Spring Security |
| Auth | JWT (JSON Web Token) |
| Database | MongoDB |
| Tools | IntelliJ IDEA / VS Code, Postman, GitHub |

---

## Project Structure
```
skillbridge/
├── backend/                   ← Spring Boot Project
│   ├── pom.xml
│   └── src/main/java/com/skillbridge/
│       ├── SkillBridgeApplication.java
│       ├── config/SecurityConfig.java
│       ├── controller/        ← REST API controllers
│       ├── dto/               ← Request/Response DTOs
│       ├── model/             ← MongoDB document models
│       ├── repository/        ← Spring Data MongoDB repos
│       ├── security/          ← JWT filter, UserDetailsService
│       └── service/           ← Business logic
│
└── frontend/                  ← React + Vite Project
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx            ← Routes
        ├── main.jsx
        ├── index.css
        ├── context/AuthContext.jsx
        ├── services/api.js    ← All Axios API calls
        ├── components/Navbar.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── JobList.jsx    ← Search + Filters
            ├── JobDetail.jsx  ← Apply + Match Score
            ├── Profile.jsx
            ├── seeker/        ← Seeker dashboard, applications, interviews
            ├── employer/      ← Post jobs, manage applications, schedule interviews
            └── admin/         ← Manage users, verify skills
```

---

## Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- IntelliJ IDEA / VS Code

---

## Setup Instructions

### Step 1: Start MongoDB
```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas (update application.properties with your URI)
```

### Step 2: Run Backend
```bash
cd skillbridge/backend
mvn clean install
mvn spring-boot:run
```
Backend runs on: http://localhost:8080

### Step 3: Run Frontend
```bash
cd skillbridge/frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

---

## API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get JWT token |

### Jobs
| Method | URL | Access |
|--------|-----|--------|
| GET | /api/jobs/all | Public |
| GET | /api/jobs/search?keyword=&minSalary=&maxSalary=&remote=&experienceLevel= | Public |
| GET | /api/jobs/{id} | Public |
| POST | /api/jobs/create | EMPLOYER |
| GET | /api/jobs/my-jobs | EMPLOYER |
| PUT | /api/jobs/{id} | EMPLOYER |
| DELETE | /api/jobs/{id} | EMPLOYER/ADMIN |
| GET | /api/jobs/match-score/{jobId} | SEEKER |

### Applications
| Method | URL | Access |
|--------|-----|--------|
| POST | /api/applications/apply/{jobId} | SEEKER |
| GET | /api/applications/my-applications | SEEKER |
| GET | /api/applications/job/{jobId} | EMPLOYER |
| PUT | /api/applications/{id}/status | EMPLOYER |
| GET | /api/applications/all | ADMIN |

### Interviews
| Method | URL | Access |
|--------|-----|--------|
| POST | /api/interviews/schedule | EMPLOYER |
| GET | /api/interviews/my-interviews | SEEKER |
| GET | /api/interviews/employer-interviews | EMPLOYER |
| PUT | /api/interviews/{id} | EMPLOYER |

### Skills
| Method | URL | Access |
|--------|-----|--------|
| GET | /api/skills/all | Public |
| POST | /api/skills/add | ADMIN |
| PUT | /api/skills/verify-user-skill | ADMIN |
| PUT | /api/skills/update-my-skills | SEEKER |

---

## Key Features

### 1. Verified Skill Tagging
- Seekers add their skills to their profile
- Admin can verify each skill with one click
- Verified skills show a green badge on profile
- Verified skills get 1.5x weight in match score calculation

### 2. Skill Match Score Algorithm
```
score = (matched_skills + verified_matched * 0.5) / required_skills * 100
capped at 100%
```

### 3. Application Status Pipeline
```
APPLIED → SHORTLISTED → INTERVIEW_SCHEDULED → OFFERED → ACCEPTED
                                           ↓
                                        REJECTED
```

### 4. Role-Based Access
- **SEEKER**: Browse jobs, apply, track applications, view interviews
- **EMPLOYER**: Post jobs, manage applications, schedule interviews, make offers
- **ADMIN**: Manage all users, verify skills, full platform access

---

## User Credentials for Testing (after registration)

Register these accounts in order:
1. Admin: email=admin@skillbridge.com, role=ADMIN (register normally, then manually set role in MongoDB)
2. Employer: email=employer@test.com, role=EMPLOYER
3. Seeker: email=seeker@test.com, role=SEEKER

---

## Team Division

| Member | Module |
|--------|--------|
| Member 1 (Leader: Sudarshan) | Auth (JWT + Spring Security) + Admin Panel |
| Member 2 | Job Module (Backend + Search + Match Score) |
| Member 3 | Application + Interview + Offer Management |
| Member 4 | React Frontend (All pages + Bootstrap UI) |

---

## MongoDB Collections

| Collection | Purpose |
|------------|---------|
| users | All user accounts (seeker/employer/admin) |
| jobs | Job postings with required skills |
| applications | Job applications with status tracking |
| interviews | Scheduled interviews |
| skills | Skill catalogue with verification status |

---

*SkillBridge — Built for CDAC PGCP Batch 2026, C-DAC Bangalore*
