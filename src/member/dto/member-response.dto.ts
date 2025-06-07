import { MemberRouteResponseDto } from './member-route-response.dto';

export class MemberResponseDto {
  email: string;
  name: string;
  route: MemberRouteResponseDto[];
}
