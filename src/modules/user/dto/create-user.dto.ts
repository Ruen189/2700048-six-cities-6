import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { USER_TYPES } from '../../../types.js';

export class CreateUserDto {
  @IsString({ message: 'name must be a string' })
  @MinLength(1, { message: 'name min length is 1' })
  @MaxLength(15, { message: 'name max length is 15' })
  public name!: string;

  @IsEmail({}, { message: 'email must be a valid email address' })
  public email!: string;

  @IsOptional()
  @IsString({ message: 'avatarUrl must be a string' })
  @Matches(/\.(jpe?g|png)$/i, { message: 'avatarUrl must end with .jpg or .png' })
  public avatarUrl?: string;

  @IsString({ message: 'password must be a string' })
  @MinLength(6, { message: 'password min length is 6' })
  @MaxLength(12, { message: 'password max length is 12' })
  public password!: string;

  @IsIn([...USER_TYPES], { message: `type must be one of: ${USER_TYPES.join(', ')}` })
  public type!: string;
}
