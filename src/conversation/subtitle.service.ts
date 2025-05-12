// src/conversation/subtitle.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from './conversation.schema';
import { getAudioDuration } from './utils/get-audio-duration';
import { generateASS } from './utils/ass-subtitle.util';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg = require('fluent-ffmpeg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class SubtitleService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}

  async createSubtitleVideo(
    conversationId: string,
    category: string,
  ): Promise<string> {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .lean();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const script = conversation.script;
    const audioDir = `./assets/tts/${conversationId}`;
    const durations: number[] = [];

    for (let i = 0; i < script.length; i++) {
      const speakerKey = Object.keys(script[i])[0];
      const fileName = `${conversationId}_${i}_${speakerKey}.mp3`;
      const filePath = path.join(audioDir, fileName);
      const duration = await getAudioDuration(filePath);
      durations.push(duration);
    }

    // ✅ 올바른 방식
    const subtitles = script.map((line, index) => {
      const text = Object.values(line)[0]; // "헉, ..." or "응, ..." 같은 대사
      const start = durations.slice(0, index).reduce((a, b) => a + b, 0);
      const end = start + durations[index];
      return { text, start, end };
    });

    const assContent = generateASS(subtitles);
    const assFilePath = `./assets/subtitles/${conversationId}.ass`;
    fs.writeFileSync(assFilePath, assContent);

    const videoInputPath = `./assets/video/${category}.mp4`;
    const outputVideoPath = `./assets/reels/${conversationId}_subtitled.mp4`;

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoInputPath)
        .outputOptions(`-vf`, `ass=${assFilePath}`)
        .on('error', reject)
        .on('end', () => resolve())
        .save(outputVideoPath);
    });

    return outputVideoPath;
  }

  async saveASSFromConversation(conversationId: string): Promise<string> {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .lean();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const script = conversation.script;
    const audioDir = `./assets/tts/${conversationId}`;
    const durations: number[] = [];

    for (let i = 0; i < script.length; i++) {
      const speakerKey = Object.keys(script[i])[0];
      const fileName = `${conversationId}_${i}_${speakerKey}.mp3`;
      const filePath = path.join(audioDir, fileName);
      const duration = await getAudioDuration(filePath);
      durations.push(duration);
    }

    const subtitles = script.map((line, index) => {
      const text = Object.values(line)[0];
      const start = durations.slice(0, index).reduce((a, b) => a + b, 0);
      const end = start + durations[index];
      return { text, start, end };
    });

    const assContent = generateASS(subtitles);
    const assFilePath = `./assets/subtitles/${conversationId}.ass`;
    fs.writeFileSync(assFilePath, assContent);

    return assFilePath;
  }
}
