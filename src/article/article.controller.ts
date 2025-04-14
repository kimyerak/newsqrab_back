import {
  Controller,
  Post,
  Put,
  Param,
  Body,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './article.schema';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('hot')
  getHotArticles() {
    return this.articleService.getHotArticles();
  }
  
  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get(':id')
  IncreaseViews(@Param('id') id: string) {
    return this.articleService.IncreaseViews(id);
  }
  // @Post()
  // @ApiOperation({ summary: '프론트에서 쓸일 x. Create a new article' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'The article has been successfully created.',
  //   type: Article,
  // })
  // create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
  //   return this.articleService.create(createArticleDto);
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Get a specific article by ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The article details',
  //   type: Article,
  // })
  // @ApiResponse({ status: 404, description: 'Article not found.' })
  // async getById(@Param('id') id: string): Promise<Article> {
  //   console.log('Controller: Get article by ID:', id);
  //   const article = await this.articleService.findById(id);
  //   if (!article) {
  //     throw new NotFoundException('Article not found');
  //   }
  //   return article;
  // }

  // @Put(':id')
  // @ApiOperation({ summary: 'Update article summary and category' })
  // @ApiResponse({
  //   status: 200,
  //   description:
  //     'The article summary and category have been successfully updated.',
  //   type: Article,
  // })
  // @ApiResponse({ status: 404, description: 'Article not found.' })
  // update(
  //   @Param('id') id: string,
  //   @Body() updateArticleDto: UpdateArticleDto,
  // ): Promise<Article> {
  //   return this.articleService.update(id, updateArticleDto);
  // }

  // @Get()
  // @ApiOperation({ summary: '탭3 - 맨첨엔 모든기사 불러오고' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'An array of all articles',
  //   type: [Article], // An array of Article objects
  // })
  // getAll(): Promise<Article[]> {
  //   return this.articleService.findAll();
  // }


  // @Get('category/:category')
  // @ApiOperation({ summary: '탭3 - 버튼 누르면 카테고리에 맞게 불러오기' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'An array of articles filtered by category',
  //   type: [Article],
  // })
  // getByCategory(@Param('category') category: string): Promise<Article[]> {
  //   return this.articleService.findByCategory(category);
  // }
}
