import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cron from 'node-cron';

import { ArticleService } from './article/article.service';
import { ReelsService } from './reels/reels.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const articleService = app.get(ArticleService);
  const reelsService = app.get(ReelsService);

  // CORS 설정 추가
  app.enableCors({
    origin: '*', // 모든 출처를 허용합니다. 필요에 따라 특정 출처로 변경할 수 있습니다.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('API for NewsQrab')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger 문서 URL을 '/api'로 설정
  await app.listen(3000);
  cron.schedule(
    '* * * * *',
    async () => {
      console.log('Running a task every midnight');
      await articleService.fetchNews();
      articleService.findReelsArticle();

    },
    {
      scheduled: true,
      timezone: 'Asia/Seoul',
    },
  );
}
bootstrap();
