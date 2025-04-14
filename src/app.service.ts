// src/app.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ArticleService } from './article/article.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly articleService: ArticleService) {}

  async onModuleInit() {
    console.log('✅ [AppService] 서버 시작됨 → 기사 대사 생성 시작!');
    await this.articleService.generateConversationFromRandomArticles();
  }
}
