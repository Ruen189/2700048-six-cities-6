import { Expose, Transform } from 'class-transformer';

export const DEFAULT_AVATAR_URL = '/static/default-avatar.svg';

export class UserRdo {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() ?? obj.id)
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public email!: string;

  @Expose()
  @Transform(({ obj }) => obj.avatarUrl || DEFAULT_AVATAR_URL)
  public avatarUrl!: string;

  @Expose()
  public type!: string;
}
