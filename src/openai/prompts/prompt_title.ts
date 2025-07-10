/**
 * generateTitlePrompt - 기사 내용 기반으로 짧고 임팩트 있는 제목을 생성하는 프롬프트
 * - 조건: 한국어, 10자 이내, 키워드 2개 이상, 어그로는 끌되 가짜뉴스처럼 보이지 않게
 */
export function generateTitlePrompt(articleContent: string): string {
  return `
다음 뉴스 기사 내용을 바탕으로, 독자의 관심을 끌 수 있는 한국어 제목을 하나 지어줘.

조건:
- 반드시 **10자 이내**여야 해
- **핵심 키워드 2개 이상**을 포함해
- 어그로는 끌되, **가짜뉴스처럼 보이면 안 돼**
- 뉴스의 요지를 잘 반영해
- 단 하나의 문장으로만 응답해 (따옴표, 해설 없이)

기사 내용:
${articleContent}
  `.trim();
}
