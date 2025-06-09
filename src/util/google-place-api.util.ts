import axios, { AxiosResponse } from 'axios';
import { PlaceResponseDto } from '../place/dto/place-response.dto';
import { plainToInstance } from 'class-transformer';
import { GooglePlaceResponseDto } from 'src/place/dto/google-place-response.dto';
import {
  GOOGLE_FIELDS_SEARCH,
  GOOGLE_FIELDS_DETAILS,
  GOOGLE_SEARCH_URL,
  GOOGLE_PLACE_DETAILS_URL,
} from '../constant/place.constant';

// 검색어에 해당하는 장소 검색 함수
export async function searchPlacesFromGoogle(
  searchText: string,
): Promise<GooglePlaceResponseDto[]> {
  const url = GOOGLE_SEARCH_URL;
  const headers = getGoogleHeaders(GOOGLE_FIELDS_SEARCH);
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
  const url = `${GOOGLE_PLACE_DETAILS_URL}${id}?languageCode=ko`;
  const headers = getGoogleHeaders(GOOGLE_FIELDS_DETAILS);

  try {
    const response = await axios.get(url, { headers });
    return plainToInstance(PlaceResponseDto, response.data);
  } catch (error) {
    console.error(`Google API 호출 실패: `, error);
    throw new Error('Google API 호출 중 오류가 발생했습니다.');
  }
}

// 구글 API 호출 시 필요한 헤더 반환 함수
function getGoogleHeaders(fieldmask: string) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY가 설정되어 있지 않습니다.');
  }
  return {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': fieldmask,
  };
}
