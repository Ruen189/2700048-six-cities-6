import type { UserDocument } from './user.model.js';

export interface UserServiceInterface {
  create(dto: {
    name: string;
    email: string;
    password: string;
    type: string;
    avatarUrl?: string;
  }): Promise<UserDocument>;
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  findOrCreate(dto: {
    name: string;
    email: string;
    password: string;
    type: string;
    avatarUrl?: string;
  }): Promise<UserDocument>;
}
