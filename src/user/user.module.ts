import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { redisTokenProvider } from 'src/redis/redis.provider';
import { Route } from 'src/route/entities/route.entity';
import { RoutePlace } from 'src/route/entities/route-place.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { Place } from 'src/place/entities/place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Route, RoutePlace, Place, Tag])],
  controllers: [UserController],
  providers: [UserService, redisTokenProvider],
  exports: [UserService],
})
export class UserModule {}
