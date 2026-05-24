import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import { Controller } from '../../rest/controller/controller.abstract.js';
import { HttpMethod } from '../../rest/types/http-method.enum.js';
import { DocumentExistsMiddleware } from '../../rest/middleware/document-exists.middleware.js';
import { PrivateRouteMiddleware } from '../../rest/middleware/private-route.middleware.js';
import { ValidateObjectIdMiddleware } from '../../rest/middleware/validate-objectid.middleware.js';
import { fillDTO } from '../../rest/helpers/fill-dto.js';
import { requireAuth } from '../../rest/helpers/auth.js';
import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { OfferServiceInterface } from '../offer/offer-service.interface.js';
import type { UserServiceInterface } from '../user/user-service.interface.js';
import { OfferShortRdo } from '../offer/rdo/offer-short.rdo.js';

type OfferIdParam = { offerId: string };

@injectable()
export class FavoriteController extends Controller {
  constructor(
    @inject(RestServiceToken.Logger) logger: LoggerInterface,
    @inject(RestServiceToken.OfferService) private readonly offerService: OfferServiceInterface,
    @inject(RestServiceToken.UserService) private readonly userService: UserServiceInterface
  ) {
    super(logger);

    this.logger.info('Register routes for FavoriteController');

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [new PrivateRouteMiddleware()],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
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
  }

  public async index(req: Request, res: Response): Promise<void> {
    const { id: userId } = requireAuth(req);
    const favorites = await this.userService.findFavorites(userId);
    const offers = await this.offerService.findByIds(favorites, userId);
    this.ok(res, fillDTO(OfferShortRdo, offers));
  }

  public async create(req: Request<OfferIdParam>, res: Response): Promise<void> {
    const { id: userId } = requireAuth(req);
    await this.userService.addToFavorites(userId, req.params.offerId);
    this.noContent(res);
  }

  public async delete(req: Request<OfferIdParam>, res: Response): Promise<void> {
    const { id: userId } = requireAuth(req);
    await this.userService.removeFromFavorites(userId, req.params.offerId);
    this.noContent(res);
  }
}
