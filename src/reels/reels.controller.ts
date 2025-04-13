import { Controller, Post, Put, Param, Body, Get } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { CreateReelsDto } from './dto/create-reels.dto';
import { UpdateReelsDto } from './dto/update-reels.dto';
import { Reels } from './reels.schema';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentDto } from './dto/comment.dto';
@ApiTags('reels')
@Controller('reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Post()
  @ApiOperation({ summary: '프론트에서 쓸일 x - Create a new reels' })
  @ApiResponse({
    status: 201,
    description: 'The reels has been successfully created.',
    type: Reels,
  })
  create(@Body() createReelsDto: CreateReelsDto): Promise<Reels> {
    return this.reelsService.create(createReelsDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '프론트에선 x - Update reels information' })
  @ApiResponse({
    status: 200,
    description: 'The reels information has been successfully updated.',
    type: Reels,
  })
  @ApiResponse({ status: 404, description: 'Reels not found.' })
  update(
    @Param('id') id: string,
    @Body() updateReelsDto: UpdateReelsDto,
  ): Promise<Reels> {
    return this.reelsService.update(id, updateReelsDto);
  }

  @Get(':date')
  @ApiOperation({ summary: '탭4 - Get reels by date' })
  @ApiResponse({
    status: 200,
    description: 'List of reels for the specified date.',
    type: [Reels],
  })
  @ApiResponse({
    status: 404,
    description: 'No reels found for the specified date.',
  })
  getByDate(@Param('date') date: string): Promise<Reels[]> {
    return this.reelsService.findByDate(date);
  }

  @Get('owner/:owner')
  @ApiOperation({ summary: '특정 소유자별로 릴스 가져오기' })
  @ApiResponse({
    status: 200,
    description: 'List of reels for the specified owner.',
    type: [Reels],
  })
  @ApiResponse({
    status: 404,
    description: 'No reels found for the specified owner.',
  })
  getByOwner(@Param('owner') owner: string): Promise<Reels[]> {
    return this.reelsService.findByOwner(owner);
  }

  @Get(':id/comments/sorted')
  @ApiOperation({ summary: 'Get comments sorted by likes' })
  @ApiResponse({
    status: 200,
    description: 'Comments sorted by likes.',
    type: [CommentDto],
  })
  async getCommentsSorted(@Param('id') id: string): Promise<CommentDto[]> {
    return this.reelsService.getCommentsSorted(id);
  }

  @Put(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a reel' })
  @ApiResponse({
    status: 200,
    description: 'Comment added successfully.',
    type: Reels,
  })
  async addComment(
    @Param('id') id: string,
    @Body() commentDto: CommentDto,
  ): Promise<Reels> {
    return this.reelsService.addComment(id, commentDto);
  }

  @Put(':id/comments/:commentId/like')
  @ApiOperation({ summary: 'Add a like to a comment' })
  @ApiResponse({
    status: 200,
    description: 'Like added successfully.',
    type: Reels,
  })
  async likeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ): Promise<Reels> {
    return this.reelsService.likeComment(id, commentId);
  }
}
