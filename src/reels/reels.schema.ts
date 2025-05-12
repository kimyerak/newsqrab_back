import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Reels extends Document {
  @Prop({ required: true })
  owner: string; // 만든이

  @Prop({ type: Types.ObjectId, ref: 'Article', required: true })
  articleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  reelsUrl: string; // 완성된 mp4 URL

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true })
  character1: string; // user1에 매핑된 캐릭터

  @Prop({ required: true })
  character2: string; // user2에 매핑된 캐릭터

  @Prop({ default: 0 })
  views: number; // 조회수

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
export const ReelsSchema = SchemaFactory.createForClass(Reels);
