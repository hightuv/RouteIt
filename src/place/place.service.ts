import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Place } from './entities/place.entity';
import {
  fetchPlaceDetailsFromGoogle,
  searchPlacesFromGoogle,
} from '../util/google-place-api.util';
import { mapGoogleDtoToPlaceEntity } from 'src/util/place-mapper.util';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,

    @Inject('REDIS_PLACE_CLIENT') // Redis 클라이언트 주입
    private readonly redisClient: Redis,
  ) {}

  // 검색어 기반 장소 검색 (Google Places API 활용)
  async searchPlaces(searchText: string): Promise<unknown> {
    try {
      return await searchPlacesFromGoogle(searchText);
    } catch (error) {
      console.error('Google 장소 검색 실패:', error);
      throw new InternalServerErrorException('장소 검색 중 오류가 발생했습니다.');
    }
  }

  // id 기반 장소 상세 조회 (DB 저장 포함), EntityManager 선택적 사용 가능
  async getPlaceDetails(id: string, manager?: EntityManager): Promise<Place> {
    try {
      const key = `placeId:${id}:place`;

      // Redis 캐시 조회
      const cached = await this.redisClient.get(key);
      if (cached) {
        console.log(`캐시에서 장소 조회: ${id}`);
        return JSON.parse(cached) as Place;
      }

      // DB 조회 - manager가 있으면 그것으로, 없으면 기본 repository 사용
      const placeRepository = manager?.getRepository(Place) ?? this.placeRepository;
      let place = await placeRepository.findOne({ where: { id } });
      if (place) {
        console.log('DB에서 장소 조회');
        return place;
      }

      // Google Places API 호출
      const data = await fetchPlaceDetailsFromGoogle(id);
      place = mapGoogleDtoToPlaceEntity(data);

      // DB 저장
      await placeRepository.save(place);
      console.log('DB에 장소 저장');

      // Redis 캐시에 저장 (유효기간 1일)
      await this.redisClient.setex(
        key,
        Number(process.env.PLACE_CACHE_EXPIRTE_IN),
        JSON.stringify(place),
      );
      console.log('Google Places API 결과를 캐시에 저장');

      return place;
    } catch (error) {
      console.error('getPlaceDetails error:', error);
      throw new InternalServerErrorException('장소 상세 조회 중 오류가 발생했습니다.');
    }
  }
}
