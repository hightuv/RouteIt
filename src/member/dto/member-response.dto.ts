import { Route } from 'src/route/entities/route.entity';

export class MemberResponseDto {
  email: string;
  name: string;
  route: Route[];
}
