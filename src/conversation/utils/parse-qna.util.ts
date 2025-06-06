// ✅ parse-qna.util.ts
export function parseQnAScript(
  text: string,
  character1: string,
  character2: string,
): { [key: string]: string }[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const script = [];

  for (const line of lines) {
    if (line.startsWith(`${character1}:`)) {
      script.push({ [character1]: line.replace(`${character1}:`, '').trim() });
    } else if (line.startsWith(`${character2}:`)) {
      script.push({ [character2]: line.replace(`${character2}:`, '').trim() });
    }
  }

  return script;
}
