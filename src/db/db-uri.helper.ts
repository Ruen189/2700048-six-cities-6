export function getMongoURI(
  host: string,
  port: number,
  dbName: string,
  user?: string,
  password?: string
): string {
  if (user && password) {
    return `mongodb://${user}:${password}@${host}:${port}/${dbName}?authSource=admin`;
  }
  return `mongodb://${host}:${port}/${dbName}`;
}
