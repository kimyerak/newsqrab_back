import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecretService {
  constructor(private configService: ConfigService) {}

  getAwsConfig() {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const region = this.configService.get<string>('AWS_REGION');
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');

    return { accessKeyId, secretAccessKey, region, bucketName };
  }

  getOpenAiKey(): string {
    return this.configService.get<string>('OPENAI_API_KEY');
  }
}
