import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapController } from './scrap.controller';
import { ScrapService } from './scrap.service';
import { ScrapSchema } from './scrap.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Scrap', schema: ScrapSchema }]),
  ],
  controllers: [ScrapController],
  providers: [ScrapService],
})
export class ScrapModule {}
