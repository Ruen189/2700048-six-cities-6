import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';

import { Controller } from '../../rest/controller/controller.abstract.js';
import { HttpMethod } from '../../rest/types/http-method.enum.js';
import { HttpError } from '../../rest/errors/http-error.js';
import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { OfferServiceInterface } from '../offer/offer-service.interface.js';

type OfferIdParam = { offerId: string };

@injectable()
export class FavoriteController extends Controller {
  constructor(
    @inject(RestServiceToken.Logger) logger: LoggerInterface,
    @inject(RestServiceToken.OfferService) private readonly offerService: OfferServiceInterface
  ) {
    super(logger);

    this.logger.info('Register routes for FavoriteController');

    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Post, handler: this.add });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Delete, handler: this.remove });
  }

  public async index(_req: Request, _res: Response): Promise<void> {
    throw new HttpError(
      StatusCodes.NOT_IMPLEMENTED,
      'Listing favorites requires authentication, not implemented yet.'
    );
  }

  public async add(req: Request<OfferIdParam>, _res: Response): Promise<void> {
    const { offerId } = req.params;

    if (!(await this.offerService.exists(offerId))) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${offerId}» not found.`);
    }

    throw new HttpError(
      StatusCodes.NOT_IMPLEMENTED,
      'Adding to favorites requires authentication, not implemented yet.'
    );
  }

  public async remove(req: Request<OfferIdParam>, _res: Response): Promise<void> {
    const { offerId } = req.params;

    if (!(await this.offerService.exists(offerId))) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${offerId}» not found.`);
    }

    throw new HttpError(
      StatusCodes.NOT_IMPLEMENTED,
      'Removing from favorites requires authentication, not implemented yet.'
    );
  }
}
