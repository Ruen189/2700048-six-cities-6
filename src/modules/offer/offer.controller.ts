import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';

import { Controller } from '../../rest/controller/controller.abstract.js';
import { HttpMethod } from '../../rest/types/http-method.enum.js';
import { HttpError } from '../../rest/errors/http-error.js';
import { fillDTO } from '../../rest/helpers/fill-dto.js';
import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { OfferServiceInterface } from './offer-service.interface.js';
import type { CommentServiceInterface } from '../comment/comment-service.interface.js';
import type { CreateOfferDto } from './dto/create-offer.dto.js';
import type { UpdateOfferDto } from './dto/update-offer.dto.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import { OfferShortRdo } from './rdo/offer-short.rdo.js';

type OfferIdParam = { offerId: string };
type CityParam = { city: string };
type ListQuery = { limit?: string };

@injectable()
export class OfferController extends Controller {
  constructor(
    @inject(RestServiceToken.Logger) logger: LoggerInterface,
    @inject(RestServiceToken.OfferService) private readonly offerService: OfferServiceInterface,
    @inject(RestServiceToken.CommentService) private readonly commentService: CommentServiceInterface
  ) {
    super(logger);

    this.logger.info('Register routes for OfferController');

    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({ path: '/', method: HttpMethod.Post, handler: this.create });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Get, handler: this.show });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Patch, handler: this.update });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Delete, handler: this.delete });
    this.addRoute({ path: '/premium/:city', method: HttpMethod.Get, handler: this.premium });
  }

  public async index(
    req: Request<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, ListQuery>,
    res: Response
  ): Promise<void> {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offers = await this.offerService.find(limit);
    this.ok(res, fillDTO(OfferShortRdo, offers.map((offer) => offer.toObject())));
  }

  public async create(
    req: Request<Record<string, unknown>, Record<string, unknown>, CreateOfferDto>,
    res: Response
  ): Promise<void> {
    const offer = await this.offerService.create(req.body);
    const populated = await this.offerService.findById(offer.id);

    if (!populated) {
      throw new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to load created offer.');
    }

    this.created(res, fillDTO(OfferRdo, populated.toObject()));
  }

  public async show(req: Request<OfferIdParam>, res: Response): Promise<void> {
    const { offerId } = req.params;
    const offer = await this.offerService.findById(offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${offerId}» not found.`);
    }

    this.ok(res, fillDTO(OfferRdo, offer.toObject()));
  }

  public async update(
    req: Request<OfferIdParam, Record<string, unknown>, UpdateOfferDto>,
    res: Response
  ): Promise<void> {
    const { offerId } = req.params;
    const updated = await this.offerService.updateById(offerId, req.body);

    if (!updated) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${offerId}» not found.`);
    }

    this.ok(res, fillDTO(OfferRdo, updated.toObject()));
  }

  public async delete(req: Request<OfferIdParam>, res: Response): Promise<void> {
    const { offerId } = req.params;
    const deleted = await this.offerService.deleteById(offerId);

    if (!deleted) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${offerId}» not found.`);
    }

    await this.commentService.deleteByOfferId(offerId);

    this.noContent(res);
  }

  public async premium(req: Request<CityParam>, res: Response): Promise<void> {
    const { city } = req.params;
    const offers = await this.offerService.findPremiumByCity(city);
    this.ok(res, fillDTO(OfferShortRdo, offers.map((offer) => offer.toObject())));
  }
}
