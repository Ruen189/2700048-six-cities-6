import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';

import { Controller } from '../../rest/controller/controller.abstract.js';
import { HttpMethod } from '../../rest/types/http-method.enum.js';
import { HttpError } from '../../rest/errors/http-error.js';
import { DocumentExistsMiddleware } from '../../rest/middleware/document-exists.middleware.js';
import { PrivateRouteMiddleware } from '../../rest/middleware/private-route.middleware.js';
import { ValidateDtoMiddleware } from '../../rest/middleware/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../../rest/middleware/validate-objectid.middleware.js';
import { fillDTO } from '../../rest/helpers/fill-dto.js';
import { requireAuth } from '../../rest/helpers/auth.js';
import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { OfferServiceInterface } from './offer-service.interface.js';
import type { CommentServiceInterface } from '../comment/comment-service.interface.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
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
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateOfferDto),
      ],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
    this.addRoute({ path: '/premium/:city', method: HttpMethod.Get, handler: this.premium });
  }

  public async index(
    req: Request<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, ListQuery>,
    res: Response
  ): Promise<void> {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offers = await this.offerService.find(limit, req.tokenPayload?.id);
    this.ok(res, fillDTO(OfferShortRdo, offers));
  }

  public async create(
    req: Request<Record<string, unknown>, Record<string, unknown>, CreateOfferDto>,
    res: Response
  ): Promise<void> {
    const { id: hostId } = requireAuth(req);
    const offer = await this.offerService.create(req.body, hostId);
    this.created(res, fillDTO(OfferRdo, offer));
  }

  public async show(req: Request<OfferIdParam>, res: Response): Promise<void> {
    const offer = await this.offerService.findById(req.params.offerId, req.tokenPayload?.id);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${req.params.offerId}» not found.`);
    }

    this.ok(res, fillDTO(OfferRdo, offer));
  }

  public async update(
    req: Request<OfferIdParam, Record<string, unknown>, UpdateOfferDto>,
    res: Response
  ): Promise<void> {
    const { id: userId } = requireAuth(req);
    await this.assertOwnership(req.params.offerId, userId);

    const updated = await this.offerService.updateById(req.params.offerId, req.body, userId);

    if (!updated) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${req.params.offerId}» not found.`);
    }

    this.ok(res, fillDTO(OfferRdo, updated));
  }

  public async delete(req: Request<OfferIdParam>, res: Response): Promise<void> {
    const { id: userId } = requireAuth(req);
    const { offerId } = req.params;

    await this.assertOwnership(offerId, userId);

    await this.offerService.deleteById(offerId);
    await this.commentService.deleteByOfferId(offerId);
    this.noContent(res);
  }

  public async premium(req: Request<CityParam>, res: Response): Promise<void> {
    const { city } = req.params;
    const offers = await this.offerService.findPremiumByCity(city, undefined, req.tokenPayload?.id);
    this.ok(res, fillDTO(OfferShortRdo, offers));
  }

  private async assertOwnership(offerId: string, userId: string): Promise<void> {
    const ownerId = await this.offerService.findOwnerId(offerId);
    if (ownerId && ownerId !== userId) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        `You are not allowed to modify offer «${offerId}».`
      );
    }
  }
}
