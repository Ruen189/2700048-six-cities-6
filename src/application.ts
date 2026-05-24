import { resolve } from 'node:path';

import express from 'express';
import type { Express } from 'express';
import { inject, injectable } from 'inversify';

import { RestServiceToken } from './rest-service.tokens.js';
import type { LoggerInterface } from './logger/logger.interface.js';
import type { ConfigInterface } from './config/config.interface.js';
import type { RestConfig } from './config/rest.config.js';
import type { DatabaseClientInterface } from './db/db-client.interface.js';
import { getMongoURI } from './db/db-uri.helper.js';
import type { ControllerInterface } from './rest/controller/controller.interface.js';
import type { ExceptionFilterInterface } from './rest/exception-filter/exception-filter.interface.js';

@injectable()
export class Application {
  private readonly server: Express;

  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface,
    @inject(RestServiceToken.Config) private readonly config: ConfigInterface<RestConfig>,
    @inject(RestServiceToken.DatabaseClient) private readonly dbClient: DatabaseClientInterface,
    @inject(RestServiceToken.ExceptionFilter) private readonly exceptionFilter: ExceptionFilterInterface,
    @inject(RestServiceToken.UserController) private readonly userController: ControllerInterface,
    @inject(RestServiceToken.OfferController) private readonly offerController: ControllerInterface,
    @inject(RestServiceToken.CommentController) private readonly commentController: ControllerInterface,
    @inject(RestServiceToken.FavoriteController) private readonly favoriteController: ControllerInterface
  ) {
    this.server = express();
  }

  public async init(): Promise<void> {
    this.logger.info('Application is initialized');

    await this.initDatabase();
    this.initMiddleware();
    this.initRoutes();
    this.initExceptionFilter();
    await this.initServer();
  }

  private async initDatabase(): Promise<void> {
    const uri = getMongoURI(
      this.config.get('dbHost'),
      this.config.get('dbPort'),
      this.config.get('dbName'),
      this.config.get('dbUser') || undefined,
      this.config.get('dbPassword') || undefined
    );

    await this.dbClient.connect(uri);
  }

  private initMiddleware(): void {
    this.logger.info('Initializing application middleware');
    this.server.use(express.json());

    const uploadDir = resolve(process.cwd(), this.config.get('uploadDirectory'));
    this.server.use('/upload', express.static(uploadDir));
    this.logger.info(`Serving static files from ${uploadDir} at /upload`);
  }

  private initRoutes(): void {
    this.logger.info('Initializing application routes');
    this.server.use('/users', this.userController.router);
    this.server.use('/offers', this.offerController.router);
    this.server.use('/offers', this.commentController.router);
    this.server.use('/favorites', this.favoriteController.router);
  }

  private initExceptionFilter(): void {
    this.logger.info('Initializing exception filter');
    this.server.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }

  private async initServer(): Promise<void> {
    const port = this.config.get('port');

    await new Promise<void>((resolveListen) => {
      this.server.listen(port, () => resolveListen());
    });

    this.logger.info(`Server started on http://localhost:${port}`);
  }
}
