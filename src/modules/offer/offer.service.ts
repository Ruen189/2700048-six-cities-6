import { inject, injectable } from 'inversify';
import type mongoose from 'mongoose';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { OfferDocument } from './offer.model.js';
import type { CreateOfferDto, OfferServiceInterface } from './offer-service.interface.js';

@injectable()
export class OfferService implements OfferServiceInterface {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface,
    @inject(RestServiceToken.OfferModel) private readonly offerModel: mongoose.Model<OfferDocument>
  ) {}

  public async create(dto: CreateOfferDto): Promise<OfferDocument> {
    const offer = await this.offerModel.create(dto);
    this.logger.info('New offer created', { title: dto.title });
    return offer;
  }

  public async findById(id: string): Promise<OfferDocument | null> {
    return this.offerModel.findById(id).exec();
  }
}
