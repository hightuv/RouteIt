import { Controller, Get, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':email')
  findOneByEmail(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }
}
