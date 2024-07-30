import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FollowerEmojiDto {
  @ApiProperty({ description: 'ID of the user who added the emoji' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Emoji added by the user' })
  @IsString()
  emoji: string;
}

export class UpdateScrapDto {
  @ApiProperty({
    description: 'Emoji added by the scrap owner',
    required: false,
  })
  @IsOptional()
  @IsString()
  myemoji?: string;

  @ApiProperty({
    description: 'List of emojis added by followers',
    type: [FollowerEmojiDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FollowerEmojiDto)
  followerEmojis?: FollowerEmojiDto[];

  @ApiProperty({ description: 'Nickname of the scrap owner', required: false })
  @IsOptional()
  @IsString()
  usernickname?: string; // 추가

  @ApiProperty({
    description: 'Profile picture URL of the scrap owner',
    required: false,
  })
  @IsOptional()
  @IsString()
  profilePicture?: string; // 추가
}
