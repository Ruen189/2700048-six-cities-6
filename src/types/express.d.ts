import type { TokenPayload } from '../modules/auth/token-payload.type.js';

declare global {
  namespace Express {
    interface Request {
      tokenPayload?: TokenPayload;
    }
  }
}

export {};
