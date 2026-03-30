import { inject, injectable } from 'inversify';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import { UserModel } from './user.model.js';
import type { UserDocument } from './user.model.js';
import type { UserServiceInterface } from './user-service.interface.js';

type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  type: string;
  avatarUrl?: string;
};

@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface
  ) {}

  public async create(dto: CreateUserDto): Promise<UserDocument> {
    const user = await UserModel.create(dto);
    this.logger.info('New user created', { email: dto.email });
    return user;
  }

  public async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }

  public async findOrCreate(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      return existing;
    }
    return this.create(dto);
  }
}
