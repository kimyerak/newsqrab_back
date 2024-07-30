import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Article extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  content: string; // 하이라이팅 가능한 본문

  @Prop({ required: true })
  author: string;

  @Prop()
  date: string; // 날짜

  @Prop()
  photo?: string; // 사진의 링크

  @Prop()
  category?: string; // 기사 카테고리 (예: 경제, 정치, 문화)

  @Prop()

  summary?: string; // 1줄 요약


  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
