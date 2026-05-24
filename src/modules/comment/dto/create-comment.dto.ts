import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'text must be a string' })
  @MinLength(5, { message: 'text min length is 5' })
  @MaxLength(1024, { message: 'text max length is 1024' })
  public text!: string;

  @IsInt({ message: 'rating must be an integer' })
  @Min(1, { message: 'rating min is 1' })
  @Max(5, { message: 'rating max is 5' })
  public rating!: number;
}
