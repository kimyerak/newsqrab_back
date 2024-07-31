import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Reels } from './reels.schema';
import { CreateReelsDto } from './dto/create-reels.dto';
import { UpdateReelsDto } from './dto/update-reels.dto';
import { Article } from '../article/article.schema';
import { S3Service } from '../s3/s3.service';
import { Readable } from 'stream';
const fs = require('fs');
const axios = require('axios');
const qs = require('qs');

@Injectable()
export class ReelsService {
  constructor(
    @InjectModel(Reels.name) private reelsModel: Model<Reels>,
    private readonly s3Service: S3Service,
  ) { }

  async create(createReelsDto: CreateReelsDto): Promise<Reels> {
    // 기본 owner 값 설정
    const owner = createReelsDto.owner || 'newsqrap';

    const newReels = new this.reelsModel({
      ...createReelsDto,
      owner,
    });
    return newReels.save();
  }

  async update(id: string, updateReelsDto: UpdateReelsDto): Promise<Reels> {
    const updatedReels = await this.reelsModel
      .findByIdAndUpdate(id, updateReelsDto, { new: true })
      .exec();
    if (!updatedReels) {
      throw new NotFoundException(`Reels with ID ${id} not found`);
    }
    return updatedReels;
  }
  async findByDate(date: string): Promise<Reels[]> {
    // Assuming the 'createdAt' field exists and is in ISO format
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    return this.reelsModel
      .find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      })
      .exec();
  }

  async createReelFromArticle(
    article: Article,
    videoUrl: string,
  ): Promise<Reels> {
    // console.log('l', article.category);
    const createReelsDto = new CreateReelsDto();
    createReelsDto.owner = 'newsqrap';
    createReelsDto.articleId = [article._id as Types.ObjectId];
    createReelsDto.speak = await this.createAudioFromText(
      article.summary,
      createReelsDto.articleId,
    );
    createReelsDto.video = videoUrl;
    createReelsDto.category = article.category;

    return this.create(createReelsDto);
  }

  async createAudioFromText(
    summary: string,
    reelsId: Types.ObjectId[],
  ): Promise<string> {
    const clovaspeech_url =
      'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    console.log(summary);
    const options = {
      method: 'post',
      url: clovaspeech_url,
      data: qs.stringify({
        speaker: 'nara',
        volume: '0',
        speed: '-1',
        pitch: '0',
        text: summary,
        format: 'mp3',
      }),
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.X_NCP_APIGW_API_KEY_ID,
        'X-NCP-APIGW-API-KEY': process.env.X_NCP_APIGW_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      responseType: 'arraybuffer',
    };

    try {
      console.log('try문 들어옴#################');
      const response = await axios(options);
      console.log('axios반응 받음#################');
      const buffer = Buffer.from(response.data);

    // Mimic a Multer File
    const fakeFile: Express.Multer.File = {
      buffer: buffer,
      originalname: `tts${reelsId}_${Date.now()}.mp3`,
      mimetype: 'audio/mpeg',
      fieldname: 'file',
      encoding: '7bit',
      size: buffer.length,
      stream: new Readable({
        read() {
          this.push(buffer);
          this.push(null); // Signal end of stream
        }
      }),
      destination: '',
      filename: '',
      path: ''
    };

    return await this.s3Service.uploadFile('tts', fakeFile);
    } catch (error) {
      console.error('Error fetching TTS:', error);
      // throw error;
      return 'default-path.mp3';
    }
  }
}
