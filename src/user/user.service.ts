import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException, // ConflictException 추가
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Schema } from 'mongoose';
import { User } from './user.schema';
import { LoginDto } from './dto/login.dto';
import {
  UpdateUserActivityDto,
  UpdateUserProfileDto,
} from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly s3Service: S3Service,
  ) {}

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
    profileImage?: Express.Multer.File, // 프로필 이미지 파일 추가
  ): Promise<User> {
    if (profileImage) {
      const profileImageUrl = await this.s3Service.uploadFile(
        'profiles',
        profileImage,
      );
      updateUserProfileDto.profilePicture = profileImageUrl;
    }

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

    // 기존 데이터 가져오기
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // 팔로워 및 팔로잉 수 업데이트
    if (updateUserActivityDto.followers) {
      updateData['follower_count'] = updateUserActivityDto.followers.length;
    }

    if (updateUserActivityDto.following) {
      updateData['following_count'] = updateUserActivityDto.following.length;
    }

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
  async getFollowing(userId: string): Promise<User[]> {
    const user = await this.userModel
      .findById(userId)
      .populate('following', '-password') // 'following' 필드에 대한 populate
      .exec();

    return user.following as unknown as User[]; // 안전한 타입 캐스팅
  }

  // Scrap 추가
  async addScrap(userId: string, scrapId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const scrapObjectId = new Types.ObjectId(scrapId);

    if (!user.scraps.some((id) => id.toString() === scrapObjectId.toString())) {
      user.scraps.push(scrapObjectId as any);
      await user.save();
    }
  }

  // Scrap 제거
  async deleteScrap(userId: string, scrapId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const scrapObjectId = new Types.ObjectId(scrapId);
    user.scraps = user.scraps.filter(
      (id) => id.toString() !== scrapObjectId.toString(),
    );

    await user.save();
  }

  // Following 추가
  async addFollowing(userId: string, followUserId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    const followUser = await this.userModel.findById(followUserId);

    if (!user || !followUser) {
      throw new NotFoundException('User not found');
    }

    // following 배열에 추가
    if (
      !user.following.some((id) => id.toString() === followUser._id.toString())
    ) {
      user.following.push(followUser._id as Schema.Types.ObjectId);
      user.following_count += 1;
      await user.save();
    }

    // followers 배열에 추가
    if (
      !followUser.followers.some((id) => id.toString() === user._id.toString())
    ) {
      followUser.followers.push(user._id as Schema.Types.ObjectId);
      followUser.follower_count += 1;
      await followUser.save();
    }
  }

  // Following 제거
  async deleteFollowing(userId: string, unfollowUserId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    const unfollowUser = await this.userModel.findById(unfollowUserId);

    if (!user || !unfollowUser) {
      throw new NotFoundException('User not found');
    }

    // following 배열에서 제거
    user.following = user.following.filter(
      (id) => id.toString() !== unfollowUser._id.toString(),
    );
    user.following_count = user.following.length;
    await user.save();

    // followers 배열에서 제거
    unfollowUser.followers = unfollowUser.followers.filter(
      (id) => id.toString() !== user._id.toString(),
    );
    unfollowUser.follower_count = unfollowUser.followers.length;
    await unfollowUser.save();
  }

  // Follower 추가
  async addFollower(userId: string, followerUserId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    const followerUser = await this.userModel.findById(followerUserId);

    if (!user || !followerUser) {
      throw new NotFoundException('User not found');
    }

    // followers 배열에 추가
    if (
      !user.followers.some(
        (id) => id.toString() === followerUser._id.toString(),
      )
    ) {
      user.followers.push(followerUser._id as Schema.Types.ObjectId);
      user.follower_count += 1;
      await user.save();
    }

    // following 배열에 추가
    if (
      !followerUser.following.some(
        (id) => id.toString() === user._id.toString(),
      )
    ) {
      followerUser.following.push(user._id as Schema.Types.ObjectId);
      followerUser.following_count += 1;
      await followerUser.save();
    }
  }

  // Follower 제거
  async deleteFollower(
    userId: string,
    unfollowerUserId: string,
  ): Promise<void> {
    const user = await this.userModel.findById(userId);
    const unfollowerUser = await this.userModel.findById(unfollowerUserId);

    if (!user || !unfollowerUser) {
      throw new NotFoundException('User not found');
    }

    // followers 배열에서 제거
    user.followers = user.followers.filter(
      (id) => id.toString() !== unfollowerUser._id.toString(),
    );
    user.follower_count = user.followers.length;
    await user.save();

    // following 배열에서 제거
    unfollowerUser.following = unfollowerUser.following.filter(
      (id) => id.toString() !== user._id.toString(),
    );
    unfollowerUser.following_count = unfollowerUser.following.length;
    await unfollowerUser.save();
  }
}
