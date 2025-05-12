export const PROMPT_SUMMARIZE_TEMPLATE = `
아래 뉴스 기사 내용을 바탕으로 두 캐릭터가 티키타카 형식으로 대화하는 QnA 요약 스크립트를 작성해주세요.

조건:
- 질문자 (user1)는 호기심 많은 MZ세대 스타일로 말해주세요. (예: "헐 대박", "진짜?", "헉 그래서 어떻게 됐어?" 등)
- 답변자 (user2)는 시작해서 친절하고 쉽게 1~2문장으로 설명해주세요. (MZ세대도 잘 알아듣게! 쉽게!)
- 총 3개의 QnA로 구성해주세요. (각 QnA는 질문 + 대답 세트)
- 형식은 다음과 같이 작성해주세요:

user1: [질문1]  
user2: [답변1]  

user1: [질문2]  
user2: [답변2]  

- 대화만 출력하고, 다른 설명이나 문장은 쓰지 마세요.
- 모든 대사는 한국어로 작성해주세요.

Content: {content}
`;

export const PROMPT_USER_MODIFIED_TEMPLATE = `
아래 뉴스 기사 내용과 이전에 생성된 대사 스크립트 'original script' 를 참고해, 유저가 요청한 "{userRequest}" 스타일로 두 캐릭터의 QnA 대사를 새로 생성해주세요.
original script에서 너무 많은 변화를 주진말고, 그거 기반으로 유저 요청대로 조금씩만 수정해줘.

조건:
- 질문자 (user1): 호기심 많고 직설적
- 답변자 (user2): 친절하고 쉽게 설명
- 총 3개의 QnA로 구성해주세요. (각 QnA는 질문 + 대답 세트)
- 반드시 아래 형식을 정확히 지켜 작성:
user1: [질문1]  
user2: [답변1]  

user1: [질문2]  
user2: [답변2]  

- 대화만 출력하고, 다른 설명이나 문장은 쓰지 마세요.
- 모든 대사는 한국어로 작성해주세요.

Content:
{content}

Original Script:
{originalScript}
`;
