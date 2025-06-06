import axios from 'axios';
import { PlaceResponseDto } from '../place/dto/place-response.dto';
import { plainToInstance } from 'class-transformer';

// 검색어에 해당하는 장소 검색 함수
export async function searchPlacesFromGoogle(
  searchText: string,
): Promise<unknown> {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
  };
  const data = {
    textQuery: searchText,
    languageCode: 'ko',
  };

  const response = await axios.post(url, data, { headers });
  return response.data;
}

// 특정 장소의 상세 정보 검색 함수
export async function fetchPlaceDetailsFromGoogle(
  id: string,
): Promise<PlaceResponseDto> {
  const url = `https://places.googleapis.com/v1/places/${id}?languageCode=ko`;

  const headers = {
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
      'reviews',
      'userRatingCount',
      'nationalPhoneNumber',
    ].join(','),
  };

  const response = await axios.get(url, { headers });
  return plainToInstance(PlaceResponseDto, response.data);
}
