import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article } from './article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { crawlNaverNewsContent } from '../utils/naver-crawler';
import { UpdateArticleDto } from './dto/update-article.dto';
import { OpenAiService } from '../openai/openai.service';
import { ConfigService } from '@nestjs/config';
import { ReelsService } from '../reels/reels.service';
import { PROMPT_SUMMARIZE_TEMPLATE } from '../openai/prompts/prompt_article';
import { ConversationService } from '../conversation/conversation.service'; // 이미 import 했겠지

import * as moment from 'moment';
import puppeteer from 'puppeteer';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    private readonly reelsService: ReelsService,
    private readonly conversationService: ConversationService,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const { url } = createArticleDto;
    const content = await crawlNaverNewsContent(createArticleDto.url);
    const newArticle = new this.articleModel({
      url,
      content,
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
  // async update(
  //   id: string,
  //   updateArticleDto: UpdateArticleDto,
  // ): Promise<Article> {
  //   const updatedArticle = await this.articleModel
  //     .findByIdAndUpdate(id, updateArticleDto, { new: true })
  //     .exec();
  //   if (!updatedArticle) {
  //     throw new NotFoundException(`Article with ID ${id} not found`);
  //   }
  //   return updatedArticle;
  // }

  // //간단 함수 3총사
  // async findAll(): Promise<Article[]> {
  //   return this.articleModel.find().exec();
  // }
  // async findByCategory(category: string): Promise<Article[]> {
  //   return this.articleModel.find({ category }).exec();
  // }
  // async findById(id: string): Promise<Article> {
  //   console.log('Requested ID:', id);
  //   if (!Types.ObjectId.isValid(id)) {
  //     throw new NotFoundException('Invalid ID format');
  //   }
  //   const article = await this.articleModel.findById(id).exec();
  //   if (!article) {
  //     throw new NotFoundException('Article not found');
  //   }
  //   console.log('Found Article:', article);
  //   return article;
  // }

  // async fetchArticleLinks(url: string): Promise<string[]> {
  //   const browser = await puppeteer.launch({
  //     args: ['--no-sandbox', '--disable-setuid-sandbox']
  //   });
  //   const page = await browser.newPage();
  //   await page.goto(url, { waitUntil: 'networkidle0' });
  //   const uniqueLinks = await page.$$eval(
  //     'ul.sa_list > li .sa_thumb_link',
  //     (links) => {
  //       const linksSet = new Set<string>();
  //       links.forEach((link) => {
  //         const url = (link as HTMLAnchorElement).href;
  //         linksSet.add(url);
  //       });
  //       return Array.from(linksSet); // Set을 배열로 변환하여 반환
  //     },
  //   );
  //   await browser.close();
  //   return uniqueLinks;
  // }

  // async fetchArticleDetails(
  //   articleUrl: string,
  //   articleCategory: string,
  // ): Promise<void> {
  //   const browser = await puppeteer.launch({
  //     args: ['--no-sandbox', '--disable-setuid-sandbox']
  //   });
  //   const page = await browser.newPage();
  //   console.log(articleUrl);
  //   await page.goto(articleUrl, {
  //     waitUntil: 'domcontentloaded',
  //     timeout: 1000,
  //   });

  //   // 시뮬레이션할 클릭 이벤트가 있다면 실행
  //   try {
  //     await page.waitForSelector('[data-clk="rpt.back"]', { visible: true, timeout: 1500 });
  //     await page.click('[data-clk="rpt.back"]');
  //   } catch (e) {
  //     console.log('No pop-up');
  //   }

  //   const title = await page.$eval('.media_end_head_title', (el) =>
  //     el.textContent.trim(),
  //   );

  //   const hasauthor = await page.$('.byline');
  //   const author = hasauthor ? await page.$eval('.byline', (el) => el.textContent.trim()) : 'newsqrab';
  //   const content = await page.$eval('#newsct_article', (el) =>
  //     el.textContent.trim(),
  //   );

  //   const imageElement = await page.$('.end_photo_org img');
  //     const photo = imageElement
  //       ? await page.evaluate((img) => img.src, imageElement)
  //       : null;
  //   const date = await page.$eval('.media_end_head_info_datestamp_time', (el) =>
  //     el.textContent.trim(),
  //   );

  //   const existingArticle = await this.articleModel.findOne({ title });
  //   if (!existingArticle) {
  //     const articleDto = new CreateArticleDto();
  //     articleDto.title = title;
  //     articleDto.url = articleUrl;
  //     articleDto.content = content;
  //     articleDto.author = author;
  //     articleDto.date = date;
  //     articleDto.photo = photo;
  //     articleDto.category = articleCategory;

  //     await this.create(articleDto);
  //   }
  //   await browser.close();

  //   // return { title, author, content, photo, date };
  // }

  // async fetchNews(): Promise<void> {
  //   console.log('Fetching news...');
  //   const entertainmentUrl = 'https://entertain.naver.com/now';
  //   console.log("here1");
  //   const browser = await puppeteer.launch(
  //     {args: ['--no-sandbox', '--disable-setuid-sandbox']}
  //   );
  //   console.log("here2");
  //   const page = await browser.newPage();
  //   console.log("here3");
  //   await page.goto(entertainmentUrl, { waitUntil: 'networkidle0' });
  //   console.log("here4");
  //   const entertainmentArticleLinks = await page.$$eval('.rank_lst a', (el) =>
  //     el.map((a) => a.href),
  //   );
  //   console.log("here5");
  //   for (const articleLink of entertainmentArticleLinks) {
  //     console.log(articleLink);
  //     await page.goto(articleLink, { waitUntil: 'networkidle0' });
  //     const title = await page.$eval(
  //       '.NewsEndMain_article_title__kqEzS',
  //       (el) => el.textContent.trim(),
  //     );
  //     const author = await page.$eval('.NewsEndMain_article_journalist_info__Cdr3D', (el) =>
  //       el.textContent.trim(),
  //     );
  //     const content = await page.$eval('._article_content', (el) =>
  //       el.textContent.trim(),
  //     );
  //     const imageElement = await page.$('.end_photo_org img');
  //     const photo = imageElement
  //       ? await page.evaluate((img) => img.src, imageElement)
  //       : null;
  //     const date = await page.$eval('.date', (el) => el.textContent.trim());

  //     const existingArticle = await this.articleModel.findOne({ title });
  //     if (existingArticle) {
  //       const articleDto = new CreateArticleDto();
  //       articleDto.title = title;
  //       articleDto.url = articleLink;
  //       articleDto.content = content;
  //       articleDto.author = author;
  //       articleDto.date = date;
  //       articleDto.photo = photo;
  //       articleDto.category = 'Entertainment';
  //       await this.create(articleDto);
  //     }
  //   }

  //   const sportsUrl = 'https://sports.news.naver.com/index';
  //   await page.goto(sportsUrl, { waitUntil: 'networkidle0' });
  //   const sportsArticleLinks = await page.$$eval('.today_list > li > a', (el) =>
  //     el.map((a) => a.href),
  //   );
  //   // for (const articleLink of sportsArticleLinks) {
  //   //   console.log(articleLink);
  //   //   await page.goto(articleLink, { waitUntil: 'networkidle0' });
  //   //   const title = await page.$eval(
  //   //     '.NewsEndMain_article_title__kqEzS',
  //   //     (el) => el.textContent.trim(),
  //   //   );
  //   //   const author = await page.$eval(
  //   //     '.NewsEndMain_article_journalist_info__Cdr3D',
  //   //     (el) => el.textContent.trim(),
  //   //   );
  //   //   const content = await page.$eval('._article_content', (el) =>
  //   //     el.textContent.trim(),
  //   //   );
  //   //   const imageElement = await page.$('.end_photo_org img');
  //   //   const photo = imageElement
  //   //     ? await page.evaluate((img) => img.src, imageElement)
  //   //     : null;
  //   //   const date = await page.$eval('.article_head_info em', (el) =>
  //   //     el?.textContent.trim(),
  //   //   );

  //   //   const existingArticle = await this.articleModel.findOne({ title });
  //   //   if (!existingArticle) {
  //   //     const articleDto = new CreateArticleDto();
  //   //     articleDto.title = title;
  //   //     articleDto.url = articleLink;
  //   //     articleDto.content = content;
  //   //     articleDto.author = author;
  //   //     articleDto.date = date;
  //   //     articleDto.photo = photo;
  //   //     articleDto.category = 'Sports';
  //   //     await this.create(articleDto);
  //   //   }
  //   // }

  //   const newsUrls = {
  //     Politics: 'https://news.naver.com/section/100',
  //     Economy: 'https://news.naver.com/section/101',
  //     Society: 'https://news.naver.com/section/102',
  //     Culture: 'https://news.naver.com/section/103',
  //     Science: 'https://news.naver.com/section/105',
  //     World: 'https://news.naver.com/section/104',
  //   };
  //   // for (const category in newsUrls) {
  //     // 연예, 스포츠외 다른 카테고리 기사 크롤링
  //   //  const articleLinks = await this.fetchArticleLinks(newsUrls[category]);
  //   //  for (const articleLink of articleLinks) {
  //   //    await this.fetchArticleDetails(articleLink, category);
  //   //  }
  //   // }

  //   // return headlines;
  // }

  // async findReelsArticle(): Promise<void> {
  //   const yesterdayStart = moment().subtract(1, 'days').startOf('day').toDate();
  //   const todayStart = moment().startOf('day').toDate();

  //   const randomArticles = await this.articleModel
  //     .aggregate([
  //       // {
  //       //   $match: {
  //       //     createdAt: { $gte: yesterdayStart, $lt: todayStart },
  //       //   },
  //       // },
  //       {
  //         $group: {
  //           _id: '$category',
  //           articles: { $push: '$$ROOT' },
  //         },
  //       },
  //       {
  //         $project: {
  //           randomArticle: {
  //             $arrayElemAt: [
  //               '$articles',
  //               {
  //                 $floor: {
  //                   $multiply: [{ $rand: {} }, { $size: '$articles' }],
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //       },
  //     ])
  //     .exec();

  //   if (!randomArticles.length) {
  //     throw new NotFoundException(
  //       'No articles found from yesterday in any category.',
  //     );
  //   } else {
  //     // GPT에게 대사 만들어달라고 하기
  //     // randomArticle의 sumamry를 GPT로 생성한 대사로 업데이트
  //     const openAiService = new OpenAiService(new ConfigService()); // OpenAiService 인스턴스화
  //     for (const article of randomArticles) {
  //       console.log(article.randomArticle.content);
  //       const prompt = PROMPT_SUMMARIZE_TEMPLATE.replace(
  //         '{content}',
  //         article.randomArticle.content,
  //       );
  //       const speech = await openAiService.generateText(prompt); // GPT-3를 사용하여 대사 생성
  //       console.log("speech is", speech);
  //       article.randomArticle.summary = speech; // 생성된 대사로 기사 요약 업데이트
  //       await this.articleModel
  //         .findByIdAndUpdate(
  //           { _id: article.randomArticle._id },
  //           { summary: speech },
  //         )
  //         .exec(); // DB에 업데이트
  //       await this.reelsService.createReelFromArticle(article.randomArticle);
  //     }
  //   }

  //   // return randomArticles;
  // }

  // async updateArticleSummary(
  //   articleId: string,
  //   summary: string,
  // ): Promise<Article> {
  //   const updatedArticle = await this.articleModel
  //     .findByIdAndUpdate(articleId, { $set: { summary } }, { new: true })
  //     .exec();

  //   if (!updatedArticle) {
  //     throw new NotFoundException(`Article with ID ${articleId} not found`);
  //   }
  //   return updatedArticle;
  // }

  // // 필요한 다른 메서드들 (find, remove 등) 추가 가능
}
