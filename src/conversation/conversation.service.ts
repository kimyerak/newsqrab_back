// ✅ conversation.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from './conversation.schema';
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

  async generateConversationFromContent(
    content: string,
  ): Promise<Conversation> {
    const prompt = PROMPT_SUMMARIZE_TEMPLATE.replace('{content}', content);
    const gptResponse = await this.openAiService.generateText(prompt);
    const script = parseQnAScript(gptResponse);
    console.log('[파싱된 script]', script);

    const conversation = await this.conversationModel.create({ script });
    console.log('[✅ Conversation 새로 저장 완료!]');
    return conversation;
  }

  async findById(id: string): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(id).exec();
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }
}
