import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      relations: ['routes'],
    });
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string | null) {
    return await this.userRepository.update(
      { id: userId },
      { refreshToken: hashedRefreshToken },
    );
  }
}
