// prompts/prompt_article.ts

export const CHARACTER_STYLE = {
  crab: {
    name: '크랩이',
    role: '답변자',
    mbti: 'ENFJ',
    voice: '중고음, 따뜻한 감성, 신뢰감 있는',
    style: '긍정적이고 에너지 넘치며 정보를 능숙하게 전달하는 리더형',
    example: '괜찮아, 내가 정리해줄게! 이건 우리가 꼭 알아야 해.',
  },
  octopus: {
    name: '큐리어스',
    role: '답변자',
    mbti: 'ISTJ',
    voice: '중저음, 차분한, 현실적인',
    style: '냉철하고 통찰력 있는 백과사전형 설명',
    example: '예상된 결과야. 기술은 늘 앞서가.',
  },
  bok: {
    name: '큐복이',
    role: '질문자',
    mbti: 'ISFP',
    voice: '느릿하고 순한 어버버 스타일',
    style: '공감을 잘하며 느릿한 말투를 가진 순한 캐릭터',
    example: '잘은 모르지만… 재밌어 보여…',
  },
  starfish: {
    name: '큐스타',
    role: '질문자',
    mbti: 'ENTP',
    voice: '빠르고 튀는 발랄한 목소리',
    style: '자기애 강하고 솔직한 관종형, 말이 빠름',
    example: '내가 왔다!!! 흥, 나 없었으면 어쩔 뻔~? 어머~ 이건 무조건 저장각!',
  },
} as const;

export function generateOriginalPrompt(
  content: string,
  characterA: keyof typeof CHARACTER_STYLE,
  characterB: keyof typeof CHARACTER_STYLE,
): string {
  const character1 = CHARACTER_STYLE[characterA];
  const character2 = CHARACTER_STYLE[characterB];

  return `
아래 뉴스 기사 내용을 바탕으로 두 캐릭터가 티키타카 형식으로 대화하는 QnA 요약 스크립트를 작성해주세요.

조건:
- 질문자 (${character1.name}): ${character1.style} (예: "${character1.example}")
- 답변자 (${character2.name}): ${character2.style} (예: "${character2.example}")
- 총 3개의 QnA로 구성해주세요. (각 QnA는 질문 + 대답 세트)
- 각 질문과 답변은 너무 길지 않게, 한두 문장 정도의 짧고 간결한 대사로 작성해주세요.
- 대사가 너무 설명식이 되지 않도록, 실제 캐릭터가 말하듯 자연스럽고 짧게 표현해주세요.
- 형식은 다음과 같이 작성해주세요:

${characterA}: [질문1]  
${characterB}: [답변1]  

${characterA}: [질문2]  
${characterB}: [답변2]  

${characterA}: [질문3]  
${characterB}: [답변3]  

- 대화만 출력하고, 다른 설명이나 문장은 쓰지 마세요.
- 모든 대사는 한국어로 작성해주세요.

뉴스 기사:
${content}
`;
}

export function generateUserModifiedPrompt(
  content: string,
  originalScript: string,
  userRequest: string,
  characterA: keyof typeof CHARACTER_STYLE,
  characterB: keyof typeof CHARACTER_STYLE,
): string {
  const character1 = CHARACTER_STYLE[characterA];
  const character2 = CHARACTER_STYLE[characterB];

  return `
아래 뉴스 기사 내용과 이전에 생성된 대사 스크립트 'original script' 를 참고해, 유저가 요청한 "${userRequest}" 스타일로 두 캐릭터의 QnA 대사를 새로 생성해주세요.
original script에서 너무 많은 변화를 주진말고, 그거 기반으로 유저 요청대로 조금씩만 수정해줘.

조건:
- 질문자 (${character1.name}): ${character1.style} (예: "${character1.example}")
- 답변자 (${character2.name}): ${character2.style} (예: "${character2.example}")
- 총 3개의 QnA로 구성해주세요. (각 QnA는 질문 + 대답 세트)
- 반드시 아래 형식을 정확히 지켜 작성:

${characterA}: [질문1]  
${characterB}: [답변1]  

${characterA}: [질문2]  
${characterB}: [답변2]  

${characterA}: [질문3]  
${characterB}: [답변3]  

- 대화만 출력하고, 다른 설명이나 문장은 쓰지 마세요.
- 모든 대사는 한국어로 작성해주세요.

뉴스 기사:
${content}

Original Script:
${originalScript}
`;
}
