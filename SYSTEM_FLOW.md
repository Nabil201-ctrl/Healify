# Healify System Flow - Chat & Authentication

## User Authentication & Chat Processing Flow

```eraser
User {
  Need health advice [type: event]
  Sign up/Login [type: activity, icon: user]
  Send chat message [type: activity, icon: message-circle]
  Receive AI response [type: event, icon: mail]
  Session completed [type: event]
}

Main Service {
  Authentication {
    Verify credentials [type: activity, icon: key]
    Credentials valid? [type: gateway, icon: x]
    Generate JWT tokens [type: activity, icon: shield]
    Store refresh token [type: activity, icon: database]
  }
  Chat Gateway {
    Validate JWT [type: activity, icon: lock]
    Create session [type: activity, icon: file-plus]
    Publish to queue [type: activity, icon: send]
    Cache session data [type: activity, icon: database]
  }
}

Chat Microservice {
  Message Processing {
    Consume from queue [type: activity, icon: inbox]
    Process with AI [type: activity, icon: cpu]
    Cache AI response [type: activity, icon: database]
    Publish response [type: activity, icon: message-square]
    Response sent [type: event]
  }
}

Redis Cache {
  Session storage [type: activity, icon: server]
  Token management [type: activity, icon: key]
  Response caching [type: activity, icon: zap]
}

Need health advice > Sign up/Login
Sign up/Login --> Verify credentials : User credentials
Verify credentials > Credentials valid?
Credentials valid? > Generate JWT tokens : Valid
Credentials valid? --> Session completed : Invalid credentials
Generate JWT tokens > Store refresh token
Store refresh token > Send chat message
Send chat message --> Validate JWT : Auth token
Validate JWT > Create session
Create session > Cache session data
Cache session data --> Session storage
Create session > Publish to queue
Publish to queue --> Consume from queue : Message via RabbitMQ
Consume from queue > Process with AI
Process with AI > Cache AI response
Cache AI response --> Response caching
Cache AI response > Publish response
Publish response --> Receive AI response : AI response via RabbitMQ
Publish response > Response sent
Receive AI response > Session completed
