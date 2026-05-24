import type { TokenPayload } from './token-payload.type.js';

export interface TokenServiceInterface {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload | null>;
}
