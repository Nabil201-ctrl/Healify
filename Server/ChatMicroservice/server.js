import express from "express";
import { EstablishConnection, getChannel, publishResponse, CHAT_QUEUE } from "./config/Mq.js";
import { createRedisConnection, cacheResponse, getCachedResponse } from "./config/Redis.js";

// AI Processing function (placeholder - integrate your actual AI model)
async function processAIRequest(message, userId, sessionId) {
    // TODO: Integrate with your AI model (OpenAI, Anthropic, etc.)
    // For now, returning a mock response
    console.log(`Processing AI request for user ${userId}: ${message}`);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        response: `AI Response to: ${message}`,
        confidence: 0.95,
        processingTime: 1000,
        model: "healify-ai-v1"
    };
}

// Initialize connections
async function initializeServices() {
    try {
        // Connect to RabbitMQ
        await EstablishConnection();
        console.log("RabbitMQ channel established");
        
        // Connect to Redis
        await createRedisConnection();
        console.log("Redis connection established");
        
        // Start consuming messages
        consumeChatRequests();
    } catch (error) {
        console.error("Failed to initialize services:", error);
        process.exit(1);
    }
}

// Consume chat requests from queue
async function consumeChatRequests() {
    const channel = getChannel();
    
    channel.consume(
        CHAT_QUEUE,
        async (msg) => {
            if (msg) {
                try {
                    const request = JSON.parse(msg.content.toString());
                    console.log("Received chat request:", request);
                    
                    const { userId, message, sessionId, timestamp } = request;
                    
                    // Check cache first
                    let cachedResponse = await getCachedResponse(sessionId);
                    
                    let aiResponse;
                    if (cachedResponse) {
                        console.log("Using cached response for session:", sessionId);
                        aiResponse = cachedResponse;
                    } else {
                        // Process with AI
                        aiResponse = await processAIRequest(message, userId, sessionId);
                        
                        // Cache the response
                        await cacheResponse(sessionId, aiResponse);
                    }
                    
                    // Prepare response
                    const response = {
                        sessionId,
                        userId,
                        originalMessage: message,
                        aiResponse: aiResponse.response,
                        metadata: {
                            confidence: aiResponse.confidence,
                            processingTime: aiResponse.processingTime,
                            model: aiResponse.model,
                            cached: !!cachedResponse
                        },
                        timestamp: new Date().toISOString()
                    };
                    
                    // Publish response back to Main Server
                    await publishResponse(response);
                    
                    // Acknowledge message
                    channel.ack(msg);
                    
                    console.log(`Processed request for session ${sessionId}`);
                } catch (error) {
                    console.error("Error processing message:", error);
                    // Reject and requeue the message
                    channel.nack(msg, false, true);
                }
            }
        },
        { noAck: false }
    );
    
    console.log("Chat microservice is now consuming messages from queue...");
}

// Initialize Express app
const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "healthy", 
        service: "chat-microservice",
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Chat Microservice listening on port ${PORT}`);
    initializeServices();
});


