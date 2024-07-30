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
export class CreateUserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  _id: string;

  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @ApiProperty({ description: 'The nickname of the user' })
  nickname: string;

  @ApiProperty({
    description: 'The profile picture URL of the user',
    required: false,
  })
  profilePicture?: string;

  @ApiProperty({
    description: 'A short biography of the user',
    required: false,
  })
  bio?: string;

  @ApiProperty({ description: 'The date when the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the user was last updated' })
  updatedAt: Date;
}
