import axios, { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { PlaceResponseDto } from './dto/place-response.dto';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

  // 검색어 기반 장소 검색
  async searchPlaces(searchText: string) {
    const url = 'https://places.googleapis.com/v1/places:searchText';
    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress',
    };
    const data = {
      textQuery: searchText,
      languageCode: 'ko',
    };

    const response = await axios.post(url, data, { headers });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  }
  // id 기반 장소 검색
  async getPlaceDetails(id: string): Promise<Place> {
    // 1) DB에서 먼저 조회
    let place = await this.placeRepository.findOne({ where: { id } });

    if (place) {
      // 2) 있으면 바로 반환
      console.log('DB에서 장소 조회');
      return place;
    }

    // 3) 없으면 외부 API 호출
    const response: AxiosResponse<PlaceResponseDto> = await axios.get(
      `https://places.googleapis.com/v1/places/${id}?languageCode=ko`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
          'X-Goog-FieldMask': [
            'id',
            'displayName.text',
            'formattedAddress',
            'primaryTypeDisplayName',
            'photos',
            'regularOpeningHours.weekdayDescriptions',
            'rating',
            'userRatingCount',
            'nationalPhoneNumber',
          ].join(','),
        },
      },
    );

    const data = response.data;

    // 1) 중첩된 값 꺼내기
    const displayName = data.displayName?.text || '';
    const primaryTypeDisplayName = data.primaryTypeDisplayName?.text || '';
    const weekdayDescriptions =
      data.regularOpeningHours?.weekdayDescriptions || [];
    const photo = data.photos?.[0]?.googleMapsUri || ''; // 첫 번째 사진의 URI

    // 2) 엔티티 생성
    place = this.placeRepository.create({
      id: data.id,
      displayName, // '구석집'
      formattedAddress: data.formattedAddress || '',
      primaryTypeDisplayName, // '음식점'
      photos: photo ? [photo] : [],
      weekdayDescriptions, // 배열 형태
      userRatingCount: data.userRatingCount ?? 0,
      review: '', // 없으면 빈 문자열
      nationalPhoneNumber: data.nationalPhoneNumber || '',
    });
    // 6) DB에 저장
    await this.placeRepository.save(place);
    console.log('DB에 장소 저장');
    // 7) 저장된 엔티티 반환
    return place;
  }
}
