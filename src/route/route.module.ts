import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { Route } from './entities/route.entity';
import { RoutePlace } from './entities/route-place.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from 'src/place/entities/place.entity';
import { User } from 'src/user/entities/user.entity';
import { PlaceModule } from 'src/place/place.module';

@Module({
  imports: [TypeOrmModule.forFeature([Route, RoutePlace, Place, Tag, User]), PlaceModule],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
