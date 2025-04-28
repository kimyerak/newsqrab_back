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
import { merge } from 'cheerio/lib/static';

const fs = require('fs');
const axios = require('axios');
import * as path from 'path';
const qs = require('qs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
@Injectable()
export class ReelsService {
  constructor(
    @InjectModel(Reels.name) private reelsModel: Model<Reels>,
    private readonly s3Service: S3Service,
  ) {}

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

  async findById(id: string): Promise<Reels> {
    const reels = await this.reelsModel.findById(id).exec();
    if (!reels) throw new NotFoundException('Reels not found');
    return reels;
  }

  async findByOwner(owner: string): Promise<Reels[]> {
    return this.reelsModel.find({ owner }).exec();
  }

  async incrementViews(id: string): Promise<void> {
    await this.reelsModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
  }

  async getReelsSortedByViews(): Promise<Reels[]> {
    return this.reelsModel.find().sort({ views: -1 }).exec();
  }

  // //이제 얜 필요없어질거임! createReelFromConversation이 얘를 대신할거!
  // async createReelFromArticle(article: Article): Promise<void> {
  //   // console.log('l', article.category);
  //   const createReelsDto = new CreateReelsDto();
  //   createReelsDto.owner = 'newsqrap';
  //   createReelsDto.articleId = [article._id as Types.ObjectId];
  //   createReelsDto.speak = await this.createAudioFromText(
  //     article.summary,
  //     createReelsDto.articleId,
  //   ); // tts mp3 파일의 object storage url
  //   createReelsDto.category = article.category;
  //   const reelsPath = await this.mergeVideoAndAudio(
  //     article.category,
  //     createReelsDto.articleId,
  //   );
  //   const reelsUrl = await this.uploadFileToStorage(reelsPath);
  //   createReelsDto.video = reelsUrl;
  //   const newReels = new this.reelsModel(createReelsDto);
  //   await newReels.save();
  // }

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
      responseType: 'stream',
    };
    try {
      console.log('try문 들어옴#################');
      const response = await axios(options);
      console.log('axios반응 받음#################');
      const filePath = `./assets/tts/${reelsId}.mp3`;
      console.log('저장경로설정함#################');
      const writer = fs.createWriteStream(filePath);
      console.log('fs로 저장#################');
      response.data.pipe(writer);
      console.log('pipe 작동#################');
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log('파일 쓰기 완료');
          resolve(filePath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error fetching TTS:', error);
      // throw error;
      return 'default-path.mp3';
    }
  }

  async mergeVideoAndAudio(
    category: string,
    reelsId: Types.ObjectId[],
  ): Promise<string> {
    ffmpeg.setFfmpegPath(ffmpegPath);
    const videoInputPath = `./assets/video/${category}.mp4`;
    const audioInputPath = `./assets/tts/${reelsId}.mp3`;
    const outputPath = `./assets/reels/${reelsId}.mp4`;

    try {
      return new Promise((resolve, reject) => {
        ffmpeg(videoInputPath)
          .input(audioInputPath)
          .outputOptions([
            '-map 0:v', // 비디오 파일의 비디오 스트림을 선택
            '-map 1:a', // 오디오 파일의 오디오 스트림을 선택
            '-c:v copy', // 비디오 코덱은 복사 (재인코딩 없음)
            '-c:a aac', // 오디오 코덱은 AAC로 설정
            '-strict experimental', // 일부 코덱에 필요한 경우
            '-shortest',
          ])
          .on('error', function (err) {
            console.log('An error occurred during merging: ' + err.message);
            reject(err);
          })
          .on('end', function () {
            console.log('Merging finished successfully!');
            resolve(outputPath);
          })
          .save(outputPath);
      });
    } catch (error) {
      console.error('Error during video and audio merging:', error);
      // throw new Error('Merging process failed.');
      return 'default-path.mp3';
    }
  }
  async uploadFileToStorage(filePath: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = 'video/mp4'; // Set MIME type for video
      const fakeFile: Express.Multer.File = {
        buffer: fileBuffer,
        originalname: path.basename(filePath),
        mimetype: mimeType,
        fieldname: 'file', // Typically the name of the form field (used in Multer)
        encoding: '7bit', // Common encoding for files
        size: fileBuffer.length,
        destination: '', // Optional: the folder to which the file has been saved
        filename: path.basename(filePath), // The name of the file within the destination
        path: filePath, // The full path to the uploaded file
        stream: fs.createReadStream(filePath), // A readable stream of the file
      };

      // Assuming `uploadFile` is properly configured to take an object similar to `Express.Multer.File`
      return await this.s3Service.uploadFile('reels', fakeFile);
    } catch (error) {
      console.error('Error uploading file to storage:', error);
      // throw new Error('File upload failed.');
      return 'default-path.mp3';
    }
  }
}
