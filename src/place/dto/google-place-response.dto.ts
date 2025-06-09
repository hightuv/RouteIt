export class GooglePlaceResponseDto {
  id: string;

  displayName?: {
    text: string;
  };

  formattedAddress: string;
}
