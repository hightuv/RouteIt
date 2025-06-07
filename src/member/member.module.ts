import { Module, forwardRef } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { AuthModule } from './auth.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), forwardRef(() => AuthModule)],
  controllers: [MemberController, AuthController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
