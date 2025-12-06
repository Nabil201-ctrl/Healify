# Healify Database Schema - Microservices Architecture with Redis

## Architecture Overview

The system uses a **microservices architecture** where each microservice maintains its own database and communicates via **Redis** for caching and message queuing.

- **Main Service**: User management and health data
- **Chat Microservice**: AI chat sessions and invitations with independent database
- **Redis**: Centralized caching layer and async communication

---

## Main Service Database

```mermaid
erDiagram
    users {
        string id PK
        string displayName
        string email
        string password
        string firstName
        string createdAt
        string updatedAt
    }

    UserHealthData {
        string id PK
        string userId FK
        number height
        number weight
        string bloodType
        string allergies
        string medications
        string medicalHistory
        string lastCheckup
    }

    UserPreferences {
        string id PK
        string userId FK
        number age
        string relationshipStatus
        string workStatus
        string workType
        string sports
        string hobbies
        string therapyGoals
        string preferredCommunication
    }

    Chat {
        string id PK
        string userId FK
        number duration
        timestamp startedAt
        timestamp endedAt
        string sessionType
        string moodBefore
        string moodAfter
        string summary
    }

    AIResponse {
        string id PK
        string chatId FK
        string question
        string response
        timestamp createdAt
        string modelUsed
        number confidenceScore
    }

    Invite {
        string inviteId PK
        string inviterId FK
        string inviteeId FK
        string type
        string status
        timestamp sentAt
        timestamp respondedAt
    }

    UserActivity {
        string id PK
        string userId FK
        date date
        number steps
        number caloriesBurned
        number activeMinutes
        number distance
        number floors
        string stressLevel
        number bodyBattery
    }

    UserVitals {
        string id PK
        string userId FK
        timestamp recordedAt
        number heartRate
        number restingHeartRate
        number minHeartRate
        number maxHeartRate
        number avgHeartRate
    }

    UserSleep {
        string id PK
        string userId FK
        date date
        number totalDuration
        number deepSleepDuration
        number lightSleepDuration
        number remSleepDuration
        number sleepQuality
        timestamp bedtime
        timestamp wakeTime
    }

    redis {
        string users:cache
        string chat:sessions
        string invites:pending
        string auth:tokens
        string health:cache
        string ai:models
    }

    users ||--|| UserHealthData : "has health data"
    users ||--|| UserPreferences : "has preferences"
    
    users ||--o{ Chat : "initiates"
    Chat }o--|| users : "belongs to"
    
    users ||--o{ Invite : "sends as inviter"
    Invite }o--|| users : "inviter"
    
    users ||--o{ Invite : "receives as invitee"
    Invite }o--|| users : "invitee"
    
    Chat ||--o{ AIResponse : "generates"
    AIResponse }o--|| Chat : "belongs to"

    users ||--o{ UserActivity : "logs"
    users ||--o{ UserVitals : "tracks"
    users ||--o{ UserSleep : "records"
    
    users ||--o{ redis : "cached in"
    redis }|--|| users : "cache for"
    
    UserHealthData ||--o{ redis : "cached in"
    redis }|--|| UserHealthData : "cache for"
    
    Chat ||--o{ redis : "active sessions in"
    redis }|--|| Chat : "session cache for"
    
    Invite ||--o{ redis : "pending in"
    redis }|--|| Invite : "cache for"
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
