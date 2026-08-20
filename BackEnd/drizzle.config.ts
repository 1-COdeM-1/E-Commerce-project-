/// <reference types="node" />
import { defineConfig } from "drizzle-kit";
import "dotenv/config"
export default defineConfig({
  dialect: "postgresql",
  schema: [
    "./src/db/schema.ts",
    "./src/db/relations.ts",
  ],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});