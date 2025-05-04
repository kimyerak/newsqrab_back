// ✅ conversation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Conversation extends Document {
  @Prop({
    type: [
      {
        type: Object,
        required: true,
      },
    ],
    required: true,
  })
  script: { user1?: string; user2?: string }[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
