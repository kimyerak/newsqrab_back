import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
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

  @ApiProperty({ description: 'The date of the article', required: false })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiProperty({ description: 'The photo URL of the article', required: false })
  @IsString()
  @IsOptional()
  photo?: string;

  @ApiProperty({ description: 'The category of the article', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'The summary of the article', required: false })
  @IsString()
  @IsOptional()
  summary?: string;
}
