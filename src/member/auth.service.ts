import { Injectable } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { MemberService } from './member.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly memberService: MemberService) {}

  async register(
    createMemberDto: CreateMemberDto,
  ): Promise<{ message: string }> {
    const { email, password, name } = createMemberDto;
    const isExist = await this.memberService.findOneByEmail(email);

    if (isExist) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }
    const hashedPassword: string = await bcrypt.hash(password, 10);

    await this.memberService.create({ email, name, password: hashedPassword });
    return { message: '회원가입 성공' };
  }

  async login(loginRequestDto: LoginRequestDto): Promise<string> {
    const user = await this.memberService.findOneByEmail(loginRequestDto.email);

    if (!user) {
      throw new Error('User not found');
    }

    return '로그인 성공';
  }
}
