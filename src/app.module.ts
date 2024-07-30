import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module'; // 경로는 실제 UsersModule의 위치에 따라 조정해야 합니다
import { ArticleModule } from './article/article.module';
import { ArticleService } from './article/article.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/newsqrab'), // MongoDB 연결 URI
    UserModule,
    ArticleModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
