# Healify Database Schema - Microservices Architecture with Redis

## Architecture Overview

The system uses a **microservices architecture** where each microservice maintains its own database and communicates via **Redis** for caching and message queuing.

- **Main Service**: User management and health data
- **Chat Microservice**: AI chat sessions and invitations with independent database
- **Redis**: Centralized caching layer and async communication

---

## Main Service Database

```eraser
users [icon: user, color: blue] {
  id string pk
  displayName string
  email string
  password string
  firstName string
  lastName string
  refreshToken string
  createdAt timestamp
  updatedAt timestamp
}

UserHealthData [icon: heart, color: red] {
  id string pk
  userId string fk
  height number
  weight number
  bloodType string
  allergies string
  medications string
  medicalHistory string
  lastCheckup timestamp
  createdAt timestamp
  updatedAt timestamp
}

UserVitals [icon: activity, color: pink] {
  id string pk
  userId string fk
  heartRate number
  bloodPressureSystolic number
  bloodPressureDiastolic number
  bloodOxygen number
  respiratoryRate number
  bodyTemperature number
  recordedAt timestamp
}

UserActivity [icon: zap, color: orange] {
  id string pk
  userId string fk
  date date
  steps number
  caloriesBurned number
  activeMinutes number
  distance number
  floors number
  stressLevel string
  bodyBattery number
  hydration number
}

UserSleep [icon: moon, color: purple] {
  id string pk
  userId string fk
  date date
  totalHours number
  deepSleep number
  lightSleep number
  remSleep number
  sleepQuality number
  bedtime timestamp
  wakeTime timestamp
}

UserPreferences [icon: settings, color: gray] {
  id string pk
  userId string fk
  age number
  relationshipStatus string
  workStatus string
  workType string
  sports string
  hobbies string
  therapyGoals string
  preferredCommunication string
  notificationsEnabled boolean
  theme string
}

users ||--|| UserHealthData : "has"
users ||--o{ UserVitals : "tracks"
users ||--o{ UserActivity : "logs"
users ||--o{ UserSleep : "records"
users ||--|| UserPreferences : "configures"
```

### Main Service Relationships

- **Users**: Core user authentication and profile data
- **UserHealthData**: Medical information, allergies, medications
- **UserVitals**: Real-time vital signs (heart rate, BP, oxygen, etc.)
- **UserActivity**: Daily activity metrics (steps, calories, distance)
- **UserSleep**: Sleep tracking and quality analysis
- **UserPreferences**: User settings and therapy preferences

---

## Chat Microservice Database

```eraser
Chat [icon: message-circle, color: green] {
  id string pk
  userId string fk
  duration number
  startedAt timestamp
  endedAt timestamp
  sessionType string
  moodBefore string
  moodAfter string
  summary string
  status string
}

AIResponse [icon: cpu, color: teal] {
  id string pk
  chatId string fk
  question string
  response string
  createdAt timestamp
  modelUsed string
  confidenceScore number
  processingTime number
}

Invite [icon: mail, color: yellow] {
  inviteId string pk
  inviterId string fk
  inviteeId string fk
  type string
  status string
  sentAt timestamp
  respondedAt timestamp
}

Chat ||--o{ AIResponse : "contains"
users.id <> Invite.inviterId
users.id <> Invite.inviteeId
```

### Chat Microservice Relationships

- **Chat**: AI therapy session records with mood tracking
- **AIResponse**: Individual Q&A within chat sessions with confidence scoring
- **Invite**: User invitations for shared therapy sessions

---

## Redis Cache Layer

```eraser
redis [icon: database, color: orange] {
  users:cache
  health:vitals
  activity:daily
  sleep:records
  chat:sessions
  ai:responses
  invites:pending
  auth:tokens
}
```

### Redis Usage

- **Session Management**: Storing active chat sessions and user sessions
- **Authentication Tokens**: JWT tokens and refresh tokens
- **Real-time Health Data**: Caching latest vitals and activity metrics
- **AI Response Cache**: Frequently accessed AI responses
- **Rate Limiting**: Request throttling and API limits
- **Distributed Locks**: Preventing race conditions across services

---

## Inter-Service Communication

- **Main Service** → **Chat Microservice**: Validates user and health context via Redis cache
- **Chat Microservice** → **Main Service**: Fetches user health data for personalized AI responses
- **Both Services**: Publish events to Redis pub/sub for real-time synchronization

### Message Queue Topics

- `chat.started` - When a new AI therapy session begins
- `chat.ended` - When a chat session ends
- `health.updated` - When vitals or activity data is updated
- `invite.sent` - When an invitation is sent
- `invite.accepted` - When an invitation is accepted
- `ai.response.cached` - When AI response is cached for reuse

---

## Data Flow Example

1. **User opens app** → Main Service fetches user + health data from DB → Caches in Redis
2. **User starts chat** → Chat Microservice retrieves user context from Redis → Processes with AI
3. **AI generates response** → Cached in Redis → Saved to Chat DB → Sent to user
4. **Health metrics updated** → Main Service updates DB → Invalidates Redis cache → Publishes event
