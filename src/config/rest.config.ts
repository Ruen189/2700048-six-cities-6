export type RestConfig = {
  port: number;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  salt: string;
  uploadDirectory: string;
  jwtSecret: string;
  jwtExpiresIn: string;
};

