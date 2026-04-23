import { inject, injectable } from 'inversify';

import { RestServiceToken } from './rest-service.tokens.js';
import type { LoggerInterface } from './logger/logger.interface.js';
import type { ConfigInterface } from './config/config.interface.js';
import type { RestConfig } from './config/rest.config.js';
import type { DatabaseClientInterface } from './db/db-client.interface.js';
import { getMongoURI } from './db/db-uri.helper.js';

@injectable()
export class Application {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface,
    @inject(RestServiceToken.Config) private readonly config: ConfigInterface<RestConfig>,
    @inject(RestServiceToken.DatabaseClient) private readonly dbClient: DatabaseClientInterface
  ) {}

  public async init(): Promise<void> {
    this.logger.info('Application is initialized');

    const uri = getMongoURI(
      this.config.get('dbHost'),
      this.config.get('dbPort'),
      this.config.get('dbName'),
      this.config.get('dbUser') || undefined,
      this.config.get('dbPassword') || undefined
    );

    await this.dbClient.connect(uri);
  }
}
