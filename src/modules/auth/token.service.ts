import { inject, injectable } from 'inversify';
import { jwtVerify, SignJWT } from 'jose';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { ConfigInterface } from '../../config/config.interface.js';
import type { RestConfig } from '../../config/rest.config.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { TokenServiceInterface } from './token-service.interface.js';
import type { TokenPayload } from './token-payload.type.js';

const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'six-cities';

@injectable()
export class TokenService implements TokenServiceInterface {
  private readonly secret: Uint8Array;
  private readonly expiresIn: string;

  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface,
    @inject(RestServiceToken.Config) config: ConfigInterface<RestConfig>
  ) {
    this.secret = new TextEncoder().encode(config.get('jwtSecret'));
    this.expiresIn = config.get('jwtExpiresIn');
  }

  public async sign(payload: TokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuer(JWT_ISSUER)
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);
  }

  public async verify(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: [JWT_ALGORITHM],
        issuer: JWT_ISSUER,
      });

      if (typeof payload.id !== 'string' || typeof payload.email !== 'string') {
        return null;
      }

      return { id: payload.id, email: payload.email };
    } catch (error) {
      this.logger.info('JWT verification failed', {
        reason: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}
