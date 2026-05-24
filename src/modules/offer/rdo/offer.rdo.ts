import { Expose, Transform, Type } from 'class-transformer';

import { UserRdo } from '../../user/rdo/user.rdo.js';

export class LocationRdo {
  @Expose()
  public latitude!: number;

  @Expose()
  public longitude!: number;
}

export class OfferRdo {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() ?? obj.id)
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public postDate!: Date;

  @Expose()
  public city!: string;

  @Expose()
  public previewImage!: string;

  @Expose()
  public images!: string[];

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
  public bedrooms!: number;

  @Expose()
  public maxAdults!: number;

  @Expose()
  public price!: number;

  @Expose()
  public goods!: string[];

  @Expose()
  public commentCount!: number;

  @Expose()
  @Type(() => UserRdo)
  public host!: UserRdo;

  @Expose()
  @Transform(({ obj }) => ({ latitude: obj.latitude, longitude: obj.longitude }))
  @Type(() => LocationRdo)
  public location!: LocationRdo;
}
