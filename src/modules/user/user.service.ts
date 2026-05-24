import { inject, injectable } from 'inversify';
import type mongoose from 'mongoose';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { UserDocument } from './user.model.js';
import type { UserServiceInterface } from './user-service.interface.js';
import type { CreateUserDto } from './dto/create-user.dto.js';

@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface,
    @inject(RestServiceToken.UserModel) private readonly userModel: mongoose.Model<UserDocument>
  ) {}

  public async create(dto: CreateUserDto): Promise<UserDocument> {
    const user = await this.userModel.create(dto);
    this.logger.info('New user created', { email: dto.email });
    return user;
  }

  public async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async findOrCreate(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      return existing;
    }
    return this.create(dto);
  }

  public async exists(documentId: string): Promise<boolean> {
    const result = await this.userModel.exists({ _id: documentId });
    return result !== null;
  }

  public async setAvatarPath(userId: string, avatarPath: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { avatarUrl: avatarPath }, { new: true })
      .exec();
  }

  public async addToFavorites(userId: string, offerId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { favorites: offerId } },
        { new: true }
      )
      .exec();
  }

  public async removeFromFavorites(userId: string, offerId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { favorites: offerId } },
        { new: true }
      )
      .exec();
  }

  public async findFavorites(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      return [];
    }
    return user.favorites.map((id) => id.toString());
  }
}
