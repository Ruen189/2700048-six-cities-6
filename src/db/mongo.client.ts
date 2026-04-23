import mongoose from 'mongoose';
import { inject, injectable } from 'inversify';

import { RestServiceToken } from '../rest-service.tokens.js';
import type { LoggerInterface } from '../logger/logger.interface.js';
import type { DatabaseClientInterface } from './db-client.interface.js';

@injectable()
export class MongoClient implements DatabaseClientInterface {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface
  ) {}

  public async connect(uri: string): Promise<void> {
    this.logger.info('Attempting to connect to MongoDB…');
    await mongoose.connect(uri);
    this.logger.info('Database connection established.');
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.logger.info('Database connection closed.');
  }
}
