import type { CommentDocument } from './comment.model.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';

export interface CommentServiceInterface {
  create(dto: CreateCommentDto, offerId: string): Promise<CommentDocument>;
  findByOfferId(offerId: string, limit?: number): Promise<CommentDocument[]>;
  deleteByOfferId(offerId: string): Promise<void>;
}
