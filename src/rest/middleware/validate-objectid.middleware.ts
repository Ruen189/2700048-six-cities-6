import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/http-error.js';
import type { MiddlewareInterface } from './middleware.interface.js';

export class ValidateObjectIdMiddleware implements MiddlewareInterface {
  constructor(private readonly paramName: string) {}

  public execute(req: Request, _res: Response, next: NextFunction): void {
    const rawValue = req.params[this.paramName];
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      next();
      return;
    }

    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      `«${value}» is not a valid ObjectId for «${this.paramName}».`
    );
  }
}
