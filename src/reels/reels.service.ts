import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Reels } from './reels.schema';
import { CreateReelsDto } from './dto/create-reels.dto';
import { UpdateReelsDto } from './dto/update-reels.dto';
import { Article } from '../article/article.schema';
const fs = require('fs');
const axios = require('axios');

@Injectable()
export class ReelsService {
  constructor(@InjectModel(Reels.name) private reelsModel: Model<Reels>) { }

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

  async createReelFromArticle(article: Article, videoUrl: string): Promise<Reels> {
    const createReelsDto = new CreateReelsDto();
    createReelsDto.owner = 'newsqrap';
    createReelsDto.articleId = [article._id as Types.ObjectId];
    createReelsDto.speak = await this.createAudioFromText(article.summary, createReelsDto.articleId);
    createReelsDto.video = videoUrl;
    createReelsDto.category = article.category;

    return this.create(createReelsDto);
  }

  async createAudioFromText(summary: string, reelsId: Types.ObjectId[]): Promise<string> {
    const clovaspeech_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    const options = {
      method: 'post',
      url: clovaspeech_url,
      data: {
        speaker: 'nara', volume: '0', speed: '-1', pitch: '0', text: summary, format: 'mp3'
      },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.X_NCP_APIGW_API_KEY_ID,
        'X-NCP-APIGW-API-KEY': process.env.X_NCP_APIGW_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'stream'
    };

    try {
      const response = await axios(options);
      const filePath = `./tts${reelsId}.mp3`;
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error fetching TTS:', error);
      throw error;
    }
    
  }
}
