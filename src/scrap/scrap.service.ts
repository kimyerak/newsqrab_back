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

    // const index = scrap.followerEmojis.findIndex(
    //   (fe) => fe.userId.toString() === followerEmoji.userId,
    // );

    // if (index !== -1) {
    //   scrap.followerEmojis[index].emoji = followerEmoji.emoji;
    // } else {
    //   scrap.followerEmojis.push(followerEmoji);
    // }
    scrap.followerEmojis.push(followerEmoji);
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
            followerEmojisCount: { $size: '$followerEmojis' },
          },
        },
        { $sort: { followerEmojisCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users', // The users collection
            localField: 'userId', // Field in the scraps collection
            foreignField: '_id', // Field in the users collection
            as: 'user', // Output array field to store user data
          },
        },
        { $unwind: '$user' }, // To merge user data
        {
          $addFields: {
            profilePicture: '$user.profilePicture', // Adding profilePicture to output
          },
        },
        { $project: { user: 0 } }, // Optional: remove the merged user field if not needed
      ])
      .exec();
  }
  // Additional methods for CRUD operations can be added here
}
