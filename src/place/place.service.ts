import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { PlaceResponseDto } from './dto/place-response.dto';
import {
  fetchPlaceDetailsFromGoogle,
  searchPlacesFromGoogle,
} from '../util/googlePlacesApi.util';
import { mapGoogleDtoToPlaceEntity } from 'src/util/placeMapper.util';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

  // 검색어 기반 장소 검색
  async searchPlaces(searchText: string) {
    return await searchPlacesFromGoogle(searchText);
  }

  // id 기반 장소 상세 조회 (DB 저장 포함)
  async getPlaceDetails(id: string, manager?: EntityManager): Promise<Place> {
    const placeRepository =
      manager?.getRepository(Place) || this.placeRepository;

    let place = await placeRepository.findOne({ where: { id } });
    if (place) {
      console.log('DB에서 장소 조회');
      return place;
    }

    const data: PlaceResponseDto = await fetchPlaceDetailsFromGoogle(id);

    place = mapGoogleDtoToPlaceEntity(data);

    await placeRepository.save(place);
    console.log('DB에 장소 저장');
    return place;
  }
}
