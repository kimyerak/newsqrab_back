import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './article.schema';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { ReelsModule } from '../reels/reels.module';
import { ConversationModule } from '../conversation/conversation.module'; // ✅ 추가

const ArticleModel = MongooseModule.forFeature([
  { name: Article.name, schema: ArticleSchema }
])
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    ConversationModule,
    forwardRef(() => ReelsModule),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleModel]
})
export class ArticleModule {}
