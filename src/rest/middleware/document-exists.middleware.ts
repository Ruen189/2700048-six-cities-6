import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/http-error.js';
import type { DocumentExistsInterface } from './document-exists.interface.js';
import type { MiddlewareInterface } from './middleware.interface.js';

export class DocumentExistsMiddleware implements MiddlewareInterface {
  constructor(
    private readonly service: DocumentExistsInterface,
    private readonly entityName: string,
    private readonly paramName: string
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const rawValue = req.params[this.paramName];
    const documentId = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (typeof documentId !== 'string' || !(await this.service.exists(documentId))) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `${this.entityName} with id «${documentId}» not found.`
      );
    }

    next();
  }
}
