import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';

import { Controller } from '../../rest/controller/controller.abstract.js';
import { HttpMethod } from '../../rest/types/http-method.enum.js';
import { HttpError } from '../../rest/errors/http-error.js';
import { DocumentExistsMiddleware } from '../../rest/middleware/document-exists.middleware.js';
import { UploadFileMiddleware } from '../../rest/middleware/upload-file.middleware.js';
import { ValidateDtoMiddleware } from '../../rest/middleware/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../../rest/middleware/validate-objectid.middleware.js';
import { fillDTO } from '../../rest/helpers/fill-dto.js';
import { RestServiceToken } from '../../rest-service.tokens.js';
import type { ConfigInterface } from '../../config/config.interface.js';
import type { RestConfig } from '../../config/rest.config.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { UserServiceInterface } from './user-service.interface.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { UserRdo } from './rdo/user.rdo.js';
import { UploadAvatarRdo } from './rdo/upload-avatar.rdo.js';

type UserIdParam = { userId: string };

@injectable()
export class UserController extends Controller {
  constructor(
    @inject(RestServiceToken.Logger) logger: LoggerInterface,
    @inject(RestServiceToken.UserService) private readonly userService: UserServiceInterface,
    @inject(RestServiceToken.Config) private readonly config: ConfigInterface<RestConfig>
  ) {
    super(logger);

    this.logger.info('Register routes for UserController');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateUserDto)],
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserDto)],
    });
    this.addRoute({ path: '/login', method: HttpMethod.Get, handler: this.checkAuthenticate });
    this.addRoute({ path: '/logout', method: HttpMethod.Delete, handler: this.logout });
    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new UploadFileMiddleware(this.config.get('uploadDirectory'), 'avatar'),
        new DocumentExistsMiddleware(this.userService, 'User', 'userId'),
      ],
    });
  }

  public async create(
    req: Request<Record<string, unknown>, Record<string, unknown>, CreateUserDto>,
    res: Response
  ): Promise<void> {
    const { body } = req;

    const existing = await this.userService.findByEmail(body.email);
    if (existing) {
      throw new HttpError(StatusCodes.CONFLICT, `User with email «${body.email}» already exists.`);
    }

    const user = await this.userService.create(body);
    this.created(res, fillDTO(UserRdo, user.toObject()));
  }

  public async login(
    req: Request<Record<string, unknown>, Record<string, unknown>, LoginUserDto>,
    _res: Response
  ): Promise<void> {
    const { email } = req.body;

    const existing = await this.userService.findByEmail(email);
    if (!existing) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, `User with email «${email}» does not exist.`);
    }

    throw new HttpError(
      StatusCodes.NOT_IMPLEMENTED,
      'Authentication is not implemented yet.'
    );
  }

  public async checkAuthenticate(_req: Request, _res: Response): Promise<void> {
    throw new HttpError(
      StatusCodes.NOT_IMPLEMENTED,
      'Authentication state check is not implemented yet.'
    );
  }

  public async logout(_req: Request, res: Response): Promise<void> {
    this.noContent(res);
  }

  public async uploadAvatar(req: Request<UserIdParam>, res: Response): Promise<void> {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Avatar file is required.');
    }

    const avatarPath = `/upload/${file.filename}`;
    await this.userService.setAvatarPath(userId, avatarPath);

    this.created(res, fillDTO(UploadAvatarRdo, { avatarUrl: avatarPath }));
  }
}
