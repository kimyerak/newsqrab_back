import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const endpoint = new AWS.Endpoint(
      this.configService.get<string>('NCP_ENDPOINT'),
    );
    const region = this.configService.get<string>('NCP_REGION');
    const accessKeyId = this.configService.get<string>('NCP_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'NCP_SECRET_ACCESS_KEY',
    );

    this.bucketName = this.configService.get<string>('NCP_BUCKET_NAME');

    this.s3 = new AWS.S3({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(folder: string, file: Express.Multer.File): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const key = `${folder}/${uuidv4()}${fileExtension}`;

    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // 파일을 공개적으로 접근 가능하게 설정
      })
      .promise();

    return `https://${this.bucketName}.kr.object.ncloudstorage.com/${key}`;
  }
}
