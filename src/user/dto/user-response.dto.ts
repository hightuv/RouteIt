import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserSummaryDto } from './user-summary.dto';
import { RouteSummaryDto } from 'src/route/dto/route-summary.dto';

export class UserResponseDto extends UserSummaryDto {
  @Expose()
  username: string; // 아이디

  @Expose()
  email: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => RouteSummaryDto)
  routes?: RouteSummaryDto[];

  refreshToken?: string;
}
