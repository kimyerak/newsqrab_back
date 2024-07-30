import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  password: string;
}
export class LoginResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  _id: string;

  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @ApiProperty({ description: 'The nickname of the user' })
  nickname: string;
}
