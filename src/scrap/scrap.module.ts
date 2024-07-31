import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapController } from './scrap.controller';
import { ScrapService } from './scrap.service';
import { ScrapSchema } from './scrap.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Scrap', schema: ScrapSchema }]),
    UserModule,
  ],
  controllers: [ScrapController],
  providers: [ScrapService],
})
export class ScrapModule {}
