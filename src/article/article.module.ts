import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './article.schema';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { ReelsModule } from '../reels/reels.module';
import { ConversationModule } from '../conversation/conversation.module';
import { ImageGenerationService } from '../openai/image-generation.service';
import { S3Module } from '../s3/s3.module'; // ✅ 추가

const ArticleModel = MongooseModule.forFeature([
  { name: Article.name, schema: ArticleSchema },
]);

@Module({
  imports: [
    ArticleModel,
    ConversationModule,
    forwardRef(() => ReelsModule),
    S3Module, // ✅ 이 줄 추가해야 S3Service 주입 가능
  ],
  controllers: [ArticleController],
  providers: [ArticleService, ImageGenerationService],
  exports: [ArticleModel],
})
export class ArticleModule {}
