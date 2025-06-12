import { Expose } from 'class-transformer';
import { PlaceSummaryDto } from './place-summary.dto';

export class PlaceResponseDto extends PlaceSummaryDto {
  @Expose()
  primaryTypeDisplayName?: {
    text: string;
    languageCode?: string;
  };

  @Expose()
  photos?: {
    googleMapsUri: string;
  }[];

  @Expose()
  regularOpeningHours?: {
    weekdayDescriptions: string[];
  };

  @Expose()
  userRatingCount: number;

  @Expose()
  reviews?: {
    rating: number;
    text: string;
  }[];

  @Expose()
  nationalPhoneNumber: string;
}
