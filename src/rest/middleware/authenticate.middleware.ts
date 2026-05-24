import { inject, injectable } from 'inversify';
import type { NextFunction, Request, Response } from 'express';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { TokenServiceInterface } from '../../modules/auth/token-service.interface.js';
import type { MiddlewareInterface } from './middleware.interface.js';

const BEARER_PREFIX = 'Bearer ';

@injectable()
export class AuthenticateMiddleware implements MiddlewareInterface {
  constructor(
    @inject(RestServiceToken.TokenService) private readonly tokenService: TokenServiceInterface
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const header = req.headers.authorization;

    if (!header || !header.startsWith(BEARER_PREFIX)) {
      next();
      return;
    }

    const token = header.slice(BEARER_PREFIX.length).trim();
    if (!token) {
      next();
      return;
    }

    const payload = await this.tokenService.verify(token);
    if (payload) {
      req.tokenPayload = payload;
    }

    next();
  }
}
