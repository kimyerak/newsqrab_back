import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('generate')
  async generate(@Body('content') content: string) {
    return this.conversationService.generateConversationFromContent(content);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.conversationService.findById(id);
  }
}
