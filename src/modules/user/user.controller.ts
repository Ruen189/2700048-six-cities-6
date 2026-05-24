import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';

import { Controller } from '../../rest/controller/controller.abstract.js';
import { HttpMethod } from '../../rest/types/http-method.enum.js';
import { HttpError } from '../../rest/errors/http-error.js';
import { AnonymousOnlyMiddleware } from '../../rest/middleware/anonymous-only.middleware.js';
import { PrivateRouteMiddleware } from '../../rest/middleware/private-route.middleware.js';
import { UploadFileMiddleware } from '../../rest/middleware/upload-file.middleware.js';
import { ValidateDtoMiddleware } from '../../rest/middleware/validate-dto.middleware.js';
import { fillDTO } from '../../rest/helpers/fill-dto.js';
import { requireAuth } from '../../rest/helpers/auth.js';
import { RestServiceToken } from '../../rest-service.tokens.js';
import type { ConfigInterface } from '../../config/config.interface.js';
import type { RestConfig } from '../../config/rest.config.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { TokenServiceInterface } from '../auth/token-service.interface.js';
import type { UserServiceInterface } from './user-service.interface.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { UserRdo } from './rdo/user.rdo.js';
import { LoggedUserRdo } from './rdo/logged-user.rdo.js';
import { UploadAvatarRdo } from './rdo/upload-avatar.rdo.js';

@injectable()
export class UserController extends Controller {
  constructor(
    @inject(RestServiceToken.Logger) logger: LoggerInterface,
    @inject(RestServiceToken.UserService) private readonly userService: UserServiceInterface,
    @inject(RestServiceToken.TokenService) private readonly tokenService: TokenServiceInterface,
    @inject(RestServiceToken.Config) private readonly config: ConfigInterface<RestConfig>
  ) {
    super(logger);

    this.logger.info('Register routes for UserController');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new AnonymousOnlyMiddleware(), new ValidateDtoMiddleware(CreateUserDto)],
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new AnonymousOnlyMiddleware(), new ValidateDtoMiddleware(LoginUserDto)],
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Get,
      handler: this.checkAuthenticate,
      middlewares: [new PrivateRouteMiddleware()],
    });
    this.addRoute({
      path: '/logout',
      method: HttpMethod.Delete,
      handler: this.logout,
      middlewares: [new PrivateRouteMiddleware()],
    });
    this.addRoute({
      path: '/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new PrivateRouteMiddleware(),
        new UploadFileMiddleware(this.config.get('uploadDirectory'), 'avatar'),
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
    res: Response
  ): Promise<void> {
    const { email, password } = req.body;

    const user = await this.userService.findByEmail(email);
    if (!user || !this.userService.verifyPassword(user, password)) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Invalid email or password.');
    }

    const token = await this.tokenService.sign({ id: user.id, email: user.email });
    this.ok(res, fillDTO(LoggedUserRdo, { token, email: user.email }));
  }

  public async checkAuthenticate(req: Request, res: Response): Promise<void> {
    const { id } = requireAuth(req);

    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'User not found.');
    }

    this.ok(res, fillDTO(UserRdo, user.toObject()));
  }

  public async logout(_req: Request, res: Response): Promise<void> {
    // Stateless JWT: the client discards the token on its side.
    // For session-based auth this is where the session would be invalidated.
    this.noContent(res);
  }

  public async uploadAvatar(req: Request, res: Response): Promise<void> {
    const { id } = requireAuth(req);
    const file = req.file;

    if (!file) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Avatar file is required.');
    }

    const avatarPath = `/upload/${file.filename}`;
    await this.userService.setAvatarPath(id, avatarPath);

    this.created(res, fillDTO(UploadAvatarRdo, { avatarUrl: avatarPath }));
  }
}
