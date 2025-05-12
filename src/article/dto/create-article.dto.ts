import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ 
    description: '크롤링할 기사 URL',
    example: 'https://n.news.naver.com/article/088/0000941751?cds=news_media_pc&type=editn',
   })
  @IsString()
  @IsNotEmpty()
  url: string;
}
