import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqplib.ChannelModel;
  private channel: amqplib.Channel;
  private readonly RABBITMQ_URL =
    process.env.RABBITMQ_URL || 'amqp://localhost';
  private readonly CHAT_QUEUE = 'chat_requests';
  private readonly RESPONSE_QUEUE = 'chat_responses';

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.connection = await amqplib.connect(this.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Assert queues
      await this.channel.assertQueue(this.CHAT_QUEUE, { durable: true });
      await this.channel.assertQueue(this.RESPONSE_QUEUE, { durable: true });

      console.log('RabbitMQ connected and queues asserted');

      // Start consuming responses
      this.consumeResponses();
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async sendChatRequest(userId: string, message: string, sessionId?: string) {
    const payload = {
      userId,
      message,
      sessionId: sessionId || `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    try {
      this.channel.sendToQueue(
        this.CHAT_QUEUE,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true },
      );
      console.log('Chat request sent to queue:', payload);
      return payload.sessionId;
    } catch (error) {
      console.error('Failed to send chat request:', error);
      throw error;
    }
  }

  private async consumeResponses() {
    try {
      await this.channel.consume(
        this.RESPONSE_QUEUE,
        async (msg) => {
          if (msg) {
            const response = JSON.parse(msg.content.toString());
            console.log('Received AI response:', response);

            // Process the response (e.g., store in cache, notify client via websocket)
            // You can emit events here or store in Redis for client polling

            this.channel.ack(msg);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      console.error('Failed to consume responses:', error);
    }
  }

  async disconnect() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('RabbitMQ disconnected');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
    }
  }
}
