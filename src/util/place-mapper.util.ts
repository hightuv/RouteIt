import { PlaceResponseDto } from '../place/dto/place-response.dto';
import { Place } from '../place/entities/place.entity';

// Google API로부터 받아온 DTO => 내부 Entity 변환 함수
export function mapGoogleDtoToPlaceEntity(dto: PlaceResponseDto): Place {
  const displayName = dto.displayName?.text || '';
  const formattedAddress = dto.formattedAddress || '';
  const primaryTypeDisplayName = dto.primaryTypeDisplayName?.text || '';
  const photos = dto.photos?.[0]?.googleMapsUri
    ? [dto.photos[0].googleMapsUri]
    : [];
  const weekdayDescriptions =
    dto.regularOpeningHours?.weekdayDescriptions || [];
  const userRatingCount = dto.userRatingCount ?? 0;
  const reviews = (dto.reviews || []).slice(0, 5).map((r) => ({
    rating: r.rating,
    text: r.text || '',
  }));
  const nationalPhoneNumber = dto.nationalPhoneNumber || '';

  const place = new Place();
  place.id = dto.id;
  place.displayName = displayName;
  place.formattedAddress = formattedAddress;
  place.primaryTypeDisplayName = primaryTypeDisplayName;
  place.photos = photos;
  place.weekdayDescriptions = weekdayDescriptions;
  place.userRatingCount = userRatingCount;
  place.reviews = reviews;
  place.nationalPhoneNumber = nationalPhoneNumber;

  return place;
}
