import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReelsDto {
  @ApiProperty({ description: 'Owner of the reels, e.g., a newspaper name' })
  @IsString()
  @IsNotEmpty()
  owner: string;

  @ApiProperty({
    description: 'Array of article IDs used in the reels',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  articleId: Types.ObjectId[];

  @ApiProperty({ description: 'The speech that the avatar will say' })
  @IsString()
  @IsNotEmpty()
  speak: string;

  @ApiProperty({ description: 'URL to the video stored in AWS S3' })
  @IsString()
  @IsNotEmpty()
  video: string;

  @ApiProperty({ description: 'The category determining the avatar type' })
  @IsString()
  @IsNotEmpty()
  category: string;
}
