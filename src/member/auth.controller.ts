import { Controller, Post, Body } from '@nestjs/common';
import { MemberService } from './member.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private readonly memberService: MemberService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  login(@Body() loginRequestDto: LoginRequestDto) {
    return this.authService.login(loginRequestDto);
  }

  @Post('register')
  async register(@Body() createMemberDto: CreateMemberDto): Promise<void> {
    await this.authService.register(createMemberDto);
  }
}
