import { Expose, Type } from 'class-transformer';
import { Route } from 'src/route/entities/route.entity';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => Route)
  routes?: Route[];

  refreshToken?: string;
}
