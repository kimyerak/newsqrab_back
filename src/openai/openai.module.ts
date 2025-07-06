// src/openai/openai.module.ts
import { Module } from '@nestjs/common';
import { OpenAiService } from './openai.service';
import { ImageGenerationService } from './image-generation.service';
import { S3Module } from '../s3/s3.module'; // ✅ S3Service 사용 시 필요

@Module({
  imports: [S3Module], // S3Service를 주입받기 위해 필요
  providers: [OpenAiService, ImageGenerationService],
  exports: [OpenAiService, ImageGenerationService], // 외부에서 사용 가능하게 export
})
export class OpenAiModule {}
