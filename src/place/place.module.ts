import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Place } from './entities/place.entity';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Place])],
  controllers: [PlaceController],
  providers: [PlaceService],
  exports: [PlaceService],
})
export class PlaceModule {}
