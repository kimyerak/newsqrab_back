import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateArticleDto {
  @ApiProperty({
    description: 'A short summary of the article',
    required: false,
  })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ description: 'The category of the article', required: false })
  @IsString()
  @IsOptional()
  category?: string;
}
