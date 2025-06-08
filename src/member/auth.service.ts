import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { MemberService } from './member.service';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => MemberService))
    private readonly memberService: MemberService,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입 로직
  async register(
    createMemberDto: CreateMemberDto,
  ): Promise<{ message: string }> {
    const { email, password, name } = createMemberDto;
    const isExist = await this.memberService.existByEmail(email);

    if (isExist) {
      throw new ConflictException('이미 등록된 이메일입니F다.');
    }
    const hashedPassword: string = await bcrypt.hash(password, 10);

    await this.memberService.create({ email, name, password: hashedPassword });
    return { message: '회원가입 성공' };
  }

  // 로그인 로직
  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = loginRequestDto;
    const isExist = await this.memberService.existByEmail(email);
    if (!isExist) {
      throw new UnauthorizedException('Unauthorized');
    }
    const user = await this.memberService.findOneByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Password not valid');
      throw new UnauthorizedException('Unauthorized');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return { token };
  }
}
