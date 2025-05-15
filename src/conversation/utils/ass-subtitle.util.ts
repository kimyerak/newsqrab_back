// 📁 src/conversation/util/ass-subtitle.util.ts
export function generateASS(
  subtitles: { text: string; start: number; end: number }[],
): string {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans CJK KR,32,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,1,5,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const body = subtitles
    .map((sub, i) => {
      const start = secondsToAssTime(sub.start);
      const end = secondsToAssTime(sub.end);
      const escaped = sub.text.replace(/\n/g, '\\N').replace(/,/g, '');
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${escaped}`;
    })
    .join('\n');

  return `${header}\n${body}`;
}

function secondsToAssTime(seconds: number): string {
  const hr = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100); // centiseconds
  return `${pad(hr)}:${pad(min)}:${pad(sec)}.${pad(cs)}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
