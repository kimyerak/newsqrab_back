// openai/image-generation.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ImageGenerationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  async generateImageFromPrompt(prompt: string): Promise<string | undefined> {
    const openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3', // 또는 'dall-e-2'
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url', // 또는 'b64_json'
      });

      const imageUrl = response.data[0]?.url;
      console.log('[🎨 생성된 이미지 URL]', imageUrl);
      return imageUrl;
    } catch (e) {
      console.error('OpenAI Image API Error:', e);
      return undefined;
    }
  }
  //s3에 생성된 이미지 업로드하는 함수
  async generateImageAndUpload(prompt: string): Promise<string | undefined> {
    const openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) return;

    // 이미지 다운로드
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(imageResponse.data, 'binary');

    // S3 업로드
    const uploadedUrl = await this.s3Service.uploadBuffer(
      'newscrab-thumbnails',
      buffer,
      'dalle-image.png',
      imageResponse.headers['content-type'],
    );

    return uploadedUrl;
  }
}
