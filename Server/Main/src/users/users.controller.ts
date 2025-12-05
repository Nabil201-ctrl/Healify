import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req.user as { userId: string };
    const currentUser = await this.usersService.findOneById(user.userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }
    // Convert to plain object and map _id to id
    const userObj = currentUser.toObject ? currentUser.toObject() : currentUser;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, _id, __v, ...result } = userObj as any;
    return {
      ...result,
      id: _id.toString(),
    };
  }
}
