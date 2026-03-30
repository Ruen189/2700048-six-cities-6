export const RestServiceToken = {
  Logger: Symbol('Logger'),
  Config: Symbol('Config'),
  Application: Symbol('Application'),
  DatabaseClient: Symbol('DatabaseClient'),
  UserModel: Symbol('UserModel'),
  UserService: Symbol('UserService'),
  OfferModel: Symbol('OfferModel'),
  OfferService: Symbol('OfferService'),
  CommentModel: Symbol('CommentModel'),
  CommentService: Symbol('CommentService'),
} as const;
