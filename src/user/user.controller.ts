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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserResponseDto } from './dto/create-user.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import {
  UpdateUserProfileDto,
  UpdateUserActivityDto,
} from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users') // 태그 지정
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create user - 회원가입' })
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
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
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

  @Put(':id/profile')
  @ApiOperation({ summary: 'Update user profile information' })
  @ApiResponse({
    status: 200,
    description: 'The user profile has been successfully updated.',
    type: UpdateUserProfileDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<any> {
    const updatedUser = await this.userService.updateUserProfile(
      id,
      updateUserProfileDto,
    );
    return {
      _id: updatedUser._id.toString(),
      username: updatedUser.username,
      nickname: updatedUser.nickname,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
    };
  }

  @Put(':id/activity')
  @ApiOperation({ summary: 'Update user activity information' })
  @ApiResponse({
    status: 200,
    description: 'The user activity has been successfully updated.',
    type: UpdateUserActivityDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUserActivity(
    @Param('id') id: string,
    @Body() updateUserActivityDto: UpdateUserActivityDto,
  ): Promise<any> {
    const updatedUser = await this.userService.updateUserActivity(
      id,
      updateUserActivityDto,
    );
    return {
      _id: updatedUser._id.toString(),
      username: updatedUser.username,
      nickname: updatedUser.nickname,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
      following: updatedUser.following,
      followers: updatedUser.followers,
      scraps: updatedUser.scraps,
    };
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
}
