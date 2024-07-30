import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FollowerEmojiDto } from './update-scrap.dto';

export class UpdateFollowerEmojisResponseDto {
  @ApiProperty({ description: 'Unique identifier of the scrap' })
  @IsString()
  id: string;

  @ApiProperty({
    type: [FollowerEmojiDto],
    description: 'List of follower emojis',
  })
  @IsArray()
  followerEmojis: FollowerEmojiDto[];
}
