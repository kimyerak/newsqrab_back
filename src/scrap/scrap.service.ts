import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Scrap } from './scrap.schema';

@Injectable()
export class ScrapService {
  constructor(
    @InjectModel('Scrap') private readonly scrapModel: Model<Scrap>,
  ) {}

  async createScrap(scrapData: Scrap): Promise<Scrap> {
    const newScrap = new this.scrapModel(scrapData);
    return newScrap.save();
  }

  async getAllScraps(): Promise<Scrap[]> {
    return this.scrapModel.find().exec();
  }

  async updateFollowerEmoji(
    scrapId: string,
    followerEmoji: { userId: string; emoji: string },
  ): Promise<Scrap> {
    const scrap = await this.scrapModel.findById(scrapId);
    if (!scrap) {
      throw new NotFoundException('Scrap not found');
    }

    const index = scrap.followerEmojis.findIndex(
      (fe) => fe.userId.toString() === followerEmoji.userId,
    );

    if (index !== -1) {
      scrap.followerEmojis[index].emoji = followerEmoji.emoji;
    } else {
      scrap.followerEmojis.push(followerEmoji);
    }

    return scrap.save();
  }
  async findScrapsByUserNickname(usernickname: string): Promise<Scrap[]> {
    return this.scrapModel.find({ usernickname }).exec();
  }
  async findByUserIds(userIds: string[]): Promise<Scrap[]> {
    return this.scrapModel
      .find({ userId: { $in: userIds } })
      .sort({ date: -1 })
      .exec();
  }

  async getHotScraps(): Promise<Scrap[]> {
    return this.scrapModel
      .aggregate([
        {
          $addFields: {
            followerEmojisCount: { $size: '$followerEmojis' }, // 배열의 길이를 표현하는 가상의 필드 추가
          },
        },
        { $sort: { followerEmojisCount: -1 } }, // 내림차순 정렬
        { $limit: 10 }, // 필요한 경우 결과 제한
      ])
      .exec();
  }
  // Additional methods for CRUD operations can be added here
}
