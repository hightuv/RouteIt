import { Controller, Post, Body } from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginRequestDto);
  }

  @Post('register')
  async register(@Body() createMemberDto: CreateMemberDto): Promise<void> {
    await this.authService.register(createMemberDto);
  }
}
