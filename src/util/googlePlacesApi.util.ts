import axios from 'axios';
import { PlaceResponseDto } from '../place/dto/place-response.dto';
import { plainToInstance } from 'class-transformer';
import { Place } from 'src/place/entities/place.entity';

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

export function mapGoogleDtoToPlaceEntity(dto: PlaceResponseDto): Place {
  const displayName = dto.displayName?.text || '';
  const primaryTypeDisplayName = dto.primaryTypeDisplayName?.text || '';
  const weekdayDescriptions =
    dto.regularOpeningHours?.weekdayDescriptions || [];
  const photo = dto.photos?.[0]?.googleMapsUri || '';
  const reviews = dto.reviews || [];
  const firstFiveReviews = reviews.slice(0, 5).map((r) => ({
    rating: r.rating,
    text: r.text || '',
  }));

  const place = new Place();
  place.id = dto.id;
  place.displayName = displayName;
  place.formattedAddress = dto.formattedAddress || '';
  place.primaryTypeDisplayName = primaryTypeDisplayName;
  place.photos = photo ? [photo] : [];
  place.weekdayDescriptions = weekdayDescriptions;
  place.userRatingCount = dto.userRatingCount ?? 0;
  place.reviews = firstFiveReviews;
  place.nationalPhoneNumber = dto.nationalPhoneNumber || '';

  return place;
}
