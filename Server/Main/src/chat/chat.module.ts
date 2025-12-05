import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { RabbitMQService } from '../services/rabbitmq.service';
import { CacheService } from '../services/cache.service';

@Module({
  controllers: [ChatController],
  providers: [RabbitMQService, CacheService],
  exports: [RabbitMQService, CacheService],
})
export class ChatModule {}
