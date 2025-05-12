import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
const ffmpegPath = ffmpegInstaller.path;

ffmpeg.setFfmpegPath(ffmpegPath);

// subtitleContent: string → generateASS(...)의 반환값
// filename: string → 저장할 파일 이름
export async function saveASSFile(
  subtitleContent: string,
  filename: string,
): Promise<string> {
  const outputDir = path.join(__dirname, './assets/subtitles');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${filename}.ass`);
  fs.writeFileSync(filePath, subtitleContent, 'utf8');
  return filePath;
}

/**
 * 영상 + 음성 + 자막(.ass)을 병합하여 최종 MP4 생성
 */
export async function mergeVideoAudioAndSubtitle(
  baseVideoPath: string, // ex: ./assets/video/news.mp4
  audioPath: string, // ex: ./assets/tts/abc123.mp3
  assSubtitlePath: string, // ex: ./assets/subtitles/abc123.ass
  outputPath: string, // ex: ./assets/reels/abc123_final.mp4
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(baseVideoPath)
      .input(audioPath)
      .videoFilter(`ass=${assSubtitlePath}`) // 💬 자막 입히기
      .outputOptions([
        '-map 0:v',
        '-map 1:a',
        '-c:v libx264', // 자막 덮어씌우려면 copy 불가 → re-encode 필요
        '-c:a aac',
        '-shortest',
      ])
      .on('end', () => {
        console.log('✅ 영상+오디오+자막 병합 완료!');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ 병합 실패:', err.message);
        reject(err);
      })
      .save(outputPath);
  });
}
