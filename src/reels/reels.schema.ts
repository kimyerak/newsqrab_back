import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  nickname: string;

  @Prop()
  profilePicture?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 0 })
  likes: number;
}

const CommentSchema = SchemaFactory.createForClass(Comment);
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

  @Prop({ type: [CommentSchema], default: [] })
  comments: Types.DocumentArray<Comment>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ReelsSchema = SchemaFactory.createForClass(Reels);
