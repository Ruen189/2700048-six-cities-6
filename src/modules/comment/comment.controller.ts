import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';

import { Controller } from '../../rest/controller/controller.abstract.js';
import { HttpMethod } from '../../rest/types/http-method.enum.js';
import { HttpError } from '../../rest/errors/http-error.js';
import { fillDTO } from '../../rest/helpers/fill-dto.js';
import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { CommentServiceInterface } from './comment-service.interface.js';
import type { OfferServiceInterface } from '../offer/offer-service.interface.js';
import { CommentRdo } from './rdo/comment.rdo.js';

type OfferIdParam = { offerId: string };

type CreateCommentRequest = {
  text: string;
  rating: number;
  author: string;
};

@injectable()
export class CommentController extends Controller {
  constructor(
    @inject(RestServiceToken.Logger) logger: LoggerInterface,
    @inject(RestServiceToken.CommentService) private readonly commentService: CommentServiceInterface,
    @inject(RestServiceToken.OfferService) private readonly offerService: OfferServiceInterface
  ) {
    super(logger);

    this.logger.info('Register routes for CommentController');

    this.addRoute({ path: '/:offerId/comments', method: HttpMethod.Get, handler: this.index });
    this.addRoute({ path: '/:offerId/comments', method: HttpMethod.Post, handler: this.create });
  }

  public async index(req: Request<OfferIdParam>, res: Response): Promise<void> {
    const { offerId } = req.params;

    if (!(await this.offerService.exists(offerId))) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${offerId}» not found.`);
    }

    const comments = await this.commentService.findByOfferId(offerId);
    this.ok(res, fillDTO(CommentRdo, comments.map((comment) => comment.toObject())));
  }

  public async create(
    req: Request<OfferIdParam, Record<string, unknown>, CreateCommentRequest>,
    res: Response
  ): Promise<void> {
    const { offerId } = req.params;

    if (!(await this.offerService.exists(offerId))) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${offerId}» not found.`);
    }

    const comment = await this.commentService.create({ ...req.body, offerId });
    this.created(res, fillDTO(CommentRdo, comment.toObject()));
  }
}
