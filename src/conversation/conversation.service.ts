// ✅ conversation.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from './conversation.schema';
import { Article } from '../article/article.schema';
import { parseQnAScript } from './parse-qna.util';
import { OpenAiService } from '../openai/openai.service';
import { PROMPT_SUMMARIZE_TEMPLATE } from '../openai/prompts/prompt_article';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    private readonly openAiService: OpenAiService,
  ) {}

  async generateConversationFromArticle(article: Article): Promise<void> {
    const prompt = PROMPT_SUMMARIZE_TEMPLATE.replace(
      '{content}',
      article.content,
    );
    const gptResponse = await this.openAiService.generateText(prompt);
    const script = parseQnAScript(gptResponse);
    console.log('[파싱된 script]', script);

    await this.conversationModel.create({ script });
    console.log('[✅ Conversation 새로 저장 완료!]');
  }
}
