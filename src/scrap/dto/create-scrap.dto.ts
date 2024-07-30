import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScrapDto {
  @ApiProperty({ description: 'Title of the scrap' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'URL of the scrap' })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({ description: 'Date of the scrap' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ description: 'User ID of the scrap owner' })
  @IsNotEmpty()
  @IsString()
  userId: string; // 변경: ObjectId -> string

  @ApiProperty({ description: 'Article ID related to the scrap' })
  @IsNotEmpty()
  @IsString()
  articleId: string; // 변경: ObjectId -> string

  @ApiProperty({ description: 'Text highlighted by the user', required: false })
  @IsOptional()
  @IsString()
  highlightedText?: string;

  @ApiProperty({
    description: 'Emoji added by the scrap owner',
    required: false,
  })
  @IsOptional()
  @IsString()
  myemoji?: string;
}
