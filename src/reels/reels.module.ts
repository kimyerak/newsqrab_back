import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reels, ReelsSchema } from './reels.schema';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { Article, ArticleSchema } from '../article/article.schema';
import { OpenAiService } from '../openai/openai.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reels.name, schema: ReelsSchema }]),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
  ],
  controllers: [ReelsController],
  providers: [ReelsService, OpenAiService],
})
export class ReelsModule {}
