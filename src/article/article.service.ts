import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

import puppeteer from 'puppeteer';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const newArticle = new this.articleModel(createArticleDto);
    return newArticle.save();
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const updatedArticle = await this.articleModel
      .findByIdAndUpdate(id, updateArticleDto, { new: true })
      .exec();
    if (!updatedArticle) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return updatedArticle;
  }

  async findAll(): Promise<Article[]> {
    return this.articleModel.find().exec();
  }

  async fetchArticleLinks(url: string): Promise<string[]> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const uniqueLinks = await page.$$eval(
      'ul.sa_list > li .sa_thumb_link',
      (links) => {
        const linksSet = new Set<string>();
        links.forEach((link) => {
          const url = (link as HTMLAnchorElement).href;
          linksSet.add(url);
        });
        return Array.from(linksSet); // Set을 배열로 변환하여 반환
      },
    );
    await browser.close();
    return uniqueLinks;
  }

  async fetchArticleDetails(articleUrl: string): Promise<{
    title: string;
    author: string;
    content: string;
    picture: string;
    date: string;
  }> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(articleUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 1000,
    });

    // 시뮬레이션할 클릭 이벤트가 있다면 실행
    try {
      await page.waitForSelector('[data-clk="rpt.back"]', { visible: true });
      await page.click('[data-clk="rpt.back"]');
    } catch (e) {
      console.log('No pop-up');
    }

    const title = await page.$eval('.media_end_head_title', (el) =>
      el.textContent.trim(),
    );
    const author = await page.$eval('.byline', (el) => el.textContent.trim());
    const content = await page.$eval('#newsct_article', (el) =>
      el.textContent.trim(),
    );
    const picture = await page.$eval('.end_photo_org img', (el) => el?.src);
    const date = await page.$eval('.media_end_head_info_datestamp_time', (el) =>
      el.textContent.trim(),
    );

    await browser.close();

    return { title, author, content, picture, date };
  }

  async fetchNews(): Promise<any[]> {
    const headlines = [];

    const entertainmentUrl = 'https://entertain.naver.com/now';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(entertainmentUrl, { waitUntil: 'networkidle0' });
    const entertainmentArticleLinks = await page.$$eval('.rank_lst a', (el) =>
      el.map((a) => a.href),
    );
    for (const articleLink of entertainmentArticleLinks) {
      await page.goto(articleLink, { waitUntil: 'networkidle0' });
      const title = await page.$eval(
        '.NewsEndMain_article_title__kqEzS',
        (el) => el.textContent.trim(),
      );
      const author = await page.$eval('.article_head_info em', (el) =>
        el.textContent.trim(),
      );
      const content = await page.$eval('._article_content', (el) =>
        el.textContent.trim(),
      );
      const imageElement = await page.$('.end_photo_org img');
      const picture = imageElement ? await page.evaluate(img => img.src, imageElement) : null;
      const date = await page.$eval('.date', el => el.textContent.trim());
      headlines.push({
        category: 'Entertainment',
        title,
        author,
        content,
        picture,
        date,
        link: articleLink,
      });
    }

    const sportsUrl = 'https://sports.news.naver.com/index';
    await page.goto(sportsUrl, { waitUntil: 'networkidle0' });
    const sportsArticleLinks = await page.$$eval('.today_list > li > a', (el) =>
      el.map((a) => a.href),
    );
    for (const articleLink of sportsArticleLinks) {
      await page.goto(articleLink, { waitUntil: 'networkidle0' });
      const title = await page.$eval('.NewsEndMain_article_title__kqEzS', el => el.textContent.trim());
      const author = await page.$eval('.NewsEndMain_article_journalist_info__Cdr3D', el => el.textContent.trim());
      const content = await page.$eval('._article_content', el => el.textContent.trim());
      const imageElement = await page.$('.end_photo_org img');
      const picture = imageElement ? await page.evaluate(img => img.src, imageElement) : null;
      const date = await page.$eval('.article_head_info em', el => el?.textContent.trim());
      headlines.push({
        category: 'Sports',
        title,
        author,
        content,
        picture,
        date,
        link: articleLink,
      });
    }

    const newsUrls = {
      Politics: 'https://news.naver.com/section/100',
      Economy: 'https://news.naver.com/section/101',
      Society: 'https://news.naver.com/section/102',
      Culture: 'https://news.naver.com/section/103',
      Science: 'https://news.naver.com/section/105',
      World: 'https://news.naver.com/section/104',
    };
    for (const category in newsUrls) {
      // 연예, 스포츠외 다른 카테고리 기사 크롤링
      const articleLinks = await this.fetchArticleLinks(newsUrls[category]);
      for (const articleLink of articleLinks) {
        const articleDetails = await this.fetchArticleDetails(articleLink);
        headlines.push({
          category,
          ...articleDetails,
          link: articleLink,
        });
      }
    }

    return headlines;
  }

  // 필요한 다른 메서드들 (find, remove 등) 추가 가능
}
