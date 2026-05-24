import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { CITY_NAMES, FACILITIES, OFFER_TYPES } from '../../../types.js';

export class LocationDto {
  @IsLatitude({ message: 'latitude must be a valid latitude' })
  public latitude!: number;

  @IsLongitude({ message: 'longitude must be a valid longitude' })
  public longitude!: number;
}

export class CreateOfferDto {
  @IsString({ message: 'title must be a string' })
  @MinLength(10, { message: 'title min length is 10' })
  @MaxLength(100, { message: 'title max length is 100' })
  public title!: string;

  @IsString({ message: 'description must be a string' })
  @MinLength(20, { message: 'description min length is 20' })
  @MaxLength(1024, { message: 'description max length is 1024' })
  public description!: string;

  @IsIn([...CITY_NAMES], { message: `city must be one of: ${CITY_NAMES.join(', ')}` })
  public city!: string;

  @IsString({ message: 'previewImage must be a string' })
  public previewImage!: string;

  @IsArray({ message: 'images must be an array' })
  @ArrayMinSize(6, { message: 'images must contain exactly 6 entries' })
  @ArrayMaxSize(6, { message: 'images must contain exactly 6 entries' })
  @IsString({ each: true, message: 'each image must be a string' })
  public images!: string[];

  @IsBoolean({ message: 'isPremium must be a boolean' })
  public isPremium!: boolean;

  @IsIn([...OFFER_TYPES], { message: `type must be one of: ${OFFER_TYPES.join(', ')}` })
  public type!: string;

  @IsInt({ message: 'bedrooms must be an integer' })
  @Min(1, { message: 'bedrooms min is 1' })
  @Max(8, { message: 'bedrooms max is 8' })
  public bedrooms!: number;

  @IsInt({ message: 'maxAdults must be an integer' })
  @Min(1, { message: 'maxAdults min is 1' })
  @Max(10, { message: 'maxAdults max is 10' })
  public maxAdults!: number;

  @IsInt({ message: 'price must be an integer' })
  @Min(100, { message: 'price min is 100' })
  @Max(100000, { message: 'price max is 100000' })
  public price!: number;

  @IsArray({ message: 'goods must be an array' })
  @ArrayMinSize(1, { message: 'goods must contain at least one item' })
  @IsIn([...FACILITIES], {
    each: true,
    message: `goods items must be one of: ${FACILITIES.join(', ')}`,
  })
  public goods!: string[];

  @IsMongoId({ message: 'host must be a valid ObjectId' })
  public host!: string;

  @ValidateNested()
  @Type(() => LocationDto)
  public location!: LocationDto;
}
