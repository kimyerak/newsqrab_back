import { Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  username: string;
  password?: string; // 비밀번호는 선택적 필드
  nickname: string;
  profilePicture?: string;
  bio?: string;
  following?: Types.ObjectId[];
  followers?: Types.ObjectId[];
  scraps?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
