import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/http-error.js';
import type { MiddlewareInterface } from './middleware.interface.js';

export class PrivateRouteMiddleware implements MiddlewareInterface {
  public execute(req: Request, _res: Response, next: NextFunction): void {
    if (!req.tokenPayload) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Authentication required.');
    }
    next();
  }
}
