import "dotenv/config";
import { Client } from "pg";

const c = new Client({
  connectionString: process.env.DATABASE_URL,
});
await c.connect();
const r = await c.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
);
console.log("tables:", r.rows.map((x) => x.table_name).join(", "));
await c.end();
