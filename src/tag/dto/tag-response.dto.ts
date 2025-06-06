import { IsString } from 'class-validator';

export class TagResponseDto {
  @IsString()
  name: string;
}
