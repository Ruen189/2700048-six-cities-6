import { StatusCodes } from 'http-status-codes';
import type { Request } from 'express';

import { HttpError } from '../errors/http-error.js';
import type { TokenPayload } from '../../modules/auth/token-payload.type.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function requireAuth(req: Request<any, any, any, any>): TokenPayload {
  if (!req.tokenPayload) {
    throw new HttpError(StatusCodes.UNAUTHORIZED, 'Authentication required.');
  }
  return req.tokenPayload;
}
