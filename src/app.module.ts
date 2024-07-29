import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module'; // 경로는 실제 UsersModule의 위치에 따라 조정해야 합니다

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/newsqrab'), // MongoDB 연결 URI
    UserModule, // UsersModule 추가
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
