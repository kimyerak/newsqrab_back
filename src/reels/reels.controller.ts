import { Controller, Post, Put, Param, Body, Get, NotFoundException } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { CreateReelsDto } from './dto/create-reels.dto';
import { UpdateReelsDto } from './dto/update-reels.dto';
import { Reels } from './reels.schema';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
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
  // 🔥 추가: 조회수 높은 순으로 정렬해서 가져오기
  @Get('sorted/views')
  @ApiOperation({ summary: 'Get reels sorted by views (highest first)' })
  @ApiResponse({ status: 200, type: [Reels] })
  getReelsSortedByViews(): Promise<Reels[]> {
    return this.reelsService.getReelsSortedByViews();
  }

  @Get('sorted/latest')
  @ApiOperation({ summary: '최신순으로 릴스 정렬'})
  @ApiResponse({ status: 200, type: [Reels]})
  getLatestReels(): Promise<Reels[]> {
    return this.reelsService.getLatestReels();
  }

  @Put(':id/views')
  incrementViews(@Param('id') id: string) {
    return this.reelsService.incrementViews(id);
  }

  @Post(':id/tts')
  @ApiOperation({
    summary: 'Conversation 기반 TTS 음성 파일 생성',
    description: `Conversation의 script를 기반으로 대사별 TTS (mp3)를 생성합니다.
    각 음성 파일은 article id를 이름으로 하는 폴더 단위로 저장되며, 이후 모든 mp3를 이어붙인 concat.mp3 파일이 함께 생성됩니다.`,
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation ID',
    example: '681789494f637e7113fa38aa',
  })
  @ApiResponse({
    status: 201,
    description: 'TTS mp3 생성 및 병합 완료. 병합된 오디오 파일 경로 반환.',
    content: {
      'application/json': {
        example: '.assets/tts/681789494f637e7113fa38aa/concat.mp3',
      },
    },
  })
  async generateTTS(@Param('id') id: string) {
    return this.reelsService.createAudioFromConversation(id);
  }

  @Post(':id/generate-reels')
  @ApiOperation({
    summary: 'TTS 음성과 영상을 합성하여 릴스 영상 생성',
    description: `TTS 음성 파일과 영상을 합성하여 하나의 릴스 영상을 생성합니다.
    생성된 릴스 영상은 assets/reels/{id}.mp3 경로에 저장됩니다. 
    s3 업로드는 추후에 추가 예정.`,
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation ID (TTS와 동일)',
    example: '681789494f637e7113fa38aa',
  })
  @ApiResponse({
    status: 201,
    description:
      '오디오와 영상 합성하여 릴스 생성 완료. 생성된 릴스 영상 파일 경로 반환.',
    content: {
      'application/json': {
        example: '.assets/reels/681789494f637e7113fa38aa.mp4',
      },
    },
  })
  async mergeAudioandVideo(@Param('id') id: string) {
    const audioPath = await this.reelsService.createAudioFromConversation(id);
    const videoPath = await this.reelsService.mergeVideoAndAudio(id);
    return videoPath;
  }
  //예락 1개 추가
  @Post(':id/add-subtitles')
  @ApiOperation({
    summary: 'ASS 형식의 자막을 reels 영상에 추가',
    description:
      'assets/reels/{id}.mp4에 subtitles를 입혀 {id}_final.mp4로 저장',
  })
  @ApiParam({
    name: 'id',
    description:
      'Conversation ID (이 ID를 기반으로 reels와 subtitle 파일이 존재해야 함)',
    example: '681789494f637e7113fa38aa',
  })
  @ApiResponse({
    status: 201,
    description: '자막 추가된 릴스 영상 경로 반환',
    content: {
      'application/json': {
        example: './assets/final/681789494f637e7113fa38aa_final.mp4',
      },
    },
  })
  async addSubtitles(@Param('id') id: string) {
    return this.reelsService.mergeReelsWithSubtitles(id);
  }
  // 예락 2번째거 추가가
  @Post(':conversationId/finalize')
  @ApiOperation({
    summary: '최종 영상 S3 업로드 및 Reels DB 저장',
    description:
      'assets/final/{conversationId}.mp4 파일을 S3에 업로드하고, Reels DB에 저장합니다.',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'Conversation ID',
    example: '681789494f637e7113fa38aa',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        articleId: { type: 'string' },
        owner: { type: 'string' },
        character1: { type: 'string' },
        character2: { type: 'string' },
        createdBy: { type: 'string' },
      },
      required: ['articleId', 'owner', 'character1', 'character2', 'createdBy'],
    },
  })
  @ApiResponse({ status: 201, description: 'Reels 저장 및 S3 업로드 성공' })
  async finalizeReelsUpload(
    @Param('conversationId') conversationId: string,
    @Body()
    body: {
      articleId: string;
      owner: string;
      character1: string;
      character2: string;
      createdBy: string;
    },
  ): Promise<Reels> {
    return this.reelsService.uploadFinalVideoAndSaveReels(
      conversationId,
      body.articleId,
      body.owner,
      body.character1,
      body.character2,
      body.createdBy,
    );
  }

  @Get(':id/details')
  @ApiOperation({ summary: '릴스 상세 정보 가져오기', description: '릴스의 id를 입력하면 해당 릴스에 사용된 conversation 객체와와 기사 URL을 가져옵니다.' })
  @ApiResponse({ 
    status: 200, 
    description: '성공적으로 가져왔습니다.',
    schema: {
      example: {
          "conversation": {
            "_id": "68259250ab77d048e4ecad46",
            "script": [
              {
                "user1": "헐 대박, 전광훈 목사가 알뜰폰 회사 만든 거였어?"
              },
              {
                "user2": "응, 퍼스트모바일이라는 브랜드인데, 전 목사가 70억 원을 투자했다고 해!"
              },
              {
                "user1": "진짜? 그 회사가 개인정보 문제로 벌금을 받았다던데, 왜 그런 거야?"
              },
              {
                "user2": "가입자의 주민등록번호 암호화도 안 하고, 개인정보 수집 동의도 제대로 안 받았대. 그래서 과태료 1200만 원 부과됐어!"
              },
              {
                "user1": "헉 그래서 대국본이랑 촛불행동도 한 소리 들은 거야?"
              },
              {
                "user2": "맞아! 둘 다 개인정보 수집 방법에 문제가 있어서 시정명령을 받았대!"
              }
            ],
            "parentId": "68259250ab77d048e4ecad46",
            "articleId": "68259244ab77d048e4ecad42",
            "type": "original",
            "createdAt": "2025-05-15T07:05:52.564Z",
            "updatedAt": "2025-05-15T07:05:52.564Z",
            "__v": 0
          },
          "articleUrl": "https://n.news.naver.com/mnews/article/008/0005194456"
      },
    },
   })
  async getReelsDetails(@Param('id') id: string) {
    const result = await this.reelsService.getReelsDetails(id);
    if (!result) {
      throw new NotFoundException('Reels not found');
    }
    return result;
  }
}
