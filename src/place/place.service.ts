import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { PlaceResponseDto } from './dto/place-response.dto';
import {
  fetchPlaceDetailsFromGoogle,
  searchPlacesFromGoogle,
} from '../util/googlePlacesApi.util';

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
  async getPlaceDetails(id: string): Promise<Place> {
    let place = await this.placeRepository.findOne({ where: { id } });
    if (place) {
      console.log('DB에서 장소 조회');
      return place;
    }

    const data: PlaceResponseDto = await fetchPlaceDetailsFromGoogle(id);

    const displayName = data.displayName?.text || '';
    const primaryTypeDisplayName = data.primaryTypeDisplayName?.text || '';
    const weekdayDescriptions =
      data.regularOpeningHours?.weekdayDescriptions || [];
    const photo = data.photos?.[0]?.googleMapsUri || '';
    const reviews = data.reviews || [];
    const firstFiveReviews = reviews.slice(0, 5).map((r) => ({
      rating: r.rating,
      text: r.text || '',
    }));

    place = this.placeRepository.create({
      id: data.id,
      displayName,
      formattedAddress: data.formattedAddress || '',
      primaryTypeDisplayName,
      photos: photo ? [photo] : [],
      weekdayDescriptions,
      userRatingCount: data.userRatingCount ?? 0,
      reviews: firstFiveReviews,
      nationalPhoneNumber: data.nationalPhoneNumber || '',
    });

    await this.placeRepository.save(place);
    console.log('DB에 장소 저장');
    return place;
  }
}
