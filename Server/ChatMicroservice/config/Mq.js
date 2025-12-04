import amqlib from "amqplib";

async function EstablishConnection() {
    try {
        const connection = await amqlib.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();
        await channel.assertQueue("chatQueue", { durable: true });
        console.log("Connected to RabbitMQ");
        return channel;
    } catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
        throw error;
    }
}

export default EstablishConnection;