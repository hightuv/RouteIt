import { Injectable } from '@nestjs/common';
import { Member } from 'src/member/entities/member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemberRepository extends Repository<Member> {
  async findByEmail(email: string): Promise<Member | null> {
    return this.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<Member | null> {
    return this.createQueryBuilder('member')
      .addSelect('member.password')
      .where('member.email = :email', { email })
      .getOne();
  }
}
