import { Controller, Get, Body, Param } from '@nestjs/common';
import { MemberService } from './member.service';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get(':email')
  findOneByEmail(@Param('email') email: string) {
    return this.memberService.findOneByEmail(email);
  }
}
