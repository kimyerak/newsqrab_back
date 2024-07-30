import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ description: 'The title of the article' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The URL of the article' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'The full content of the article' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The author of the article' })
  @IsString()
  @IsNotEmpty()
  author: string;
}
