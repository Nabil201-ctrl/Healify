import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RabbitMQService } from '../services/rabbitmq.service';
import { CacheService } from '../services/cache.service';

class SendMessageDto {
  message: string;
  sessionId?: string;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly cacheService: CacheService,
  ) {}

  @Post('send')
  async sendMessage(@Request() req, @Body() sendMessageDto: SendMessageDto) {
    const userId = req.user.userId;
    const { message, sessionId } = sendMessageDto;

    try {
      // Send request to chat microservice via RabbitMQ
      const newSessionId = await this.rabbitMQService.sendChatRequest(
        userId,
        message,
        sessionId,
      );

      // Store session info in cache
      await this.cacheService.storeChatSession(newSessionId, {
        userId,
        message,
        status: 'processing',
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        sessionId: newSessionId,
        message: 'Your request is being processed by AI',
      };
    } catch (error) {
      console.error('Failed to send chat message:', error);
      return {
        success: false,
        message: 'Failed to process your request',
        error: error.message,
      };
    }
  }

  @Get('session/:sessionId')
  async getSessionStatus(@Param('sessionId') sessionId: string) {
    try {
      const session = await this.cacheService.getChatSession(sessionId);

      if (!session) {
        return {
          success: false,
          message: 'Session not found or expired',
        };
      }

      return {
        success: true,
        session,
      };
    } catch (error) {
      console.error('Failed to get session status:', error);
      return {
        success: false,
        message: 'Failed to retrieve session',
        error: error.message,
      };
    }
  }

  @Get('history/:userId')
  async getChatHistory(@Request() req, @Param('userId') userId: string) {
    // Verify user can only access their own history
    if (req.user.userId !== userId) {
      return {
        success: false,
        message: 'Unauthorized',
      };
    }

    try {
      // TODO: Implement chat history retrieval from database
      return {
        success: true,
        history: [],
        message: 'Chat history retrieval not yet implemented',
      };
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return {
        success: false,
        message: 'Failed to retrieve chat history',
        error: error.message,
      };
    }
  }
}
