export function generateReelsSpeakPrompt(
  articles: { title: string; summary: string }[],
): string {
  const articleSummaries = articles
    .map((article) => `Title: ${article.title}\nSummary: ${article.summary}`)
    .join('\n\n');

  return `
    Based on the following articles, generate a conversational script that an avatar could say in a video:

    ${articleSummaries}
  `;
}
