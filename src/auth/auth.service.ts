import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    @Inject('REDIS_TOKEN_CLIENT') // Redis 클라이언트 주입
    private readonly redisClient: Redis,
  ) {}

  async login(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    // Argon2로 refreshToken 해싱
    const hashedRefreshToken = await argon2.hash(refreshToken);

    // DB에 해싱된 refreshToken 저장
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

    const key = `userId:${userId}:refreshToken`;

    // Redis에도 저장
    await this.redisClient.setex(
      key,
      Number(process.env.REFRESH_CACHE_EXPIRED_IN),
      refreshToken,
    );
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }
  async logout(userId: number) {
    await this.userService.updateHashedRefreshToken(userId, null);

    return {
      message: 'Logged Out Successfully',
    };
  }

  // Access Token 갱신과 동시에 RefreshToken도 갱신 (RTR - Refresh Token Rotation)
  async refreshToken(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return {
      id: user.id,
    };
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.userService.getHashedRefreshToken(userId);

    if (!hashedRefreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    const isRefreshTokenValid = await argon2.verify(hashedRefreshToken, refreshToken);

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    return {
      id: userId,
    };
  }
}
