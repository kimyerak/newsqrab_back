import { IsString, IsOptional, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiProperty({ description: 'The username of the user', required: false })
  @IsString()
  @IsOptional()
  username?: string;

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
    description: 'A short biography of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;
}

export class UpdateUserActivityDto {
  @ApiProperty({
    description: 'Array of user IDs that this user is following',
    type: [String], // Swagger에서 ObjectId를 String으로 표시
    required: false,
  })
  @IsArray()
  @IsOptional()
  following?: Types.ObjectId[];

  @ApiProperty({
    description: 'Array of user IDs that follow this user',
    type: [String], // Swagger에서 ObjectId를 String으로 표시
    required: false,
  })
  @IsArray()
  @IsOptional()
  followers?: Types.ObjectId[];

  @ApiProperty({
    description: 'Array of scrap IDs associated with the user',
    type: [String], // Swagger에서 ObjectId를 String으로 표시
    required: false,
  })
  @ApiProperty({ description: 'The number of followers' })
  follower_count: number;

  @ApiProperty({ description: 'The number of users the user is following' })
  following_count: number;

  @IsArray()
  @IsOptional()
  scraps?: Types.ObjectId[];
}
