/**
 * Runs a real PostgreSQL server for local development, with no Docker or installer.
 * Credentials come from DATABASE_URL in .env.local. Data lives in .postgres (not in git).
 * Production uses managed PostgreSQL instead, so this never runs there.
 *
 *   npm run db:dev
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import EmbeddedPostgres from "embedded-postgres";

config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Copy .env.example to .env.local first.");
  process.exit(1);
}

const url = new URL(process.env.DATABASE_URL);
const databaseDir = resolve(".postgres");
const database = url.pathname.slice(1);
const firstRun = !existsSync(resolve(databaseDir, "PG_VERSION"));

const server = new EmbeddedPostgres({
  databaseDir,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  port: Number(url.port),
  persistent: true,
  autoRehydrateSymlinks: true,
  onLog: () => {},
});

if (firstRun) await server.initialise();
await server.start();
if (firstRun) await server.createDatabase(database);

console.log(
  `PostgreSQL is ready on port ${url.port}, database "${database}". Press Ctrl+C to stop.`,
);

const stop = async () => {
  await server.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
