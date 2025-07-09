import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { crawlNaverNewsContent } from '../utils/naver-crawler';
import { ReelsService } from '../reels/reels.service';
import { ConversationService } from '../conversation/conversation.service';
import axios from 'axios';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    private readonly reelsService: ReelsService,
    private readonly conversationService: ConversationService,
    private readonly s3Service: S3Service,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const { url } = createArticleDto;
    const data = await crawlNaverNewsContent(createArticleDto.url);
    const content = data.content;
    const articleImageUrl = data.imgurl;

    // 이미지 다운로드
    const imageResponse = await axios.get(articleImageUrl, {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(imageResponse.data, 'binary');

    // S3 업로드
    const imgurl = await this.s3Service.uploadBuffer(
      'newscrab-thumbnails',
      buffer,
      'articleImage.png',
      imageResponse.headers['content-type'],
    );

    // console.log(uploadedUrl);

    const newArticle = new this.articleModel({
      url,
      content,
      imgurl,
      createdBy: 'admin',
    });
    return newArticle.save();
  }

  async IncreaseViews(id: string): Promise<Article> {
    const article = await this.articleModel.findById(id);
    if (!article) return null;

    article.views += 1;
    return article.save();
  }

  async getHotArticles(): Promise<Article[]> {
    return this.articleModel.find().sort({ views: -1 }).limit(5).exec();
  }

  async getArticleContent(id: string): Promise<string> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article.content;
  }
}
