import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  // 사용자 생성
  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const member = this.memberRepository.create(createMemberDto);
    return this.memberRepository.save(member);
  }

  // 이메일 존재 여부 확인
  async existByEmail(email: string): Promise<boolean> {
    const count = await this.memberRepository.count({ where: { email } });
    return count > 0;
  }

  // 이메일 사용자 조회 (로그인 시 password가 필요한 경우)
  async findOneByEmailWithPassword(
    email: string,
  ): Promise<Pick<Member, 'id' | 'email' | 'password'> | null> {
    return this.memberRepository
      .createQueryBuilder('member')
      .addSelect('member.password')
      .where('member.email = :email', { email })
      .getOne();
  }

  async findOneByEmail(email: string): Promise<Member | null> {
    return this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.routes', 'route')
      .select(['member.email', 'route'])
      .where('member.email = :email', { email })
      .getOne();
  }
}
