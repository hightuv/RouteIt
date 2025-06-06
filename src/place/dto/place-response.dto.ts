export class PlaceResponseDto {
  id: string;

  displayName?: {
    text: string;
  };

  formattedAddress: string;

  primaryTypeDisplayName?: {
    text: string;
    languageCode?: string;
  };

  photos?: {
    googleMapsUri: string;
  }[];

  regularOpeningHours?: {
    weekdayDescriptions: string[];
  };

  userRatingCount: number;

  reviews?: {
    rating: number;
    text: string;
  }[];

  nationalPhoneNumber: string;
}
