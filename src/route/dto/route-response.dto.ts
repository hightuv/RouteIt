import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { PlaceResponseDto } from 'src/place/dto/place-response.dto';
import { RouteSummaryDto } from './route-summary.dto';

export class RouteResponseDto extends RouteSummaryDto {
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => PlaceResponseDto)
  places: PlaceResponseDto[];
}
