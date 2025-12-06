title System flow
User {
  Need health advice [type: event, icon: stethoscope]
  Sign up/Login [type: activity, icon: user]
  Enter chat interface [type: activity, icon: message-square]
  Send chat message [type: activity, icon: message-circle]
  Receive AI response [type: event, icon: brain]
  Session completed [type: event, icon: check-circle]
}

WebApp {
  User Interface [type: activity, icon: monitor]
  API Gateway [type: gateway, icon: server]
  WebSocket Connection [type: activity, icon: radio]
}

Main Service {
  Authentication Service {
    Verify credentials [type: activity, icon: key]
    Credentials valid? [type: gateway, icon: x-circle]
    Generate JWT tokens [type: activity, icon: shield]
    Store refresh token [type: activity, icon: database]
    Return access token [type: event, icon: key]
  }
  
  Chat Gateway Service {
    Validate JWT [type: activity, icon: lock]
    Create session [type: activity, icon: file-plus]
    Forward to Chat Service [type: activity, icon: send]
    Cache session data [type: activity, icon: hard-drive]
    Return response [type: event, icon: reply]
  }

  Health Gateway Service {
    Validate Request [type: activity, icon: check]
    Publish Health Request [type: activity, icon: send]
    Publish Health Sync [type: activity, icon: refresh-cw]
    Await Response [type: activity, icon: clock]
    Return Data [type: event, icon: activity]
  }
}

Chat Microservice {
  Message Processing Engine {
    Consume from queue [type: activity, icon: inbox]
    Process with AI [type: activity, icon: cpu]
    Generate response [type: activity, icon: zap]
    Cache AI response [type: activity, icon: database]
    Publish response [type: activity, icon: message-square]
    Save to database [type: activity, icon: save]
  }
}

Health Microservice {
  Health Data Engine {
    Consume Health Request [type: activity, icon: inbox]
    Consume Health Sync [type: activity, icon: refresh-cw]
    Retrieve Data [type: activity, icon: database]
    Update Data [type: activity, icon: save]
    Analyze Vitals [type: activity, icon: activity]
    Format Response [type: activity, icon: file-text]
    Publish Health Response [type: activity, icon: send]
    Publish Notification [type: activity, icon: bell]
  }
}

Notification Microservice {
  Notification Engine {
    Consume Notification [type: activity, icon: bell]
    Format Alert [type: activity, icon: alert-circle]
    Send to User [type: activity, icon: send]
  }
}

AI Engine {
  NLP Processor [type: activity, icon: code]
  Model Inference [type: activity, icon: brain]
  Response Generation [type: activity, icon: edit-3]
  Quality Check [type: gateway, icon: filter]
}

Redis Cache Layer {
  Auth Storage [type: activity, icon: key]
  Session Cache [type: activity, icon: server]
  Response Cache [type: activity, icon: zap]
  Message Queue [type: activity, icon: inbox]
}

Database Layer {
  Users Database [type: activity, icon: users]
  Chat Sessions DB [type: activity, icon: message-circle]
  Health Data DB [type: activity, icon: heart]
}

Error Handler {
  Invalid credentials [type: event, icon: alert-triangle]
  Token expired [type: event, icon: clock]
  Service unavailable [type: event, icon: cloud-off]
  Timeout [type: event, icon: clock]
}

### Authentication Flow
Need health advice > Sign up/Login
Sign up/Login --> Verify credentials : User credentials
Verify credentials > Credentials valid?
Credentials valid? > Generate JWT tokens : Valid
Credentials valid? --> Invalid credentials : Invalid
Generate JWT tokens > Store refresh token
Store refresh token --> Auth Storage : Save refresh token
Store refresh token > Return access token
Return access token > Enter chat interface

### Chat Initiation
Enter chat interface --> User Interface : Load chat UI
User Interface > Send chat message : User types message
Send chat message --> API Gateway : HTTP Request + JWT
API Gateway --> Validate JWT : Forward to Auth Service
Validate JWT --> Auth Storage : Verify token
Auth Storage --> Validate JWT : Token valid
Validate JWT > Create session
Create session --> Session Cache : Store session data
Create session > Forward to Chat Service
Forward to Chat Service --> Message Queue : Publish message

### Health Data Sync & Retrieval
User Interface > Sync Health Data : Auto-sync on load
Sync Health Data --> API Gateway : POST /health/sync
API Gateway --> Health Gateway Service : Forward Sync Data
Health Gateway Service > Publish Health Sync : RabbitMQ
Publish Health Sync --> Message Queue : Health Sync Queue
Message Queue --> Consume Health Sync : Health Microservice
Consume Health Sync > Update Data
Update Data --> Health Data DB : Store Metrics
Update Data > Analyze Vitals
Analyze Vitals > Publish Notification : Abnormal Vitals
Analyze Vitals --> Consume Health Sync : Normal Vitals

User Interface > Request Health Data : Load Dashboard
Request Health Data --> API Gateway : GET /health/*
API Gateway --> Health Gateway Service : Forward Request
Health Gateway Service > Publish Health Request : RPC Call
Publish Health Request --> Message Queue : Health Request Queue
Message Queue --> Consume Health Request : Health Microservice
Consume Health Request > Retrieve Data
Retrieve Data --> Health Data DB : Fetch Metrics
Health Data DB --> Retrieve Data : Return Metrics
Retrieve Data > Format Response
Format Response > Publish Health Response
Publish Health Response --> Message Queue : Health Response Queue
Message Queue --> Await Response : Main Server
Await Response > Return Data
Return Data --> API Gateway : JSON Response
API Gateway --> User Interface : Display Charts

### Notification Flow
Publish Notification --> Message Queue : Notification Queue
Message Queue --> Consume Notification : Notification Microservice
Consume Notification > Format Alert
Format Alert > Send to User
Send to User --> User Interface : Push Notification

### AI Processing
Message Queue --> Consume from queue : Chat Service consumes
Consume from queue > Process with AI
Process with AI --> NLP Processor : Parse message
NLP Processor --> Model Inference : Process with AI model
Model Inference --> Response Generation : Generate response
Response Generation > Quality Check
Quality Check > Generate response : Quality passed
Quality Check --> Process with AI : Quality failed
Generate response > Cache AI response
Cache AI response --> Response Cache : Store in Redis
Cache AI response > Save to database
Save to database --> Chat Sessions DB : Persistent storage
Cache AI response > Publish response
Publish response --> WebSocket Connection : Real-time push
Publish response --> Return response : API response


### Response Delivery
WebSocket Connection --> Receive AI response : Push to client
Return response --> API Gateway : HTTP Response
API Gateway --> User Interface : Update UI
Receive AI response > Session completed

### Error Handling
Validate JWT --> Token expired : Expired token
Forward to Chat Service --> Service unavailable : Service down
Process with AI --> Service unavailable : AI service error
Await Response --> Timeout : Health Service Timeout
