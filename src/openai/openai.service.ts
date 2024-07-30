import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from "openai";

@Injectable()
export class OpenAiService {
  // private readonly apiUrl: string = 'https://api.openai.com/v1/completions';

  constructor(private readonly configService: ConfigService) {}

  async generateText(prompt: string): Promise<string> {
    const openai = new OpenAI();
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a smart and helpful assistant." },
          { role: "user", content: prompt},
        ],
        model: "gpt-4o",
      });

      console.log(completion.choices[0].message.content);
      return completion.choices[0].message.content;

    } catch (e) {
      console.error('OpenAI API Error:', e);
    }
  }
}
