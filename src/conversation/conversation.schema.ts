// ✅ conversation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema()
export class Conversation {
  @Prop({ required: true, type: Array })
  script: { user: string; line: string }[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
