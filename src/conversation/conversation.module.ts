// src/conversation/conversation.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './conversation.schema';
import { ConversationService } from './conversation.service';
import { OpenAiService } from '../openai/openai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  providers: [ConversationService, OpenAiService],
  exports: [ConversationService], // ReelsService에서 사용하려면 export 필요
})
export class ConversationModule {}
