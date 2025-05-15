// ✅ conversation.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './conversation.schema';
import { parseQnAScript } from './utils/parse-qna.util';
import { OpenAiService } from '../openai/openai.service';
import axios from 'axios';
import {
  PROMPT_SUMMARIZE_TEMPLATE,
  PROMPT_USER_MODIFIED_TEMPLATE,
} from '../openai/prompts/prompt_article';
import { Article } from '../article/article.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(Article.name) // ✅ 이거 추가
    private articleModel: Model<Article>, // ✅ 이거 추가
    private readonly openAiService: OpenAiService,
    private readonly configService: ConfigService,
  ) {}

  // ✅ original 대사 생성
  async generateOriginalConversation(articleId: string): Promise<Conversation> {
    const article = await this.articleModel.findById(articleId).exec();
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const prompt = PROMPT_SUMMARIZE_TEMPLATE.replace(
      '{content}',
      article.content,
    );
    const gptResponse = await this.openAiService.generateText(prompt);
    const script = parseQnAScript(gptResponse);
    console.log('[🧩 original용 파싱된 Script]', script);

    const conversation = await this.conversationModel.create({
      script,
      type: 'original',
      parentId: new Types.ObjectId(), // 일단 저장 후 자기 id로 업데이트
      articleId: new Types.ObjectId(articleId),
    });

    // ✅ 2️⃣ parentId에 자기 자신 _id 넣기
    conversation.parentId = new Types.ObjectId(conversation._id as string);
    await conversation.save();

    console.log('[✅ Original Conversation 저장 완료!]', conversation._id);

    return conversation;
  }

  // ✅ user-modified 대사 생성
  async generateUserModifiedConversation(
    parentId: string,
    userRequest: string,
    articleId: string,
  ): Promise<Conversation> {
    const originalConversation = await this.conversationModel
      .findById(parentId)
      .exec();
    if (!originalConversation) {
      throw new NotFoundException('Parent conversation not found');
    }

    const article = await this.articleModel.findById(articleId).exec();
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 👉 parent의 script를 문자열로 변환
    const originalScriptText = originalConversation.script
      .map((pair) => {
        const [key, value] = Object.entries(pair)[0];
        return `${key}: ${value}`;
      })
      .join('\n');

    const prompt = PROMPT_USER_MODIFIED_TEMPLATE.replace(
      '{content}',
      article.content,
    )
      .replace('{userRequest}', userRequest)
      .replace('{originalScript}', originalScriptText);

    const gptResponse = await this.openAiService.generateText(prompt);
    console.log('[🧩 user-modifie GPT raw 응답]', gptResponse);

    const script = parseQnAScript(gptResponse);
    console.log('[🧩 user-modified용 파싱된 Script]', script);

    const conversation = await this.conversationModel.create({
      script,
      type: 'user-modified',
      parentId: new Types.ObjectId(parentId),
      articleId: new Types.ObjectId(articleId),
    });

    console.log('[✅ User-modified Conversation 저장 완료!]', conversation._id);
    return conversation;
  }

  // ✅ rag-modified 대사 생성 - 내가 parent의 예전 스크립트를 보내줘야함!!, 그리고 기사 보내야함!!!
  // }>(this.ragServerUrl, { content });
  async generateRagModifiedConversation(
    articleId: string,
    parentConversationId: string,
  ): Promise<Conversation> {
    // 1. 기사 본문 가져오기
    const article = await this.articleModel.findById(articleId).exec();
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 2. 기존 conversation 스크립트 가져오기
    const parent = await this.conversationModel
      .findById(parentConversationId)
      .exec();
    if (!parent) {
      throw new NotFoundException('Parent conversation not found');
    }

    // 3. 기존 대사 → 문자열로 변환 ("user1: ...\nuser2: ..." 형식)
    const originalScriptText = parent.script
      .map((line) => {
        const [key, value] = Object.entries(line)[0];
        return `${key}: ${value}`;
      })
      .join('\n');

    // 4. RAG 서버에 본문과 스크립트 모두 전송
    const ragServerUrl =
      this.configService.get<string>('RAG_SERVER_URL') ??
      'http://localhost:8000';

    let ragScriptText = '';
    try {
      const response = await axios.post<{ script: string }>(
        `${ragServerUrl}/rag`,
        {
          content: article.content,
          originalScript: originalScriptText,
        },
      );

      ragScriptText = response.data.script;
      console.log('[✅ RAG 응답]', ragScriptText);
    } catch (err) {
      console.error('❌ RAG 서버 호출 실패:', err.message);
      throw new Error('RAG server communication failed');
    }

    // 5. 응답 파싱 및 저장
    const parsedScript = parseQnAScript(ragScriptText);
    const newConversation = await this.conversationModel.create({
      script: parsedScript,
      type: 'rag-modified',
      parentId: new Types.ObjectId(parentConversationId),
      articleId: new Types.ObjectId(articleId),
    });

    return newConversation;
  }
}
