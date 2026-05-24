import type { NextFunction, Request, Response } from 'express';

import type { HttpMethod } from './http-method.enum.js';
import type { MiddlewareInterface } from '../middleware/middleware.interface.js';

// Using `any` here keeps the handler signature loose so concrete controllers
// can declare narrower `Request<Params, ResBody, ReqBody, Query>` shapes
// without breaking TypeScript's contravariant parameter check.
export type RouteHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export interface RouteInterface {
  path: string;
  method: HttpMethod;
  handler: RouteHandler;
  middlewares?: MiddlewareInterface[];
}
