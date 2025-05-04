import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'The nickname of the user', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: "The URL of the user's profile picture",
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    description: "The password of the user",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}