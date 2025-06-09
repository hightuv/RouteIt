// Google API 요청 필드 목록 (검색어 기반)
export const GOOGLE_FIELDS_SEARCH =
  'places.id,places.displayName,places.formattedAddress';

// Google API 요청 필드 목록 (ID 기반)
export const GOOGLE_FIELDS_DETAILS = [
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
].join(',');

// Google 장소 검색 API 엔드포인트 URL
export const GOOGLE_SEARCH_URL =
  'https://places.googleapis.com/v1/places:searchText';

// Google 장소 상세 조회 API URL
export const GOOGLE_PLACE_DETAILS_URL =
  'https://places.googleapis.com/v1/places/';
