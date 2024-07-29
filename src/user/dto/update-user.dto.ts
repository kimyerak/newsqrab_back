import { IsString, IsOptional, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  @IsOptional()
  following?: Types.ObjectId[];

  @IsArray()
  @IsOptional()
  followers?: Types.ObjectId[];

  @IsArray()
  @IsOptional()
  scraps?: Types.ObjectId[];
}
