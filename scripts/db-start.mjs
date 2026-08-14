import { existsSync } from "node:fs";
import { createConnection } from "node:net";
import EmbeddedPostgres from "embedded-postgres";

const PORT = Number(process.env.PGDATA_PORT ?? 5433);
const DB_NAME = process.env.PGDATABASE ?? "dar_imam_asim";
const DATA_DIR = process.env.PGDATA_DIR ?? ".pgdata";

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

if (await isPortOpen(PORT)) {
  console.log(`[db] PostgreSQL already running on port ${PORT}`);
  process.exit(0);
}

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (!existsSync(`${DATA_DIR}/PG_VERSION`)) {
  await pg.initialise();
} else {
  console.log("[db] existing cluster found, skipping initdb");
}
await pg.start();
const client = pg.getPgClient();
await client.connect();
const { rows } = await client.query(
  "SELECT datname FROM pg_database WHERE datname = $1",
  [DB_NAME],
);
if (rows.length === 0) {
  await client.query(`CREATE DATABASE "${DB_NAME}"`);
  console.log(`[db] created database ${DB_NAME}`);
} else {
  console.log(`[db] database ${DB_NAME} already exists`);
}
await client.end();
console.log(`[db] PostgreSQL ready on port ${PORT}`);
setInterval(() => {}, 1000);
