import { inject, injectable } from 'inversify';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import { OfferModel } from './offer.model.js';
import type { OfferDocument } from './offer.model.js';
import type { CreateOfferDto, OfferServiceInterface } from './offer-service.interface.js';

@injectable()
export class OfferService implements OfferServiceInterface {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface
  ) {}

  public async create(dto: CreateOfferDto): Promise<OfferDocument> {
    const offer = await OfferModel.create(dto);
    this.logger.info('New offer created', { title: dto.title });
    return offer;
  }

  public async findById(id: string): Promise<OfferDocument | null> {
    return OfferModel.findById(id).exec();
  }
}
