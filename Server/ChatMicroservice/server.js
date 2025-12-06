import express from "express";
import { EstablishConnection, getChannel, publishResponse, CHAT_QUEUE, AI_CONTEXT_QUEUE, AI_CONTEXT_REQUEST_QUEUE, HISTORY_REQUEST_QUEUE } from "./config/Mq.js";
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
        consumeHistoryRequests();
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

// MongoDB & Models
import mongoose from 'mongoose';
import { ChatSession } from './models/ChatSession.js';
import { ChatMessage } from './models/ChatMessage.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/healify_chat";
mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// RPC: Request Health Context from System AI
async function requestHealthContext(userId) {
    return new Promise(async (resolve, reject) => {
        const channel = getChannel();
        const correlationId = Math.random().toString() + Math.random().toString() + Math.random().toString();
        const replyTo = await channel.assertQueue('', { exclusive: true });

        console.log("Requesting health context for user:", userId);

        channel.consume(replyTo.queue, (msg) => {
            if (msg && msg.properties.correlationId === correlationId) {
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

// RPC Provider: Serve Chat History
async function consumeHistoryRequests() {
    const channel = getChannel();
    channel.consume(HISTORY_REQUEST_QUEUE, async (msg) => {
        if (msg) {
            const content = JSON.parse(msg.content.toString());
            console.log("Received history request:", content);

            const userId = content.userId;

            // Fetch history from MongoDB
            // Get all messages for this user, sorted by time
            const messages = await ChatMessage.find({ userId }).sort({ timestamp: 1 }).limit(50);

            const response = {
                history: messages.map(m => ({
                    id: m._id,
                    author: m.author === 'user' ? 'me' : 'other',
                    text: m.text,
                    timestamp: m.timestamp
                }))
            };

            // Send response back to the reply queue
            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify(response)),
                { correlationId: msg.properties.correlationId }
            );

            channel.ack(msg);
        }
    });
}

// AI Processing function
async function processAIRequest(message, userId, sessionId) {
    console.log(`Processing AI request for user ${userId}: ${message}`);

    // 1. Try to get context from Cache first (fastest)
    const redisKey = `user_context:${userId}`;
    let userContext = await getCachedResponse(redisKey);

    // 2. If not in cache, or to ensure freshness, request from System AI (RPC)
    const systemContext = await requestHealthContext(userId);

    if (systemContext) {
        userContext = { data: systemContext }; // Normalize structure
    }

    // Mock Response Logic
    const lowerMsg = message.toLowerCase();
    let responseText = "I'm here to help you stay healthy. How are you feeling today?";

    if (lowerMsg.includes('headache') || lowerMsg.includes('pain')) {
        responseText = "I'm sorry to hear that. Have you been drinking enough water today? Dehydration is a common cause of headaches.";
    } else if (lowerMsg.includes('tired') || lowerMsg.includes('fatigue')) {
        responseText = "Rest is important. My analysis shows your sleep quality was " + (userContext?.data?.insights?.includes('sleep') ? "low" : "okay") + " recently. Try to get to bed early tonight.";
    } else if (lowerMsg.includes('step') || lowerMsg.includes('walk')) {
        const steps = userContext?.data?.current?.steps || 0;
        responseText = `You've taken ${steps} steps today. ` + (steps < 5000 ? "Try to go for a short walk to reach your goal!" : "Great job staying active!");
    } else if (lowerMsg.includes('heart') || lowerMsg.includes('rate')) {
        const hr = userContext?.data?.current?.heartRate || "unknown";
        responseText = `Your latest heart rate reading is ${hr} bpm. ` + (hr > 100 ? "It's a bit high, maybe take a moment to relax." : "It looks normal.");
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        responseText = "Hello! I'm your Healify Assistant. I can help you track your health and answer questions.";
    }

    // Append Context Note if relevant
    if (userContext && userContext.data && userContext.data.insights && userContext.data.insights.length > 0) {
        responseText += `\n\n(Note: ${userContext.data.insights[0]})`;
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        response: responseText,
        confidence: 0.95,
        processingTime: 1000,
        model: "healify-mock-v1"
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

                    // 1. Save User Message to MongoDB
                    await ChatMessage.create({
                        sessionId,
                        userId,
                        author: 'user',
                        text: message,
                        timestamp: new Date()
                    });

                    // 2. Process with AI
                    const aiResponse = await processAIRequest(message, userId, sessionId);

                    // 3. Save AI Response to MongoDB
                    await ChatMessage.create({
                        sessionId,
                        userId,
                        author: 'ai',
                        text: aiResponse.response,
                        timestamp: new Date()
                    });

                    // 4. Cache the response in Redis for Main Server polling
                    await cacheResponse(sessionId, {
                        status: 'completed',
                        response: aiResponse.response,
                        metadata: aiResponse
                    });

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


