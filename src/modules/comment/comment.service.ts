import { inject, injectable } from 'inversify';
import type mongoose from 'mongoose';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { CommentDocument } from './comment.model.js';
import type { CommentServiceInterface } from './comment-service.interface.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';
import type { OfferServiceInterface } from '../offer/offer-service.interface.js';

const DEFAULT_COMMENT_LIMIT = 50;

@injectable()
export class CommentService implements CommentServiceInterface {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface,
    @inject(RestServiceToken.CommentModel) private readonly commentModel: mongoose.Model<CommentDocument>,
    @inject(RestServiceToken.OfferService) private readonly offerService: OfferServiceInterface
  ) {}

  public async create(dto: CreateCommentDto): Promise<CommentDocument> {
    const comment = await this.commentModel.create({
      ...dto,
      postDate: new Date(),
    });

    await this.offerService.updateRatingAndCommentCount(dto.offerId);

    this.logger.info('New comment created', { offerId: dto.offerId });
    return comment.populate('author');
  }

  public async findByOfferId(offerId: string, limit = DEFAULT_COMMENT_LIMIT): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ offerId })
      .sort({ postDate: -1 })
      .limit(limit)
      .populate('author')
      .exec();
  }

  public async deleteByOfferId(offerId: string): Promise<void> {
    await this.commentModel.deleteMany({ offerId }).exec();
    this.logger.info('Comments deleted for offer', { offerId });
  }
}
