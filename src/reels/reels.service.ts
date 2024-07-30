import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reels } from './reels.schema';
import { CreateReelsDto } from './dto/create-reels.dto';
import { UpdateReelsDto } from './dto/update-reels.dto';

@Injectable()
export class ReelsService {
  constructor(@InjectModel(Reels.name) private reelsModel: Model<Reels>) {}

  async create(createReelsDto: CreateReelsDto): Promise<Reels> {
    // 기본 owner 값 설정
    const owner = createReelsDto.owner || 'newsqrap';

    const newReels = new this.reelsModel({
      ...createReelsDto,
      owner,
    });
    return newReels.save();
  }

  async update(id: string, updateReelsDto: UpdateReelsDto): Promise<Reels> {
    const updatedReels = await this.reelsModel
      .findByIdAndUpdate(id, updateReelsDto, { new: true })
      .exec();
    if (!updatedReels) {
      throw new NotFoundException(`Reels with ID ${id} not found`);
    }
    return updatedReels;
  }
  async findByDate(date: string): Promise<Reels[]> {
    // Assuming the 'createdAt' field exists and is in ISO format
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    return this.reelsModel
      .find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      })
      .exec();
  }
}
