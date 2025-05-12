// 📁 src/conversation/util/get-audio-duration.ts
import * as mm from 'music-metadata';
import * as fs from 'fs';

export async function getAudioDuration(filePath: string): Promise<number> {
  const buffer = fs.readFileSync(filePath);
  const metadata = await mm.parseBuffer(buffer, 'audio/mpeg', {
    duration: true,
  });
  return metadata.format.duration || 0;
}
