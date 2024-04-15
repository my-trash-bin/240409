export function env(key: string): string {
  const result = process.env[key];
  if (typeof result !== "string")
    throw new Error(`Environment variable ${key} is not set`);
  return result;
}
