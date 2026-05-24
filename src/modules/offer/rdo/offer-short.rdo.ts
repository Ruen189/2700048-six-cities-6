import { Expose, Transform } from 'class-transformer';

export class OfferShortRdo {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() ?? obj.id)
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public postDate!: Date;

  @Expose()
  public city!: string;

  @Expose()
  public previewImage!: string;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  @Transform(({ obj }) => Boolean(obj.isFavorite))
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: string;

  @Expose()
  public price!: number;

  @Expose()
  public commentCount!: number;
}
