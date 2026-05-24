import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { ExceptionFilterInterface } from './exception-filter.interface.js';
import { HttpError } from '../errors/http-error.js';

@injectable()
export class ExceptionFilter implements ExceptionFilterInterface {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface
  ) {}

  public catch(error: Error, req: Request, res: Response, next: NextFunction): void {
    if (res.headersSent) {
      next(error);
      return;
    }

    if (error instanceof HttpError) {
      this.handleHttpError(error, req, res);
      return;
    }

    this.handleUnknownError(error, req, res);
  }

  private handleHttpError(error: HttpError, req: Request, res: Response): void {
    this.logger.error(`[HttpError] ${req.method} ${req.originalUrl}: ${error.message}`, {
      status: error.httpStatusCode,
      details: error.details,
    });

    res
      .type('application/json')
      .status(error.httpStatusCode)
      .json({
        error: error.message,
        details: error.details,
      });
  }

  private handleUnknownError(error: Error, req: Request, res: Response): void {
    this.logger.error(`[ServerError] ${req.method} ${req.originalUrl}: ${error.message}`, {
      stack: error.stack,
    });

    res
      .type('application/json')
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        error: 'Internal server error',
      });
  }
}
