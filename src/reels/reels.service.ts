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
import { Conversation } from '../conversation/conversation.schema';

import * as fs from 'fs';
const axios = require('axios');
import * as path from 'path';
const qs = require('qs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
ffmpeg.setFfprobePath(ffprobePath);
ffmpeg.setFfmpegPath(ffmpegPath);

const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');

@Injectable()
export class ReelsService {
  constructor(
    @InjectModel(Reels.name) private reelsModel: Model<Reels>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
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

  async getLatestReels() {
    return this.reelsModel.find().sort({ createdAt: -1 }).exec();
  }

  async createAudioFromText(
    sentence: string,
    speaker: string,
    filePath: string,
  ): Promise<string> {
    const clovaspeech_url =
      'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    const options = {
      method: 'post',
      url: clovaspeech_url,
      data: qs.stringify({
        speaker: speaker,
        volume: '0',
        speed: '-1',
        pitch: '0',
        text: sentence,
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
      const response = await axios(options);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          resolve(filePath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error fetching TTS:', error);
      return 'default-path.mp3';
    }
  }

  async concatAudioFiles(
    mp3Paths: string[],
    outputPath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      mp3Paths.forEach((filePath) => {
        command.input(filePath);
      });
      command
        .on('error', (err) => {
          console.error('Audio concat error', err);
          reject(err);
        })
        .on('end', () => {
          console.log('Audio concat success');
          resolve(outputPath);
        })
        .mergeToFile(outputPath, './temp');
    });
  }

  // 오디오 길이 측정 -> 캐릭터별 영상 길이 자를 때 사용
  async getAudioDuration(filePath: string): Promise<number> {
    const info = await ffprobe(filePath, { path: ffprobeStatic.path });
    const duration = info.streams[0].duration;
    return parseFloat(duration);
  }

  async extractVideoSegment(
    inputPath: string,
    startTime: number,
    duration: number,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(0)
        .setDuration(duration)
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  async mergeVideoSegments(
    chunkPaths: string[],
    outputPath: string,
  ): Promise<void> {
    const concatFilePath = path.resolve('./assets/temp/concat.txt');

    const concatList = chunkPaths
      .map((p) => `file '${path.resolve(p).replace(/\\/g, '/')}'`) // Windows 경로 슬래시 통일
      .join('\n');
    fs.writeFileSync(concatFilePath, concatList, { encoding: 'utf8' });

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatFilePath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy'])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  async createAudioFromConversation(conversatonId: string): Promise<string> {
    const audioPaths: string[] = [];
    const audioDurations: number[] = [];
    const videoChunks: string[] = [];
    const silencePath = './assets/tts/silence.mp3';

    const article = await this.conversationModel.findById(conversatonId).lean();
    const script = article.script;

    const folderPath = `./assets/tts/${conversatonId}`;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const tempVideoDir = `./assets/temp/${conversatonId}`;
    if (!fs.existsSync(tempVideoDir)) {
      fs.mkdirSync(tempVideoDir, { recursive: true });
    }

    for (let i = 0; i < script.length; i++) {
      const line = script[i];
      const speakerKey = Object.keys(line)[0];
      const sentence = line[speakerKey];

      const speakerMap = {
        user1: {
          speaker: 'ndain',
          videoSource: './assets/video/fish',
        },
        user2: {
          speaker: 'njinho',
          videoSource: './assets/video/crab',
        },
        user3: {
          speaker: 'nkyuwon',
          videoSource: './assets/video/octopus',
        },
        user4: {
          speaker: 'nminjeong',
          videoSource: './assets/video/starfish',
        },
      };

      const selected = speakerMap[speakerKey];

      if (!selected) {
        console.error(`Unknown speakerKey: ${speakerKey}`);
        // fallback 처리하거나 에러를 던질 수 있음
      }

      const speaker = selected.speaker;
      const videoSource = i%2 == 0? `${selected.videoSource}_up.mp4` : `${selected.videoSource}_down.mp4`;

      const filePath = `${folderPath}/${i}_${speakerKey}.mp3`;
      const audioPath = await this.createAudioFromText(
        sentence,
        speaker,
        filePath,
      );

      if (!fs.existsSync(audioPath)) {
        throw new NotFoundException(`${audioPath} not found`);
      }
      audioPaths.push(audioPath);

      const duration = await this.getAudioDuration(audioPath);
      audioDurations.push(duration);

      const videoChunkPath = `${tempVideoDir}/chunk_${i}.mp4`;
      await this.extractVideoSegment(videoSource, 0, duration, videoChunkPath);
      videoChunks.push(videoChunkPath);

      // if (i < script.length - 1) {
      //   // 자연스러운 대화를 위해 대사 사이에 1초 공백 삽입
      //   audioPaths.push(silencePath);
      // }
    }

    const mergedAudioPath = `${folderPath}/concat.mp3`;
    await this.concatAudioFiles(audioPaths, mergedAudioPath);

    const mergedVideoPath = `./assets/video/${conversatonId}_merged.mp4`;
    await this.mergeVideoSegments(videoChunks, mergedVideoPath);

    return mergedAudioPath;
  }

  async mergeVideoAndAudio(reelsId: string): Promise<string> {
    ffmpeg.setFfmpegPath(ffmpegPath);
    const videoInputPath = `./assets/video/${reelsId}_merged.mp4`;
    const audioInputPath = `./assets/tts/${reelsId}/concat.mp3`;
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
          .on('error', (err) => {
            console.log('An error occurred during merging: ' + err.message);
            reject(err);
          })
          .on('end', () => {
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

  /**
   * 🔥 예락 - 자막 추가 API용: 릴스에 ASS 자막 입히기
   */
  async mergeReelsWithSubtitles(
    conversationId: string,
  ): Promise<{ finalVideoPath: string }> {
    const inputVideo = `./assets/reels/${conversationId}.mp4`;
    const inputASS = `./assets/subtitles/${conversationId}.ass`;
    const outputPath = `./assets/final/${conversationId}_final.mp4`;

    if (!fs.existsSync(inputVideo))
      throw new NotFoundException('Reels 영상 파일이 없습니다');
    if (!fs.existsSync(inputASS))
      throw new NotFoundException('ASS 자막 파일이 없습니다');

    if (!fs.existsSync('./assets/final')) {
      fs.mkdirSync('./assets/final', { recursive: true });
    }

    return new Promise((resolve, reject) => {
      ffmpeg(inputVideo)
        .videoFilter(`ass=${inputASS}`)
        .outputOptions(['-c:v libx264', '-c:a copy', '-shortest'])
        .on('end', () => {
          console.log('✅ 최종 영상 병합 완료');
          resolve({ finalVideoPath: outputPath });
        })
        .on('error', (err) => {
          console.error('❌ 병합 오류:', err.message);
          reject(err);
        })
        .save(outputPath);
    });
  }

  // ✅ 최종 영상 업로드 및 DB에 저장
  async uploadFinalVideoAndSaveReels(
    conversationId: string,
    articleId: string,
    owner: string,
    character1: string,
    character2: string,
    createdBy: string, // 유저 ID 등
  ): Promise<Reels> {
    const finalVideoPath = `./assets/final/${conversationId}_final.mp4`;

    if (!fs.existsSync(finalVideoPath)) {
      throw new NotFoundException('Final video file not found');
    }

    const videoUrl = await this.uploadFileToStorage(finalVideoPath);

    const newReels = await this.reelsModel.create({
      conversationId,
      articleId,
      owner,
      character1,
      character2,
      reelsUrl: videoUrl,
      createdBy,
    });

    return newReels;
  }

  async getReelsDetails(reelsId: string) {
    console.log(reelsId);
    const reels = await this.reelsModel.findById(reelsId);
    console.log(reels);
    if (!reels) return null;

    const conversation = await this.conversationModel.findById(
      reels.conversationId.toString(),
    );
    console.log('conversation', conversation);
    const article = await this.articleModel.findById(
      reels.articleId.toString(),
    );
    console.log('article', article);

    if (!conversation || !article) return null;

    return {
      articleUrl: article.url,
      conversation,
      reels
    };
  }
}
