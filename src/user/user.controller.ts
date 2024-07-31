import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Logger,
  Put,
  Param,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserResponseDto } from './dto/create-user.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@ApiTags('users') // 태그 지정
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Patch('register')
  @ApiOperation({ summary: '탭0 - 회원가입' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: CreateUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input. 뭔가 누락됨' })
  @ApiResponse({ status: 409, description: 'Username already exists. 겹침' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    const user = await this.userService.create(createUserDto);
    // 필요한 필드만 포함하여 DTO로 반환
    return {
      _id: user._id.toString(),
      username: user.username,
      nickname: user.nickname,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      follower_count: 0,
      following_count: 0,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '탭0 - 로그인' })
  @ApiResponse({
    status: 201,
    description: 'User logged in successfully.',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async loginUser(@Body() loginDto: LoginDto): Promise<any> {
    // UserService에서 인증 로직을 처리
    try {
      this.logger.log(`Attempting to log in user: ${loginDto.username}`);
      const user = await this.userService.login(loginDto);
      this.logger.log(`User logged in successfully: ${loginDto.username}`);
      return {
        _id: user._id.toString(),
        username: user.username,
        nickname: user.nickname,
      };
    } catch (error) {
      this.logger.error(
        `Login failed for user: ${loginDto.username}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch(':id/profile')
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiOperation({ summary: '탭5 - 마이페이지(username, nickname, bio)수정' })
  @ApiResponse({
    status: 200,
    description: 'The user profile has been successfully updated.',
    type: UpdateUserProfileDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @UploadedFile() profilePicture: Express.Multer.File,
  ): Promise<any> {
    const updatedUser = await this.userService.updateUserProfile(
      id,
      updateUserProfileDto,
      profilePicture, // 프로필 사진 파일 전달
    );
    return updatedUser;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully retrieved.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 204,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async delete(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  //팔로우, 스크랩 등 복잡한 로직 시작
  @Put(':id/following/:followUserId')
  @ApiOperation({ summary: 'Add following' })
  @ApiResponse({ status: 200, description: 'Following added successfully.' })
  async addFollowing(
    @Param('id') id: string,
    @Param('followUserId') followUserId: string,
  ): Promise<any> {
    await this.userService.addFollowing(id, followUserId);
    return { message: 'Following added successfully.' };
  }

  @Delete(':id/following/:unfollowUserId')
  @ApiOperation({ summary: 'Delete following' })
  @ApiResponse({ status: 200, description: 'Following removed successfully.' })
  @HttpCode(200) // 명확한 응답 코드를 위해 추가
  async deleteFollowing(
    @Param('id') id: string,
    @Param('unfollowUserId') unfollowUserId: string,
  ): Promise<any> {
    await this.userService.deleteFollowing(id, unfollowUserId);
    return { message: 'Following removed successfully.' };
  }

  @Put(':id/follower/:followerUserId')
  @ApiOperation({ summary: 'Add follower' })
  @ApiResponse({ status: 200, description: 'Follower added successfully.' })
  async addFollower(
    @Param('id') id: string,
    @Param('followerUserId') followerUserId: string,
  ): Promise<any> {
    await this.userService.addFollower(id, followerUserId);
    return { message: 'Follower added successfully.' };
  }

  @Delete(':id/follower/:unfollowerUserId')
  @ApiOperation({ summary: 'Delete follower' })
  @ApiResponse({ status: 200, description: 'Follower removed successfully.' })
  @HttpCode(200) // 명확한 응답 코드를 위해 추가
  async deleteFollower(
    @Param('id') id: string,
    @Param('unfollowerUserId') unfollowerUserId: string,
  ): Promise<any> {
    await this.userService.deleteFollower(id, unfollowerUserId);
    return { message: 'Follower removed successfully.' };
  }

  @Put(':id/scrap/:scrapId')
  @ApiOperation({ summary: 'Add scrap' })
  @ApiResponse({ status: 200, description: 'Scrap added successfully.' })
  async addScrap(
    @Param('id') id: string,
    @Param('scrapId') scrapId: string,
  ): Promise<any> {
    await this.userService.addScrap(id, scrapId);
    return { message: 'Scrap added successfully.' };
  }

  @Delete(':id/scrap/:scrapId')
  @ApiOperation({ summary: 'Delete scrap' })
  @ApiResponse({ status: 200, description: 'Scrap removed successfully.' })
  @HttpCode(200) // 명확한 응답 코드를 위해 추가
  async deleteScrap(
    @Param('id') id: string,
    @Param('scrapId') scrapId: string,
  ): Promise<any> {
    await this.userService.deleteScrap(id, scrapId);
    return { message: 'Scrap removed successfully.' };
  }
}
