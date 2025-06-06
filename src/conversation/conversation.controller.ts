import { Controller, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ConversationService } from './conversation.service';
import { SubtitleService } from './subtitle.service';
import { CHARACTER_STYLE } from '../openai/prompts/prompt_article';

@ApiTags('Conversation') // Swagger에서 그룹화될 이름
@Controller('conversation')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly subtitleService: SubtitleService,
  ) {}

  @Post('generate/original')
  @ApiOperation({ summary: '1. GPT만으로 기사에서 original 대화 생성' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        articleId: { type: 'string' },
        character1: { type: 'string', example: '큐랩이' },
        character2: { type: 'string', example: '큐복이' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Original 대화 생성 성공' })
  async generateOriginal(
    @Body('articleId') articleId: string,
    @Body('character1') character1: keyof typeof CHARACTER_STYLE,
    @Body('character2') character2: keyof typeof CHARACTER_STYLE,
  ) {
    return this.conversationService.generateOriginalConversation(
      articleId,
      character1,
      character2,
    );
  }

  @Post('generate/user-modified')
  @ApiOperation({
    summary: '2. 유저 요청 기반 user-modified 대화 생성',
    description:
      '첫수정 요청시엔 original 대화의 ID가 parent. 수정 반복 시엔 직전 대화의 ID가 parent.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        parentId: { type: 'string' },
        userRequest: { type: 'string' },
        articleId: { type: 'string' },
        character1: { type: 'string', example: '큐랩이이' },
        character2: { type: 'string', example: '큐복이' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User-modified 대화 생성 성공' })
  async generateUserModified(
    @Body('parentId') parentId: string,
    @Body('userRequest') userRequest: string,
    @Body('articleId') articleId: string,
    @Body('character1') character1: keyof typeof CHARACTER_STYLE,
    @Body('character2') character2: keyof typeof CHARACTER_STYLE,
  ) {
    return this.conversationService.generateUserModifiedConversation(
      parentId,
      userRequest,
      articleId,
      character1,
      character2,
    );
  }

  @Post('generate/rag-modified')
  @ApiOperation({ summary: '3. RAG 기반 대사 수정 → rag-modified 생성' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        articleId: { type: 'string' },
        parentConversationId: { type: 'string' },
        character1: { type: 'string', example: '큐랩이' },
        character2: { type: 'string', example: '큐복이' },
      },
      required: ['articleId', 'parentConversationId'],
    },
  })
  @ApiResponse({ status: 201, description: 'RAG-modified 대화 생성 성공' })
  async generateRagModified(
    @Body('articleId') articleId: string,
    @Body('parentConversationId') parentConversationId: string,
    @Body('character1') character1: string,
    @Body('character2') character2: string,
  ) {
    return this.conversationService.generateRagModifiedConversation(
      articleId,
      parentConversationId,
      character1,
      character2,
    );
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: '대사 최종 컨펌 → ASS 자막 파일 저장' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'ASS 자막 파일 생성 완료' })
  async confirmFinalConversation(@Param('id') conversationId: string) {
    return this.subtitleService.saveASSFromConversation(conversationId);
  }
}
