import { CHARACTER_STYLE } from './prompt_article';

export function generateImagePromptFromLine(
  line: string,
  speaker: string,
): string {
  const character = CHARACTER_STYLE[speaker];
  return `“${line}” 이 대사를 말하고 있는 캐릭터 ${character.name}(${character.style})의 상황을 
사실적으로 묘사한 그림을 생성해줘. 배경은 현실적이고 감정은 "${character.voice}" 스타일로 표현해줘.`;
}
