import { Controller, Get, Post, Body } from '@nestjs/common';
import { RabbitMQService } from '../services/rabbitmq.service';

@Controller('health')
export class HealthController {
  constructor(private readonly rabbitMQService: RabbitMQService) { }

  @Get()
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('activity')
  async getActivity() {
    return this.rabbitMQService.fetchHealthData('activity');
  }

  @Get('heart-rate')
  async getHeartRate() {
    return this.rabbitMQService.fetchHealthData('heart-rate');
  }

  @Post('sync')
  async syncHealthData(@Body() data: any) {
    console.log('Received health sync data:', data);
    await this.rabbitMQService.sendHealthSync(data);
    return { status: 'success' };
  }
}
