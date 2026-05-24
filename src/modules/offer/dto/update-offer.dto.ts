import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { CITY_NAMES, FACILITIES, OFFER_TYPES } from '../../../types.js';
import { LocationDto } from './create-offer.dto.js';

export class UpdateOfferDto {
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  @MinLength(10, { message: 'title min length is 10' })
  @MaxLength(100, { message: 'title max length is 100' })
  public title?: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MinLength(20, { message: 'description min length is 20' })
  @MaxLength(1024, { message: 'description max length is 1024' })
  public description?: string;

  @IsOptional()
  @IsIn([...CITY_NAMES], { message: `city must be one of: ${CITY_NAMES.join(', ')}` })
  public city?: string;

  @IsOptional()
  @IsString({ message: 'previewImage must be a string' })
  public previewImage?: string;

  @IsOptional()
  @IsArray({ message: 'images must be an array' })
  @ArrayMinSize(6, { message: 'images must contain exactly 6 entries' })
  @ArrayMaxSize(6, { message: 'images must contain exactly 6 entries' })
  @IsString({ each: true, message: 'each image must be a string' })
  public images?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isPremium must be a boolean' })
  public isPremium?: boolean;

  @IsOptional()
  @IsIn([...OFFER_TYPES], { message: `type must be one of: ${OFFER_TYPES.join(', ')}` })
  public type?: string;

  @IsOptional()
  @IsInt({ message: 'bedrooms must be an integer' })
  @Min(1, { message: 'bedrooms min is 1' })
  @Max(8, { message: 'bedrooms max is 8' })
  public bedrooms?: number;

  @IsOptional()
  @IsInt({ message: 'maxAdults must be an integer' })
  @Min(1, { message: 'maxAdults min is 1' })
  @Max(10, { message: 'maxAdults max is 10' })
  public maxAdults?: number;

  @IsOptional()
  @IsInt({ message: 'price must be an integer' })
  @Min(100, { message: 'price min is 100' })
  @Max(100000, { message: 'price max is 100000' })
  public price?: number;

  @IsOptional()
  @IsArray({ message: 'goods must be an array' })
  @ArrayMinSize(1, { message: 'goods must contain at least one item' })
  @IsIn([...FACILITIES], {
    each: true,
    message: `goods items must be one of: ${FACILITIES.join(', ')}`,
  })
  public goods?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  public location?: LocationDto;
}
