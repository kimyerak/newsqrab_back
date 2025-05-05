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

  @Post('generate')
  @ApiOperation({
    summary: 'OpenAI로 대화 생성',
    description: '주어진 content로 대화 스크립트를 생성합니다.',
  })
  @ApiBody({
    schema: { type: 'object', properties: { content: { type: 'string' } } },
  })
  @ApiResponse({ status: 201, description: '대화 생성 성공' })
  async generate(@Body('content') content: string) {
    return this.conversationService.generateConversationFromContent(content);
  }

  @Get(':id')
  @ApiOperation({
    summary: '대화 조회',
    description: '대화 ID로 저장된 대화를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: '대화 MongoDB ObjectId',
  })
  @ApiResponse({ status: 200, description: '대화 조회 성공' })
  async findById(@Param('id') id: string) {
    return this.conversationService.findById(id);
  }
}
