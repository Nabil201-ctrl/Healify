import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the profile information of the currently authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-12-01T10:30:00.000Z',
        updatedAt: '2024-12-05T14:20:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
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
