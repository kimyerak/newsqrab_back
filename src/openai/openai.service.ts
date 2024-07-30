import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OpenAiService {
  private readonly apiUrl: string = 'https://api.openai.com/v1/completions';

  constructor(private readonly configService: ConfigService) {}

  async generateText(prompt: string): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'text-davinci-003',
          prompt: prompt,
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate text from OpenAI');
    }
  }
}
