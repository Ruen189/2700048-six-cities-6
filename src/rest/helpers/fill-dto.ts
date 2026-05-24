import { plainToInstance } from 'class-transformer';
import type { ClassConstructor } from 'class-transformer';

export function fillDTO<T, V>(dto: ClassConstructor<T>, plain: V): T;
export function fillDTO<T, V>(dto: ClassConstructor<T>, plain: V[]): T[];
export function fillDTO<T, V>(dto: ClassConstructor<T>, plain: V | V[]): T | T[] {
  return plainToInstance(dto, plain, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });
}
