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

  review?: string;

  nationalPhoneNumber: string;
}
