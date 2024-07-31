import { IsString, IsOptional, IsMongoId, IsNumber } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CommentDto {
  @ApiProperty({ description: 'User ID of the commenter' })
  @IsMongoId()
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Nickname of the commenter' })
  @IsString()
  nickname: string;

  @ApiProperty({
    description: 'Profile picture URL of the commenter',
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({ description: 'Content of the comment' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Number of likes on the comment', default: 0 })
  @IsNumber()
  likes: number = 0;
}
