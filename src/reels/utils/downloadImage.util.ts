import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * S3 이미지 URL을 다운로드해서 로컬에 저장
 */
export async function downloadImage(
  imageUrl: string,
  localPath: string,
): Promise<void> {
  const response = await axios({ url: imageUrl, responseType: 'stream' });
  const writer = fs.createWriteStream(localPath);
  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * 로컬 이미지와 영상을 FFmpeg로 합성
 */
export async function createVideoWithImage(
  inputPath: string,
  imageUrl: string,
  duration: number,
  outputPath: string,
): Promise<void> {
  console.log('🔧 downloading image from', imageUrl);

  const tempDir = './assets/temp/image_cache';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempImagePath = `${tempDir}/overlay_${Date.now()}.png`;

  try {
    await downloadImage(imageUrl, tempImagePath);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .input(tempImagePath)
        .setStartTime(0)
        .setDuration(duration)
        .complexFilter([
          {
            filter: 'scale',
            inputs: '[1:v]',
            outputs: 'scaledOverlay',
            options: { w: 'iw*0.5', h: 'ih*0.5' },
          },
          {
            filter: 'overlay',
            inputs: ['[0:v]', 'scaledOverlay'],
            options: {
              x: '(main_w-overlay_w)/2',
              y: '(main_h-overlay_h)/2 - 300',
            },
          },
        ])
        .output(outputPath)
        .on('end', () => {
          fs.unlinkSync(tempImagePath);
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg Error:', err.message);
          if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
          reject(err);
        })
        .run();
    });
  } catch (err) {
    if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
    throw new Error(`❌ Failed to create video with image: ${err.message}`);
  }
}
