import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject('REDIS_TOKEN_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  // 사용자 생성
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username } = createUserDto;

    const existingUser = await this.findByUsername(username);

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  // 사용자 정보 조회
  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'password'],
    });
    return user;
  }

  async findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'name', 'refreshToken'],
      relations: {
        routes: {
          routePlaces: {
            place: true,
          },
          tags: true,
          user: true,
        },
      },
    });
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string | null) {
    const key = `userId:${userId}:refreshToken`;
    if (hashedRefreshToken) {
      // Redis 캐시 업데이트 (유효기간 1일)
      await this.redisClient.setex(
        key,
        Number(process.env.REFRESH_CACHE_EXPIRED_IN),
        hashedRefreshToken,
      );
    } else {
      await this.redisClient.del(key);
    }
  }

  async getHashedRefreshToken(userId: number): Promise<string | null> {
    const key = `refresh_token:${userId}`;
    return await this.redisClient.get(key);
  }
}
