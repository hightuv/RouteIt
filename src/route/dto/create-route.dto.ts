import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  placeIds: string[];

  @IsArray()
  @IsNumber({}, { each: true })
  tagIds: number[]; // Tag ID number 리스트가 넘어오게?

  @IsBoolean()
  isPublic: boolean;

  @IsNumber()
  memberId: number;
}
