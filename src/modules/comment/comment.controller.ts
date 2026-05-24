import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import { Controller } from '../../rest/controller/controller.abstract.js';
import { HttpMethod } from '../../rest/types/http-method.enum.js';
import { DocumentExistsMiddleware } from '../../rest/middleware/document-exists.middleware.js';
import { PrivateRouteMiddleware } from '../../rest/middleware/private-route.middleware.js';
import { ValidateDtoMiddleware } from '../../rest/middleware/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../../rest/middleware/validate-objectid.middleware.js';
import { fillDTO } from '../../rest/helpers/fill-dto.js';
import { requireAuth } from '../../rest/helpers/auth.js';
import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { CommentServiceInterface } from './comment-service.interface.js';
import type { OfferServiceInterface } from '../offer/offer-service.interface.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CommentRdo } from './rdo/comment.rdo.js';

type OfferIdParam = { offerId: string };

@injectable()
export class CommentController extends Controller {
  constructor(
    @inject(RestServiceToken.Logger) logger: LoggerInterface,
    @inject(RestServiceToken.CommentService) private readonly commentService: CommentServiceInterface,
    @inject(RestServiceToken.OfferService) private readonly offerService: OfferServiceInterface
  ) {
    super(logger);

    this.logger.info('Register routes for CommentController');

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(CreateCommentDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
  }

  public async index(req: Request<OfferIdParam>, res: Response): Promise<void> {
    const comments = await this.commentService.findByOfferId(req.params.offerId);
    this.ok(res, fillDTO(CommentRdo, comments.map((comment) => comment.toObject())));
  }

  public async create(
    req: Request<OfferIdParam, Record<string, unknown>, CreateCommentDto>,
    res: Response
  ): Promise<void> {
    const { id: authorId } = requireAuth(req);
    const comment = await this.commentService.create(req.body, req.params.offerId, authorId);
    this.created(res, fillDTO(CommentRdo, comment.toObject()));
  }
}
