import { Type } from 'class-transformer';
import { IsDate, IsString, ValidateNested } from 'class-validator';
import { PlaceResponseDto } from 'src/place/dto/place-response.dto';
import { TagResponseDto } from 'src/tag/dto/tag-response.dto';

export class RouteResponseDto {
  @IsString()
  name: string;

  @IsString()
  username: string;

  @Type(() => PlaceResponseDto)
  places: PlaceResponseDto[]; // 추후 PlaceResponseDto로 변환

  @ValidateNested({ each: true })
  @Type(() => TagResponseDto)
  tags: TagResponseDto[];

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
