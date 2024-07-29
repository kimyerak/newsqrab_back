import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password) {
      // 자체 로그인 처리
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hashedPassword;
    } else {
      // 외부 로그인 (예: 네이버 로그인) 처리
      if (!this.isExternalLogin(createUserDto)) {
        throw new BadRequestException(
          'Password is required for non-external logins.',
        );
      }
    }

    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  // 외부 로그인 여부 확인 (비밀번호 필드가 없으면 외부 로그인으로 간주)
  private isExternalLogin(createUserDto: CreateUserDto): boolean {
    // 비밀번호가 없으면 외부 로그인
    return !createUserDto.password;
  }

  // 기타 서비스 메서드 (find, update, delete 등)
}
