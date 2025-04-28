// src/user/dto/create-user.dto.ts
//이게 새로운버전!!!!!!!!!!!!!! 25.4.28
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}
