import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Conversation extends Document {
  @Prop({
    type: [{ type: Object, required: true }],
    required: true,
  })
  script: { user1?: string; user2?: string }[];

  @Prop({ required: true, type: Types.ObjectId })
  parentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  articleId: Types.ObjectId;

  @Prop({ required: true, enum: ['original', 'user-modified', 'rag-modified'] })
  type: string;

  @Prop({ required: true }) // ✅ 추가: 질문자 캐릭터 키 (예: 'user1')
  user1: string;

  @Prop({ required: true }) // ✅ 추가: 답변자 캐릭터 키 (예: 'user2')
  user2: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
