import amqlib from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const CHAT_QUEUE = "chat_requests";
const RESPONSE_QUEUE = "chat_responses";

let connection = null;
let channel = null;

async function EstablishConnection() {
    try {
        connection = await amqlib.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        
        // Assert both queues
        await channel.assertQueue(CHAT_QUEUE, { durable: true });
        await channel.assertQueue(RESPONSE_QUEUE, { durable: true });
        
        console.log("Connected to RabbitMQ and queues asserted");
        return channel;
    } catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
        throw error;
    }
}

function getChannel() {
    if (!channel) {
        throw new Error("RabbitMQ channel not initialized. Call EstablishConnection first.");
    }
    return channel;
}

async function publishResponse(response) {
    try {
        const ch = getChannel();
        ch.sendToQueue(
            RESPONSE_QUEUE,
            Buffer.from(JSON.stringify(response)),
            { persistent: true }
        );
        console.log("Response published to queue:", response.sessionId);
    } catch (error) {
        console.error("Failed to publish response:", error);
        throw error;
    }
}

export { EstablishConnection, getChannel, publishResponse, CHAT_QUEUE, RESPONSE_QUEUE };