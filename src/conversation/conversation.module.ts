// src/conversation/conversation.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './conversation.schema';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversatio.controller';
import { OpenAiService } from '../openai/openai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [ConversationController],
  providers: [ConversationService, OpenAiService],
  exports: [ConversationService], // 다른 모듈에서 사용하려고 export
})
export class ConversationModule {}
