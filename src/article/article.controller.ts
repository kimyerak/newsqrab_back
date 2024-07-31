import { Controller, Post, Put, Param, Body, Get } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './article.schema';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({
    status: 201,
    description: 'The article has been successfully created.',
    type: Article,
  })
  create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
    return this.articleService.create(createArticleDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update article summary and category' })
  @ApiResponse({
    status: 200,
    description:
      'The article summary and category have been successfully updated.',
    type: Article,
  })
  @ApiResponse({ status: 404, description: 'Article not found.' })
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articleService.update(id, updateArticleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({
    status: 200,
    description: 'An array of all articles',
    type: [Article], // An array of Article objects
  })
  getAll(): Promise<Article[]> {
    return this.articleService.findAll();
  }
  @Get(':category')
  @ApiOperation({ summary: 'Get articles by category' })
  @ApiResponse({
    status: 200,
    description: 'An array of articles filtered by category',
    type: [Article],
  })
  getByCategory(@Param('category') category: string): Promise<Article[]> {
    return this.articleService.findByCategory(category);
  }
}
