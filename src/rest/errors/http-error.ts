export class HttpError extends Error {
  public readonly httpStatusCode: number;
  public readonly details?: string[];

  constructor(httpStatusCode: number, message: string, details?: string[]) {
    super(message);
    this.httpStatusCode = httpStatusCode;
    this.details = details;
    this.name = 'HttpError';
  }
}
