import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reels, ReelsSchema } from './reels.schema';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { Article, ArticleSchema } from '../article/article.schema';
import { OpenAiService } from '../openai/openai.service';
import { S3Module } from '../s3/s3.module';
import { Conversation, ConversationSchema } from '../conversation/conversation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reels.name, schema: ReelsSchema }]),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema}]),
    S3Module,
  ],
  controllers: [ReelsController],
  providers: [ReelsService, OpenAiService],
  exports: [ReelsService],
})
export class ReelsModule {}
