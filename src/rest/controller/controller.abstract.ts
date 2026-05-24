import { Router } from 'express';
import type { RequestHandler, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';

import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { ControllerInterface } from './controller.interface.js';
import type { RouteInterface } from '../types/route.interface.js';

@injectable()
export abstract class Controller implements ControllerInterface {
  private readonly _router: Router;

  constructor(protected readonly logger: LoggerInterface) {
    this._router = Router();
  }

  get router(): Router {
    return this._router;
  }

  public addRoute(route: RouteInterface): void {
    const middlewares: RequestHandler[] = (route.middlewares ?? []).map((middleware) =>
      asyncHandler(middleware.execute.bind(middleware))
    );

    const handler = asyncHandler(route.handler.bind(this));

    this._router[route.method](route.path, ...middlewares, handler);
    this.logger.info(`Route registered: ${route.method.toUpperCase()} ${route.path}`);
  }

  public send<T>(res: Response, statusCode: number, data: T): void {
    res.type('application/json').status(statusCode).json(data);
  }

  public ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }

  public created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  public noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
