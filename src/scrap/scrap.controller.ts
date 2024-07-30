import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { Scrap } from './scrap.schema';
import { CreateScrapDto } from './dto/create-scrap.dto';
import { UpdateFollowerEmojisResponseDto } from './dto/update-follower-emoji.dto';
import { FollowerEmojiDto } from './dto/update-scrap.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('scraps')
@Controller('scraps')
export class ScrapController {
  constructor(private readonly scrapService: ScrapService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new scrap' })
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

  @Get()
  @ApiOperation({ summary: 'Get all scraps' })
  @ApiResponse({
    status: 200,
    description: 'List of all scraps.',
    type: [CreateScrapDto], // Specify array type in response
  })
  async getAllScraps(): Promise<Scrap[]> {
    return this.scrapService.getAllScraps();
  }

  @Put(':id/followerEmojis')
  @ApiOperation({ summary: 'Update follower emojis for a scrap' })
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
  @ApiOperation({ summary: 'Get scraps by user nickname' })
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
}
