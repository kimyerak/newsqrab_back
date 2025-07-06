import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './conversation.schema';
import { parseQnAScript } from './utils/parse-qna.util';
import { OpenAiService } from '../openai/openai.service';
import axios from 'axios';
import {
  CHARACTER_STYLE,
  generateOriginalPrompt,
  generateUserModifiedPrompt,
} from '../openai/prompts/prompt_article';
import { Article } from '../article/article.schema';
import { ConfigService } from '@nestjs/config';
import { ImageGenerationService } from '../openai/image-generation.service';
import { generatePromptFromCharacter2Lines } from '../openai/prompts/prompt_image'; // 새 프롬프트 함수

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(Article.name)
    private articleModel: Model<Article>,
    private readonly openAiService: OpenAiService,
    private readonly configService: ConfigService,
    private readonly imageGenerationService: ImageGenerationService,
  ) {}

  async generateOriginalConversation(
    articleId: string,
    character1: keyof typeof CHARACTER_STYLE,
    character2: keyof typeof CHARACTER_STYLE,
  ) {
    const article = await this.articleModel.findById(articleId);
    if (!article) throw new NotFoundException();

    const prompt = generateOriginalPrompt(
      article.content,
      character1,
      character2,
    );
    const gptResponse = await this.openAiService.generateText(prompt);
    const script = parseQnAScript(gptResponse, character1, character2);
    const updatedScript = [];

    for (const line of script) {
      if (line[character2]) {
        const prompt = generatePromptFromCharacter2Lines([line[character2]]);
        const imageUrl =
          await this.imageGenerationService.generateImageAndUpload(prompt);
        updatedScript.push({
          [character2]: line[character2],
          imageUrl,
        });
      } else {
        updatedScript.push(line); // user1 대사면 그대로
      }
    }

    const conversation = await this.conversationModel.create({
      script: updatedScript,
      type: 'original',
      parentId: new Types.ObjectId(),
      articleId: new Types.ObjectId(articleId),
      character1,
      character2,
      title: `${character2} explains the article`, // 예시 제목
    });

    conversation.parentId = new Types.ObjectId(conversation._id as string);
    await conversation.save();
    return conversation;
  }

  async generateUserModifiedConversation(
    parentId: string,
    userRequest: string,
    articleId: string,
    character1: keyof typeof CHARACTER_STYLE,
    character2: keyof typeof CHARACTER_STYLE,
  ) {
    const [article, parent] = await Promise.all([
      this.articleModel.findById(articleId),
      this.conversationModel.findById(parentId),
    ]);
    if (!article || !parent) throw new NotFoundException();

    const originalScriptText = parent.script
      .map((line) => `${Object.keys(line)[0]}: ${Object.values(line)[0]}`)
      .join('\n');

    const prompt =
      generateUserModifiedPrompt(
        article.content,
        originalScriptText,
        userRequest,
        character1,
        character2,
      ) + `\n\n유저 요청: ${userRequest}\n\n기존 대사:\n${originalScriptText}`;

    const gptResponse = await this.openAiService.generateText(prompt);
    const script = parseQnAScript(gptResponse, character1, character2);

    // ✅ 이미지 URL 복사
    const imageUrl = parent.script.find((line) => line.imageUrl)?.imageUrl;
    if (imageUrl) {
      for (const line of script) {
        if (line[character2]) {
          line.imageUrl = imageUrl;
        }
      }
    }

    return await this.conversationModel.create({
      script,
      type: 'user-modified',
      parentId: new Types.ObjectId(parentId),
      articleId: new Types.ObjectId(articleId),
      character1,
      character2,
    });
  }

  async generateRagModifiedConversation(
    articleId: string,
    parentId: string,
    character1: string,
    character2: string,
  ) {
    const [article, parent] = await Promise.all([
      this.articleModel.findById(articleId),
      this.conversationModel.findById(parentId),
    ]);
    if (!article || !parent) throw new NotFoundException();

    const originalScriptText = parent.script
      .map((line) => `${Object.keys(line)[0]}: ${Object.values(line)[0]}`)
      .join('\n');

    const ragServerUrl =
      this.configService.get<string>('RAG_SERVER_URL') ??
      'http://localhost:8000';

    const response = await axios.post(`${ragServerUrl}/rag`, {
      content: article.content,
      originalScript: originalScriptText,
      character1,
      character2,
    });

    const script = parseQnAScript(response.data.script, character1, character2);

    // ✅ 이미지 URL 복사
    const imageUrl = parent.script.find((line) => line.imageUrl)?.imageUrl;
    if (imageUrl) {
      for (const line of script) {
        if (line[character2]) {
          line.imageUrl = imageUrl;
        }
      }
    }

    return await this.conversationModel.create({
      script,
      type: 'rag-modified',
      parentId: new Types.ObjectId(parentId),
      articleId: new Types.ObjectId(articleId),
      character1,
      character2,
    });
  }
}
