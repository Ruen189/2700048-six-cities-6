import { createHmac, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string, salt: string): string {
  return createHmac('sha256', salt).update(password).digest('hex');
}

export function comparePassword(plain: string, hash: string, salt: string): boolean {
  const candidate = Buffer.from(hashPassword(plain, salt));
  const expected = Buffer.from(hash);
  if (candidate.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(candidate, expected);
}
