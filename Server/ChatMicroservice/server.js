import express from "express";
import { EstablishConnection, getChannel, publishResponse, CHAT_QUEUE, AI_CONTEXT_QUEUE, AI_CONTEXT_REQUEST_QUEUE } from "./config/Mq.js";
import { createRedisConnection, cacheResponse, getCachedResponse } from "./config/Redis.js";


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
        consumeAIContextUpdates();
    } catch (error) {
        console.error("Failed to initialize services:", error);
        process.exit(1);
    }
}

// Consume AI context updates
async function consumeAIContextUpdates() {
    const channel = getChannel();
    channel.consume(AI_CONTEXT_QUEUE, async (msg) => {
        if (msg) {
            const content = JSON.parse(msg.content.toString());
            console.log("Received AI context update:", content);

            // Store context in Redis (key: user_context:{userId})
            if (content.userId) {
                const redisKey = `user_context:${content.userId}`;
                // Cache for 24 hours
                await cacheResponse(redisKey, content);
                console.log("Updated AI context for user:", content.userId);
            }

            channel.ack(msg);
        }
    });
}

// RPC: Request Health Context from System AI
async function requestHealthContext(userId) {
    return new Promise(async (resolve, reject) => {
        const channel = getChannel();
        const correlationId = Math.random().toString() + Math.random().toString() + Math.random().toString();
        const replyTo = await channel.assertQueue('', { exclusive: true });

        console.log("Requesting health context for user:", userId);

        channel.consume(replyTo.queue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                const content = JSON.parse(msg.content.toString());
                console.log("Received health context response:", content);
                resolve(content.context);
                channel.deleteQueue(replyTo.queue); // Cleanup
            }
        }, { noAck: true });

        channel.sendToQueue(
            AI_CONTEXT_REQUEST_QUEUE,
            Buffer.from(JSON.stringify({ userId, correlationId })),
            { correlationId, replyTo: replyTo.queue }
        );

        // Timeout after 2 seconds
        setTimeout(() => {
            resolve(null); // Return null on timeout
        }, 2000);
    });
}

// AI Processing function
async function processAIRequest(message, userId, sessionId) {
    console.log(`Processing AI request for user ${userId}: ${message}`);

    // 1. Try to get context from Cache first (fastest)
    const redisKey = `user_context:${userId}`;
    let userContext = await getCachedResponse(redisKey);

    // 2. If not in cache, or to ensure freshness, request from System AI (RPC)
    // For this "Two AI" architecture, we prefer querying the System AI directly for critical chats
    const systemContext = await requestHealthContext(userId);

    if (systemContext) {
        userContext = { data: systemContext }; // Normalize structure
    }

    let contextPrompt = "";
    if (userContext && userContext.data) {
        console.log("Using context for AI:", userContext.data);
        const insights = userContext.data.insights ? userContext.data.insights.join(", ") : "None";
        const hr = userContext.data.current?.heartRate || "Unknown";
        contextPrompt = `\n[System AI Context: Heart Rate: ${hr} bpm. Insights: ${insights}]`;
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        response: `AI Response to: ${message}${contextPrompt ? `\n\n(Based on System AI analysis: ${userContext.data.insights ? userContext.data.insights[0] : "Your health looks stable"})` : ""}`,
        confidence: 0.95,
        processingTime: 1000,
        model: "healify-ai-v2"
    };
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


