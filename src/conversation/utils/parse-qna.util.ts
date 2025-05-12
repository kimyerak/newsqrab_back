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
    if (line.startsWith('user1:')) {
      script.push({ user1: line.replace('user1:', '').trim() });
    } else if (line.startsWith('user2:')) {
      script.push({ user2: line.replace('user2:', '').trim() });
    }
  }
  return script;
}
