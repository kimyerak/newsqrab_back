import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Reels extends Document {
  @Prop({ required: true })
  owner: string; // 자체 릴스 혹은 신문사

  @Prop({ type: [Types.ObjectId], ref: 'Article', required: true })
  articleId: Types.ObjectId[]; // 릴스에 사용된 기사 id들

  @Prop()
  date: string; // 날짜

  @Prop({ required: true })
  speak: string; // 아바타가 말할 대사

  @Prop({ required: true })
  video: string; // 릴스를 저장할 AWS S3 링크

  @Prop({ required: true })
  category: string; // 아바타 (카테고리에 따라 다름)

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        likes: { type: Number, default: 0 }, // 좋아요 수
      },
    ],
    default: [],
  })
  comments: {
    userId: Types.ObjectId;
    content: string;
    likes: number; // 좋아요 수
  }[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ReelsSchema = SchemaFactory.createForClass(Reels);
