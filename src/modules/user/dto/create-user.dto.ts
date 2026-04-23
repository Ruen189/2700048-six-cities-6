export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  type: string;
  avatarUrl?: string;
};
