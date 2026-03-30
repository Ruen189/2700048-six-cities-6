import { inject, injectable } from 'inversify';
import type mongoose from 'mongoose';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { OfferDocument } from './offer.model.js';
import type { OfferServiceInterface } from './offer-service.interface.js';
import type { CreateOfferDto } from './dto/create-offer.dto.js';
import type { UpdateOfferDto } from './dto/update-offer.dto.js';
import type { CommentDocument } from '../comment/comment.model.js';

const DEFAULT_OFFER_LIMIT = 60;
const PREMIUM_OFFER_LIMIT = 3;

@injectable()
export class OfferService implements OfferServiceInterface {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface,
    @inject(RestServiceToken.OfferModel) private readonly offerModel: mongoose.Model<OfferDocument>,
    @inject(RestServiceToken.CommentModel) private readonly commentModel: mongoose.Model<CommentDocument>
  ) {}

  public async create(dto: CreateOfferDto): Promise<OfferDocument> {
    const offer = await this.offerModel.create(dto);
    this.logger.info('New offer created', { title: dto.title });
    return offer;
  }

  public async findById(id: string): Promise<OfferDocument | null> {
    return this.offerModel
      .findById(id)
      .populate('host')
      .exec();
  }

  public async find(limit = DEFAULT_OFFER_LIMIT): Promise<OfferDocument[]> {
    return this.offerModel
      .find()
      .sort({ postDate: -1 })
      .limit(limit)
      .populate('host')
      .exec();
  }

  public async updateById(id: string, dto: UpdateOfferDto): Promise<OfferDocument | null> {
    return this.offerModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('host')
      .exec();
  }

  public async deleteById(id: string): Promise<OfferDocument | null> {
    return this.offerModel
      .findByIdAndDelete(id)
      .exec();
  }

  public async findPremiumByCity(city: string, limit = PREMIUM_OFFER_LIMIT): Promise<OfferDocument[]> {
    return this.offerModel
      .find({ city, isPremium: true })
      .sort({ postDate: -1 })
      .limit(limit)
      .populate('host')
      .exec();
  }

  public async exists(id: string): Promise<boolean> {
    const result = await this.offerModel.exists({ _id: id });
    return result !== null;
  }

  public async updateRatingAndCommentCount(offerId: string): Promise<void> {
    const [aggregation] = await this.commentModel.aggregate<{ count: number; avgRating: number }>([
      { $match: { offerId: new this.commentModel.base.Types.ObjectId(offerId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    const commentCount = aggregation?.count ?? 0;
    const rating = aggregation
      ? Math.round(aggregation.avgRating * 10) / 10
      : 0;

    await this.offerModel
      .findByIdAndUpdate(offerId, { commentCount, rating })
      .exec();

    this.logger.info('Offer rating and comment count updated', {
      offerId,
      commentCount,
      rating,
    });
  }
}
