import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export async function crawlNaverNewsContent(url: string): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  try {
    await page.waitForFunction(
      () => {
        const script = document.querySelector('script[src*="ArticleAd.js"]');
        return script?.getAttribute('data-status') === 'ready';
      },
      { timeout: 5000 } 
    );
  } catch (e) {
    console.warn('data-status="ready" 스크립트 로딩 실패');
  }

  const content = await page.evaluate(() => {
    if (location.href.includes('n.news.naver.com')) {
      return (document.querySelector('#dic_area')as HTMLElement)?.innerText || null;
    }
    const nodes = document.querySelectorAll('#comp_news_article');
    return Array.from(nodes).map(el => el.textContent?.trim()).join('\n').trim();
  });

  await browser.close();
  return content || "기사 본문 로딩 중입니다.";

}