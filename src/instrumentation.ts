/**
 * Stops a production server from starting with missing or weak secrets. A clear failure at
 * startup is much better than a site that runs with broken logins or an unusable database.
 */
export function register() {
  if (process.env.NODE_ENV !== "production") return;

  const problems: string[] = [];
  if (!process.env.DATABASE_URL) problems.push("DATABASE_URL is missing");
  if ((process.env.BETTER_AUTH_SECRET?.length ?? 0) < 32) {
    problems.push("BETTER_AUTH_SECRET must be at least 32 characters");
  }
  if (!process.env.BETTER_AUTH_URL && !process.env.VERCEL_URL) {
    problems.push("BETTER_AUTH_URL is missing");
  }
  if (problems.length > 0) {
    throw new Error(`UMEXA can't start: ${problems.join("; ")}.`);
  }
}
