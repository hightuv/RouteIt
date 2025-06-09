import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    // decorator의 메타데이터를 읽음
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 핸들러에 IS_PUBLIC_KEY가 있으면 true 반환
      context.getClass(), // 핸들러에 없으면 클래스도 확인, IS_PUBLIC_KEY가 있으면 true 반환 (컨트롤러가 되겠지)
    ]);

    if (isPublic) return true; // true면 가드 통과
    return super.canActivate(context);
  }
}
