import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module'; // 경로는 실제 UsersModule의 위치에 따라 조정해야 합니다
import { ArticleModule } from './article/article.module';
import { ReelsModule } from './reels/reels.module';
import { SecretService } from '../config.service';
import { ConfigModule } from '@nestjs/config';
import { ScrapModule } from './scrap/scrap.module';
import { OpenAiService } from './openai/openai.service';
import { ScheduleModule } from '@nestjs/schedule';
import { S3Module } from './s3/s3.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역으로 사용
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/newsqrab'),
    UserModule,
    ArticleModule,
    ReelsModule,
    ScrapModule,
    S3Module,
    ConversationModule,
    ScheduleModule.forRoot(),
  ],
  // controllers: [AppController],
  providers: [AppService, SecretService, OpenAiService],
})
export class AppModule {}
