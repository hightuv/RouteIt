import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './member/user.module';
import { PlaceModule } from './place/place.module';
import { RouteModule } from './route/route.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TagModule } from './tag/tag.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: parseInt(configService.get('CACHE_TTL', '604800'), 10), // 7일
        max: parseInt(configService.get('CACHE_MAX', '1000'), 10),
      }),
    }),
    DatabaseModule,
    UserModule,
    PlaceModule,
    RouteModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
