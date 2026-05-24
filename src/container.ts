import { Container } from 'inversify';
import type mongoose from 'mongoose';

import { Application } from './application.js';
import { ConfigService } from './config/config.service.js';
import type { ConfigInterface } from './config/config.interface.js';
import type { RestConfig } from './config/rest.config.js';
import { PinoLogger } from './logger/pino.logger.js';
import type { LoggerInterface } from './logger/logger.interface.js';
import { MongoClient } from './db/mongo.client.js';
import type { DatabaseClientInterface } from './db/db-client.interface.js';
import { ExceptionFilter } from './rest/exception-filter/exception-filter.js';
import type { ExceptionFilterInterface } from './rest/exception-filter/exception-filter.interface.js';
import type { ControllerInterface } from './rest/controller/controller.interface.js';
import { UserModel } from './modules/user/user.model.js';
import type { UserDocument } from './modules/user/user.model.js';
import { UserService } from './modules/user/user.service.js';
import { UserController } from './modules/user/user.controller.js';
import type { UserServiceInterface } from './modules/user/user-service.interface.js';
import { OfferModel } from './modules/offer/offer.model.js';
import type { OfferDocument } from './modules/offer/offer.model.js';
import { OfferService } from './modules/offer/offer.service.js';
import { OfferController } from './modules/offer/offer.controller.js';
import type { OfferServiceInterface } from './modules/offer/offer-service.interface.js';
import { CommentModel } from './modules/comment/comment.model.js';
import type { CommentDocument } from './modules/comment/comment.model.js';
import { CommentService } from './modules/comment/comment.service.js';
import { CommentController } from './modules/comment/comment.controller.js';
import type { CommentServiceInterface } from './modules/comment/comment-service.interface.js';
import { FavoriteController } from './modules/favorite/favorite.controller.js';
import { RestServiceToken } from './rest-service.tokens.js';

const container = new Container();

container.bind<LoggerInterface>(RestServiceToken.Logger).to(PinoLogger).inSingletonScope();
container.bind<ConfigInterface<RestConfig>>(RestServiceToken.Config).to(ConfigService).inSingletonScope();
container.bind<Application>(RestServiceToken.Application).to(Application).inSingletonScope();
container.bind<DatabaseClientInterface>(RestServiceToken.DatabaseClient).to(MongoClient).inSingletonScope();
container.bind<ExceptionFilterInterface>(RestServiceToken.ExceptionFilter).to(ExceptionFilter).inSingletonScope();

container.bind<mongoose.Model<UserDocument>>(RestServiceToken.UserModel).toConstantValue(UserModel);
container.bind<UserServiceInterface>(RestServiceToken.UserService).to(UserService).inSingletonScope();
container.bind<ControllerInterface>(RestServiceToken.UserController).to(UserController).inSingletonScope();

container.bind<mongoose.Model<OfferDocument>>(RestServiceToken.OfferModel).toConstantValue(OfferModel);
container.bind<OfferServiceInterface>(RestServiceToken.OfferService).to(OfferService).inSingletonScope();
container.bind<ControllerInterface>(RestServiceToken.OfferController).to(OfferController).inSingletonScope();

container.bind<mongoose.Model<CommentDocument>>(RestServiceToken.CommentModel).toConstantValue(CommentModel);
container.bind<CommentServiceInterface>(RestServiceToken.CommentService).to(CommentService).inSingletonScope();
container.bind<ControllerInterface>(RestServiceToken.CommentController).to(CommentController).inSingletonScope();

container.bind<ControllerInterface>(RestServiceToken.FavoriteController).to(FavoriteController).inSingletonScope();

export { container };
