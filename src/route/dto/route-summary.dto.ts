import { Expose, Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, ValidateNested } from 'class-validator';
import { TagResponseDto } from 'src/tag/dto/tag-response.dto';
import { UserSummaryDto } from 'src/user/dto/user-summary.dto';

export class RouteSummaryDto {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @Type(() => UserSummaryDto)
  user: UserSummaryDto;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TagResponseDto)
  tags: TagResponseDto[];

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}
