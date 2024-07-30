import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException, // ConflictException 추가
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import { LoginDto } from './dto/login.dto';
import {
  UpdateUserActivityDto,
  UpdateUserProfileDto,
} from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // username 중복 체크
    const existingUser = await this.userModel.findOne({
      username: createUserDto.username,
    });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    if (createUserDto.password) {
      // 비밀번호 해싱 처리
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

  async login(loginDto: LoginDto): Promise<User> {
    const { username, password } = loginDto;
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user; // 유저 정보를 반환합니다.
  }

  async updateUserProfile(
    id: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserProfileDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async updateUserActivity(
    id: string,
    updateUserActivityDto: UpdateUserActivityDto,
  ): Promise<User> {
    const updateData = {
      following: updateUserActivityDto.following?.map(
        (id) => new Types.ObjectId(id),
      ),
      followers: updateUserActivityDto.followers?.map(
        (id) => new Types.ObjectId(id),
      ),
      scraps: updateUserActivityDto.scraps?.map((id) => new Types.ObjectId(id)),
    };
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }
  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
