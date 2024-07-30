import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Article extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  content: string; // 기사 원문 전체

  @Prop({ required: true })
  author: string;

  @Prop()
  summary?: string; // 3줄 요약

  @Prop()
  category?: string; // 기사 카테고리 (예: 경제, 정치, 문화)

  @Prop()
  picture?: string; // 대표 이미지 URL

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
