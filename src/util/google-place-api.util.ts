import axios, { AxiosResponse } from 'axios';
import { PlaceResponseDto } from '../place/dto/place-response.dto';
import { plainToInstance } from 'class-transformer';
import { GooglePlaceResponseDto } from 'src/place/dto/google-place-response.dto';

// 검색어에 해당하는 장소 검색 함수
export async function searchPlacesFromGoogle(
  searchText: string,
): Promise<GooglePlaceResponseDto[]> {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const headers = getGoogleHeaders(
    'places.id,places.displayName,places.formattedAddress',
  );
  const data = {
    textQuery: searchText,
    languageCode: 'ko',
  };

  try {
    const response: AxiosResponse<{ places: GooglePlaceResponseDto[] }> =
      await axios.post(url, data, { headers });
    return response.data.places;
  } catch (error) {
    console.error('Google 장소 검색 실패:', error);
    throw new Error('장소 검색 중 문제가 발생했습니다.');
  }
}

// 특정 장소의 상세 정보 검색 함수
export async function fetchPlaceDetailsFromGoogle(
  id: string,
): Promise<PlaceResponseDto> {
  const url = `https://places.googleapis.com/v1/places/${id}?languageCode=ko`;

  const headers = getGoogleHeaders(
    [
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
  );

  try {
    const response = await axios.get(url, { headers });
    return plainToInstance(PlaceResponseDto, response.data);
  } catch (error) {
    console.error(`Google API 호출 실패: `, error);
    throw new Error('Google API 호출 중 오류가 발생했습니다.');
  }
}

function getGoogleHeaders(fieldmask: string) {
  return {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
    'X-Goog-FieldMask': fieldmask,
  };
}
