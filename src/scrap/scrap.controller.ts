import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { UserService } from '../user/user.service';
import { Scrap } from './scrap.schema';
import { CreateScrapDto } from './dto/create-scrap.dto';
import { UpdateFollowerEmojisResponseDto } from './dto/update-follower-emoji.dto';
import { FollowerEmojiDto } from './dto/update-scrap.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('scraps')
@Controller('scraps')
export class ScrapController {
  constructor(
    private readonly scrapService: ScrapService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiOperation({ summary: '탭1,2,3,4 - Create a new scrap' })
  @ApiResponse({
    status: 201,
    description: 'The scrap has been successfully created.',
    type: CreateScrapDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateScrapDto })
  async createScrap(@Body() scrapData: Scrap): Promise<Scrap> {
    return this.scrapService.createScrap(scrapData);
  }
  @Get('hot')
  @ApiOperation({ summary: '탭4 - Get hot scraps' })
  @ApiResponse({
    status: 200,
    description: 'List of hot scraps sorted by the number of follower emojis.',
    type: [CreateScrapDto],
  })
  async getHotScraps(): Promise<Scrap[]> {
    return this.scrapService.getHotScraps();
  }
  @Get()
  @ApiOperation({ summary: '안쓰일듯 - Get all scraps' })
  @ApiResponse({
    status: 200,
    description: 'List of all scraps.',
    type: [CreateScrapDto], // Specify array type in response
  })
  async getAllScraps(): Promise<Scrap[]> {
    return this.scrapService.getAllScraps();
  }

  @Put(':id/followerEmojis')
  @ApiOperation({ summary: '탭1,2 - Update follower emojis for a scrap' })
  @ApiResponse({
    status: 200,
    description: 'Follower emoji has been successfully added or updated.',
    type: UpdateFollowerEmojisResponseDto, // 수정된 이모지 정보만 반환
  })
  @ApiResponse({ status: 404, description: 'Scrap not found.' })
  @ApiBody({ type: FollowerEmojiDto })
  async updateFollowerEmoji(
    @Param('id') scrapId: string,
    @Body() followerEmoji: FollowerEmojiDto, // FollowerEmojiDto 사용
  ): Promise<UpdateFollowerEmojisResponseDto> {
    const updatedScrap = await this.scrapService.updateFollowerEmoji(
      scrapId,
      followerEmoji,
    );
    return {
      id: updatedScrap._id.toString(),
      followerEmojis: updatedScrap.followerEmojis,
    };
  }

  @Get(':usernickname')
  @ApiOperation({ summary: '누군가의 프로필 클릭시 - Get scraps by nickname' })
  @ApiResponse({
    status: 200,
    description: 'List of scraps for the specified user nickname.',
    type: [CreateScrapDto],
  })
  async getScrapsByUserNickname(
    @Param('usernickname') usernickname: string,
  ): Promise<Scrap[]> {
    return this.scrapService.findScrapsByUserNickname(usernickname);
  }

  // @Get('following/:userId')
  // @ApiOperation({ summary: '탭1- Get scraps from users you are following' })
  // @ApiResponse({
  //   status: 200,
  //   description:
  //     'List of scraps from users the specified user is following, sorted by date.',
  //   type: [CreateScrapDto],
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'User not found or user is not following anyone.',
  // })
  // @ApiParam({ name: 'userId', description: 'ID of the user', type: String })
  // async getScrapsByFollowing(
  //   @Param('userId') userId: string,
  // ): Promise<Scrap[]> {
  //   const following = await this.userService.getFollowing(userId);
  //   if (!following || following.length === 0) {
  //     throw new NotFoundException(
  //       'User not found or user is not following anyone.',
  //     );
  //   }
  //   const followingIds = following.map((user) => user._id.toString());
  //   return this.scrapService.findByUserIds(followingIds);
  // }
}
