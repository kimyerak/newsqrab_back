import { Controller, Post, Put, Param, Body, Get } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { CreateReelsDto } from './dto/create-reels.dto';
import { UpdateReelsDto } from './dto/update-reels.dto';
import { Reels } from './reels.schema';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('reels')
@Controller('reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reels' })
  @ApiResponse({
    status: 201,
    description: 'The reels has been successfully created.',
    type: Reels,
  })
  create(@Body() createReelsDto: CreateReelsDto): Promise<Reels> {
    return this.reelsService.create(createReelsDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update reels information' })
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
  @ApiOperation({ summary: 'Get reels by date' })
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
}
