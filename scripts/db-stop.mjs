import EmbeddedPostgres from "embedded-postgres";

const PORT = Number(process.env.PGDATA_PORT ?? 5433);
const DATA_DIR = process.env.PGDATA_DIR ?? ".pgdata";

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

await pg.stop();
console.log("[db] PostgreSQL stopped");
