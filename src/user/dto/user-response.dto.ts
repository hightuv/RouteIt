import { Route } from 'src/route/entities/route.entity';

export class UserResponseDto {
  email: string;
  name: string;
  route: Route[];
}
