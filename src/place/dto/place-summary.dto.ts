import { Expose } from 'class-transformer';

export class PlaceSummaryDto {
  @Expose()
  id: number;

  @Expose()
  displayName?: string;

  @Expose()
  formattedAddress: string;
}
