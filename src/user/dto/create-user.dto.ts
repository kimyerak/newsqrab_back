import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'The password of the user', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'The nickname of the user' })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({ description: 'A short bio of the user', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    type: [String],
    description: 'IDs of followed users',
    required: false,
  })
  @IsArray()
  @IsOptional()
  following?: Types.ObjectId[];

  @ApiProperty({
    type: [String],
    description: 'IDs of followers',
    required: false,
  })
  @IsArray()
  @IsOptional()
  followers?: Types.ObjectId[];

  @ApiProperty({
    type: [String],
    description: 'IDs of scraps',
    required: false,
  })
  @IsArray()
  @IsOptional()
  scraps?: Types.ObjectId[];
}
