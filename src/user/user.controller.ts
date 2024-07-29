import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.schema';
import { LoginDto } from './dto/login.dto';

@ApiTags('users') // 태그 지정
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign up')
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async loginUser(@Body() loginDto: LoginDto): Promise<any> {
    // UserService에서 인증 로직을 처리
    return this.userService.login(loginDto);
  }

  // 기타 라우트 핸들러 추가
}
