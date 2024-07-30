// user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class UserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  _id: string;

  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @ApiProperty({ description: 'The nickname of the user' })
  nickname: string;

  @ApiProperty({
    description: "The URL of the user's profile picture",
    required: false,
  })
  profilePicture?: string;

  @ApiProperty({
    description: 'A short biography of the user',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'List of user IDs the user is following',
    required: false,
    type: [String],
  })
  following?: Types.ObjectId[];

  @ApiProperty({
    description: 'List of user IDs that follow the user',
    required: false,
    type: [String],
  })
  followers?: Types.ObjectId[];

  @ApiProperty({
    description: 'List of scrap IDs associated with the user',
    required: false,
    type: [String],
  })
  scraps?: Types.ObjectId[];
}
