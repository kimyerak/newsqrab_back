import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Article extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  content: string; // 하이라이팅 가능한 본문

  @Prop({ nullable: true })
  imgurl: string

  @Prop({ required: true })
  createdBy: string;

  @Prop({ default: 0 })
  views: number;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
