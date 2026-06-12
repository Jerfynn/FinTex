import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
import * as schema from "./schema.ts";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export const createPool = () => {
  const host = process.env.SQL_HOST;
  const useSsl =
    process.env.SQL_SSL?.toLowerCase() === "true" ||
    (host && host.includes(".neon.tech"));

  return new Pool({
    host,
    port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : undefined,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 15000,
  });
};

export const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});

export const db = drizzle(pool, { schema });

export async function ensureSchema(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      full_name text,
      email text NOT NULL UNIQUE,
      phone_number text,
      bio text,
      avatar_url text,
      status text DEFAULT 'Available',
      created_at timestamp without time zone DEFAULT now(),
      updated_at timestamp without time zone DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS otp_tokens (
      id serial PRIMARY KEY,
      email text NOT NULL,
      token_hash text NOT NULL,
      expires_at timestamp without time zone NOT NULL,
      verified boolean DEFAULT false,
      created_at timestamp without time zone DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS friendships (
      id serial PRIMARY KEY,
      sender_id integer NOT NULL REFERENCES users(id),
      receiver_id integer NOT NULL REFERENCES users(id),
      status text NOT NULL,
      created_at timestamp without time zone DEFAULT now(),
      updated_at timestamp without time zone DEFAULT now(),
      CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id serial PRIMARY KEY,
      sender_id integer NOT NULL REFERENCES users(id),
      receiver_id integer NOT NULL REFERENCES users(id),
      content_type text NOT NULL,
      message_body text NOT NULL,
      media_url text,
      is_read boolean DEFAULT false,
      created_at timestamp without time zone DEFAULT now()
    );
  `;

  await pool.query(sql);
}
