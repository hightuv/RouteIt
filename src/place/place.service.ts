import { EntityManager, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { PlaceResponseDto } from './dto/place-response.dto';
import {
  fetchPlaceDetailsFromGoogle,
  searchPlacesFromGoogle,
} from '../util/googlePlacesApi.util';
import { mapGoogleDtoToPlaceEntity } from 'src/util/placeMapper.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PlaceService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

  // 검색어 기반 장소 검색
  async searchPlaces(searchText: string) {
    return await searchPlacesFromGoogle(searchText);
  }

  // id 기반 장소 상세 조회 (DB 저장 포함)
  async getPlaceDetails(id: string, manager?: EntityManager): Promise<Place> {
    // 캐시 조회
    let place = await this.cacheManager.get<Place>(`place:${id}`);
    if (place) {
      console.log(`캐시에서 장소 조회: ${id}`);
      return place;
    }

    // DB 조회
    const placeRepository =
      manager?.getRepository(Place) || this.placeRepository;

    place = await placeRepository.findOne({ where: { id } });
    if (place) {
      console.log('DB에서 장소 조회');
      return place;
    }

    // Google Place API 조회
    const data: PlaceResponseDto = await fetchPlaceDetailsFromGoogle(id);

    // DTO 전환
    place = mapGoogleDtoToPlaceEntity(data);

    // DB 저장
    await placeRepository.save(place);
    console.log('DB에 장소 저장');

    await this.cacheManager.set(`place:${id}`, place);
    console.log('캐시에 장소 저장');
    return place;
  }
}
