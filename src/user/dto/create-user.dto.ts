import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty({ message: '이메일 주소를 입력하세요.' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  email: string;

  @IsNotEmpty({ message: '비밀번호를 입력하세요.' })
  @IsString()
  @MinLength(10, { message: '비밀번호는 최소 10자 이상이어야 합니다.' })
  password: string;

  @IsNotEmpty({ message: '이름을 입력하세요.' })
  @IsString()
  name: string;
}
