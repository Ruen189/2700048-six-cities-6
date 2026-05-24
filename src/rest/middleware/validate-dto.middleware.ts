import { plainToInstance } from 'class-transformer';
import type { ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';
import type { ValidationError } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/http-error.js';
import type { MiddlewareInterface } from './middleware.interface.js';

export class ValidateDtoMiddleware<T extends object> implements MiddlewareInterface {
  constructor(private readonly dtoClass: ClassConstructor<T>) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const instance = plainToInstance(this.dtoClass, req.body, {
      enableImplicitConversion: true,
    });

    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Validation error',
        this.collectMessages(errors)
      );
    }

    req.body = instance;
    next();
  }

  private collectMessages(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    const walk = (error: ValidationError): void => {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }
      if (error.children?.length) {
        error.children.forEach(walk);
      }
    };

    errors.forEach(walk);
    return messages;
  }
}
