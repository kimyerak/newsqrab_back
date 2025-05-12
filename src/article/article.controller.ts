import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('hot')
  @ApiOperation({
    summary: '조회수 기반 인기 기사 조회',
    description: '조회수가 높은 기사 5개를 가져옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: '인기 기사 리스트 반환 성공',
    content: {
      'application/json': {
        example: [
          {
            _id: '67fbebd51c52431165cd8de8',
            url: 'https://n.news.naver.com/article/015/0005118585?cds=news_media_pc&type=editn',
            content: '기사 내용은 준비 중입니다.',
            createdBy: 'admin',
            views: 3,
            createdAt: '2025-04-13T16:52:37.545Z',
            updatedAt: '2025-04-13T16:52:54.804Z',
            __v: 0,
          },
          {
            _id: '67fbebd51c52431165cd8de8',
            url: 'https://n.news.naver.com/article/015/0005118585?cds=news_media_pc&type=editn',
            content: '기사 내용은 준비 중입니다.',
            createdBy: 'admin',
            views: 3,
            createdAt: '2025-04-13T16:52:37.545Z',
            updatedAt: '2025-04-13T16:52:54.804Z',
            __v: 0,
          },
        ],
      },
    },
  })
  getHotArticles() {
    return this.articleService.getHotArticles();
  }

  @Post()
  @ApiOperation({
    summary: '기사 생성',
    description:
      '사용자가 제공한 기사 URL을 기반으로 기사 내용을 크롤링하고 저장합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '기사 생성 성공',
    content: {
      'application/json': {
        example: {
          url: 'https://n.news.naver.com/article/028/0002745295?cds=news_media_pc&type=editn',
          content:
            '김문수 국힘 후보 등록\n\t\n\t\t\n\t\n김문수 국민의힘 대통령선거 후보(맨 앞)가 11일 오후 서울 여의도 국회에서 열린 국민의힘 의원총회에 참석한 뒤 의원들의 박수를 받으며 이동하고 있다. 신소영 기자 viator@hani.co.kr사상 초유의 ‘강제 후보교체’ 시도에서 기사회생한 김문수 국민의힘 대통령 후보가 11일 중앙선거관리위원회에 대선 후보로 등록하고, 박대출 의원을 당 사무총장에 임명하는 등 공식 선거운동 채비에 나섰다. 하지만 당 안팎에선 친윤석열계와 당 지도부의 무리한 후보 교체 시도가 “정치 쿠데타”라는 비판과 함께 “국민의힘이 자멸의 길로 가고 있다”는 지적이 거세다. 비록 ‘당심’의 반발에 실패로 돌아갔지만, 당 지도부가 정당의 공식 대선 후보 선출 절차를 통해 뽑은 후보를 내치고 당권 투쟁에 유리한 외부 인사로 교체하려 한 것은 민주주의 역사에 큰 오점으로 남을 것이란 취지다.이날 오전 경기도 과천시 중앙선관위를 찾아 후보 등록을 마친 김 후보는 당 지도부의 한덕수 전 국무총리로의 후보 교체 시도가 전날 밤 당원 투표에서 무산된 것이 “굉장히 놀라운 기적”이라며 “민주주의를 바로 세워주신 당원 여러분께 정말 감사하다”고 했다. 한 전 총리를 만나선 두 차례 포옹했고, 오후 국회에서 열린 당 의원총회에선 “오늘부터 우리는 원팀”이라고 강조하면서 큰절을 했다.김 후보의 갈등 봉합 행보와 달리, 당 안팎에선 당 지도부와 친윤석열계가 대선 이후 당권 확보에 골몰해 당을 망가뜨렸다는 비판이 거셌다. 국민의힘은 지난 9일 밤 11시께 김 후보 쪽과 한 전 총리 쪽의 두 차례 단일화 실무협상이 무산되자, 1시간여 뒤인 10일 자정 곧바로 후보 교체 작업에 착수했다. 18일 동안 경선을 치러 선출된 김 후보의 대선 후보 지위를 박탈하고, 한 전 총리가 새로 후보 등록을 마치는 데까지 걸린 건 불과 4시간이었다. 하지만 뒤이어 10일 오전 10시~밤 9시 진행된 당원투표에서 ‘한덕수 대통령 후보 재선출’은 부결됐다.한 영남 재선 의원은 “심야에 일어난 ‘정치 쿠데타’는 국민의힘 현실을 그대로 보여준다. 이재명 더불어민주당 후보와 싸우기도 전에 우리 스스로 자멸했다”고 말했다. 또 다른 영남 중진 의원은 “12·3 비상계엄에 대해 사과도, 성찰도 제대로 하지 않은 채 권력싸움만 하다가 씻을 수 없는 오점을 남겼다. 국민의힘은 이제 더 이상 보수정당이라고 할 수 없다”며 “처참하게 깨지고, 다시 개혁해야 한다”고 말했다. 당내 친한동훈계 의원 16명도 공동성명을 내어 “단일화에 적극적으로 응하지 않았다는 이유로 후보를 기습 교체한 것은 정당사에 유례를 찾을 수 없는 민주주의 파괴 행위”라고 비판했다.당 안에선 이번 사태를 초래한 이들에게 책임을 물어야 한다는 요구도 거세다. 당 후보 선출 결선에서 탈락한 한동훈 전 대표는 “당을 이 지경으로 몰고 간 사람들은 모두 직함을 막론하고 즉각 사퇴하고 제대로 책임져야 한다”며 “친윤 구태정치를 청산하지 못하면 우리 당에 미래는 없다”고 페이스북에 적었다. 함께 경선을 치렀던 홍준표 전 대구시장은 페이스북을 통해 “대선 경선판을 혼미하게 한 책임을 지고 권영세·권성동과 (단일화를 강하게 밀어붙인) 박수영·성일종은 의원직 사퇴하고 정계 은퇴하라”고 주장했다.정치권에선 윤석열 전 대통령 탄핵에 반대하며 극우적 발언도 서슴지 않은 김 후보가 한 전 총리, 즉 ‘내란 대행’과 본질적으로 무슨 차이가 있냐는 지적도 나온다. 윤 전 대통령은 이날 “이제 우리는 단결해야 한다”는 메시지를 냈다. 강훈식 더불어민주당 중앙선거대책위원회 종합상황실장은 “김 후보가 반헌정세력의 후보라는 것을 윤석열이 확인해 준 셈”이라고 꼬집었다.',
          createdBy: 'admin',
          views: 0,
          _id: '6820be0897a5bda2260a26df',
          createdAt: '2025-05-11T15:11:04.713Z',
          updatedAt: '2025-05-11T15:11:04.713Z',
          __v: 0,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '유효하지 않은 URL 형식' })
  @ApiBody({ type: CreateArticleDto })
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '기사 조회수 증가',
    description:
      '해당 ID를 가진 기사의 조회수를 1 증가시키고, 저장된 전체 데이터를 반환합니다.',
  })
  @ApiParam({ name: 'id', description: '기사 ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: 200,
    description: '조회수 증가된 기사 반환',
    content: {
      'application/json': {
        example: {
          _id: '6820be0897a5bda2260a26df',
          url: 'https://n.news.naver.com/article/028/0002745295?cds=news_media_pc&type=editn',
          content:
            '김문수 국힘 후보 등록\n\t\n\t\t\n\t\n김문수 국민의힘 대통령선거 후보(맨 앞)가 11일 오후 서울 여의도 국회에서 열린 국민의힘 의원총회에 참석한 뒤 의원들의 박수를 받으며 이동하고 있다. 신소영 기자 viator@hani.co.kr사상 초유의 ‘강제 후보교체’ 시도에서 기사회생한 김문수 국민의힘 대통령 후보가 11일 중앙선거관리위원회에 대선 후보로 등록하고, 박대출 의원을 당 사무총장에 임명하는 등 공식 선거운동 채비에 나섰다. 하지만 당 안팎에선 친윤석열계와 당 지도부의 무리한 후보 교체 시도가 “정치 쿠데타”라는 비판과 함께 “국민의힘이 자멸의 길로 가고 있다”는 지적이 거세다. 비록 ‘당심’의 반발에 실패로 돌아갔지만, 당 지도부가 정당의 공식 대선 후보 선출 절차를 통해 뽑은 후보를 내치고 당권 투쟁에 유리한 외부 인사로 교체하려 한 것은 민주주의 역사에 큰 오점으로 남을 것이란 취지다.이날 오전 경기도 과천시 중앙선관위를 찾아 후보 등록을 마친 김 후보는 당 지도부의 한덕수 전 국무총리로의 후보 교체 시도가 전날 밤 당원 투표에서 무산된 것이 “굉장히 놀라운 기적”이라며 “민주주의를 바로 세워주신 당원 여러분께 정말 감사하다”고 했다. 한 전 총리를 만나선 두 차례 포옹했고, 오후 국회에서 열린 당 의원총회에선 “오늘부터 우리는 원팀”이라고 강조하면서 큰절을 했다.김 후보의 갈등 봉합 행보와 달리, 당 안팎에선 당 지도부와 친윤석열계가 대선 이후 당권 확보에 골몰해 당을 망가뜨렸다는 비판이 거셌다. 국민의힘은 지난 9일 밤 11시께 김 후보 쪽과 한 전 총리 쪽의 두 차례 단일화 실무협상이 무산되자, 1시간여 뒤인 10일 자정 곧바로 후보 교체 작업에 착수했다. 18일 동안 경선을 치러 선출된 김 후보의 대선 후보 지위를 박탈하고, 한 전 총리가 새로 후보 등록을 마치는 데까지 걸린 건 불과 4시간이었다. 하지만 뒤이어 10일 오전 10시~밤 9시 진행된 당원투표에서 ‘한덕수 대통령 후보 재선출’은 부결됐다.한 영남 재선 의원은 “심야에 일어난 ‘정치 쿠데타’는 국민의힘 현실을 그대로 보여준다. 이재명 더불어민주당 후보와 싸우기도 전에 우리 스스로 자멸했다”고 말했다. 또 다른 영남 중진 의원은 “12·3 비상계엄에 대해 사과도, 성찰도 제대로 하지 않은 채 권력싸움만 하다가 씻을 수 없는 오점을 남겼다. 국민의힘은 이제 더 이상 보수정당이라고 할 수 없다”며 “처참하게 깨지고, 다시 개혁해야 한다”고 말했다. 당내 친한동훈계 의원 16명도 공동성명을 내어 “단일화에 적극적으로 응하지 않았다는 이유로 후보를 기습 교체한 것은 정당사에 유례를 찾을 수 없는 민주주의 파괴 행위”라고 비판했다.당 안에선 이번 사태를 초래한 이들에게 책임을 물어야 한다는 요구도 거세다. 당 후보 선출 결선에서 탈락한 한동훈 전 대표는 “당을 이 지경으로 몰고 간 사람들은 모두 직함을 막론하고 즉각 사퇴하고 제대로 책임져야 한다”며 “친윤 구태정치를 청산하지 못하면 우리 당에 미래는 없다”고 페이스북에 적었다. 함께 경선을 치렀던 홍준표 전 대구시장은 페이스북을 통해 “대선 경선판을 혼미하게 한 책임을 지고 권영세·권성동과 (단일화를 강하게 밀어붙인) 박수영·성일종은 의원직 사퇴하고 정계 은퇴하라”고 주장했다.정치권에선 윤석열 전 대통령 탄핵에 반대하며 극우적 발언도 서슴지 않은 김 후보가 한 전 총리, 즉 ‘내란 대행’과 본질적으로 무슨 차이가 있냐는 지적도 나온다. 윤 전 대통령은 이날 “이제 우리는 단결해야 한다”는 메시지를 냈다. 강훈식 더불어민주당 중앙선거대책위원회 종합상황실장은 “김 후보가 반헌정세력의 후보라는 것을 윤석열이 확인해 준 셈”이라고 꼬집었다.',
          createdBy: 'admin',
          views: 1,
          createdAt: '2025-05-11T15:11:04.713Z',
          updatedAt: '2025-05-11T15:12:41.576Z',
          __v: 0,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '해당 ID의 기사를 찾을 수 없음' })
  IncreaseViews(@Param('id') id: string) {
    return this.articleService.IncreaseViews(id);
  }

  @Get(':id/content')
  @ApiOperation({
    summary: '기사 본문 조회',
    description: '기사 ID에 해당하는 기사의 전체 본문을 반환합니다.',
  })
  @ApiParam({ name: 'id', description: '기사 ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: 200,
    description: '기사 본문 반환 성공',
    content: {
      'application/json': {
        example: '기사 본문 예시입니다.',
      },
    },
  })
  @ApiResponse({ status: 404, description: '해당 ID의 기사를 찾을 수 없음' })
  getArticleContent(@Param('id') id: string) {
    return this.articleService.getArticleContent(id);
  }
}
