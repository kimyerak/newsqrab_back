import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './article.schema';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { ReelsModule } from '../reels/reels.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    ReelsModule  
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
