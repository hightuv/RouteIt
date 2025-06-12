import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { redisPlaceProvider } from 'src/redis/redis.provider';

dotenv.config();

@Module({
  imports: [TypeOrmModule.forFeature([Place]), ConfigModule],
  controllers: [PlaceController],
  providers: [PlaceService, redisPlaceProvider],
  exports: [PlaceService],
})
export class PlaceModule {}
