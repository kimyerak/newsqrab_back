import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenAiService {
  private readonly apiKey: string = '';
  private readonly apiUrl: string = 'https://api.openai.com/v1/completions';

  async generateText(prompt: string): Promise<string> {
    try {
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
            Authorization: `Bearer ${this.apiKey}`,
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
