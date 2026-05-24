export const RestServiceToken = {
  Logger: Symbol('Logger'),
  Config: Symbol('Config'),
  Application: Symbol('Application'),
  DatabaseClient: Symbol('DatabaseClient'),

  UserModel: Symbol('UserModel'),
  UserService: Symbol('UserService'),
  UserController: Symbol('UserController'),

  OfferModel: Symbol('OfferModel'),
  OfferService: Symbol('OfferService'),
  OfferController: Symbol('OfferController'),

  CommentModel: Symbol('CommentModel'),
  CommentService: Symbol('CommentService'),
  CommentController: Symbol('CommentController'),

  FavoriteController: Symbol('FavoriteController'),

  ExceptionFilter: Symbol('ExceptionFilter'),
} as const;
