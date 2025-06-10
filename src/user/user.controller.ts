import { Controller, Body, Post, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RequestWithUser } from '../auth/types/request-with-user.interface';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    const user = await this.userService.findOne(req.user.id);
    console.log(user);
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }
}
