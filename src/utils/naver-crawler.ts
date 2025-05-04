import axios from 'axios';
import * as cheerio from 'cheerio';

export async function crawlNaverNewsContent(url: string): Promise<string> {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(html);
    const article = $('#dic_area');

    if (!article.length) {
      return '기사 내용을 찾을 수 없습니다.';
    }

    return article.text().trim();
  } catch (e) {
    console.warn('크롤링 에러:', e.message);
    return '기사 내용은 준비 중입니다.';
  }
}