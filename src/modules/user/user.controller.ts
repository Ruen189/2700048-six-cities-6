import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';

import { Controller } from '../../rest/controller/controller.abstract.js';
import { HttpMethod } from '../../rest/types/http-method.enum.js';
import { HttpError } from '../../rest/errors/http-error.js';
import { ValidateDtoMiddleware } from '../../rest/middleware/validate-dto.middleware.js';
import { fillDTO } from '../../rest/helpers/fill-dto.js';
import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { UserServiceInterface } from './user-service.interface.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { UserRdo } from './rdo/user.rdo.js';

@injectable()
export class UserController extends Controller {
  constructor(
    @inject(RestServiceToken.Logger) logger: LoggerInterface,
    @inject(RestServiceToken.UserService) private readonly userService: UserServiceInterface
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
}
