export function generateImagePromptFromArticleContent(content: string): string {
  const summary =
    content.length > 250 ? content.slice(0, 250) + '...' : content;

  return `Create a cute, friendly cartoon-style illustration representing this news article summary: ${summary}`;
}
