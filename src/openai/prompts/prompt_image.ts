export function generatePromptFromCharacter2Lines(lines: string[]): string {
  const summary = lines.join(' ').slice(0, 300); // DALL·E friendly: 요약 제한
  return `Create a cute cartoon-style illustration that represents the following explanation without any text or labels in the image: "${summary}"`;
}
