import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ConversationService } from './conversation.service';

@ApiTags('Conversation') // Swagger에서 그룹화될 이름
@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('generate/original')
  @ApiOperation({ summary: '기사에서 original 대화 생성' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { articleId: { type: 'string' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Original 대화 생성 성공' })
  async generateOriginal(@Body('articleId') articleId: string) {
    return this.conversationService.generateOriginalConversation(articleId);
  }

  @Post('generate/user-modified')
  @ApiOperation({ summary: '유저 요청 기반 user-modified 대화 생성' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        parentId: { type: 'string' },
        userRequest: { type: 'string' },
        articleId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User-modified 대화 생성 성공' })
  async generateUserModified(
    @Body('parentId') parentId: string,
    @Body('userRequest') userRequest: string,
    @Body('articleId') articleId: string,
  ) {
    return this.conversationService.generateUserModifiedConversation(
      parentId,
      userRequest,
      articleId,
    );
  }
}
