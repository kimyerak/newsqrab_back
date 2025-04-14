// ✅ parse-qna.util.ts
export function parseQnAScript(
  text: string,
): { user1?: string; user2?: string }[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const script = [];

  for (const line of lines) {
    if (line.startsWith('크랩이:')) {
      script.push({ user1: line.replace('크랩이:', '').trim() });
    } else if (line.startsWith('킹크랩:')) {
      script.push({ user2: line.replace('킹크랩:', '').trim() });
    }
  }
  return script;
}
