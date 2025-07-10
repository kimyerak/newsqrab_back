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
      const fileName = `${i}_${speakerKey}.mp3`;
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

    const assContent = generateASS(subtitles, conversation.title);
    const assFilePath = `./assets/subtitles/${conversationId}.ass`;
    fs.writeFileSync(assFilePath, assContent);

    // // 🔥 제목 자막도 저장
    // const titleASSContent = generateTitleASS(conversation.title);
    // if (!conversation.title) {
    //   console.error('❌ conversation.title is missing!');
    // } else {
    //   console.log('✅ conversation.title:', conversation.title);
    // }
    // const titleASSPath = `./assets/subtitles/${conversationId}_title.ass`;

    // try {
    //   fs.writeFileSync(titleASSPath, titleASSContent);
    //   console.log('✅ Title ASS file saved at:', titleASSPath);
    // } catch (e) {
    //   console.error('❌ Failed to write title ASS file:', e);
    // }

    if (!fs.existsSync(assFilePath)) {
      throw new NotFoundException(`TTS audio file not found: ${assFilePath}`);
    }

    return assFilePath;
  }
}
