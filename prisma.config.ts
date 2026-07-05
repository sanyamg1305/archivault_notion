import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js convention: real credentials live in .env.local (gitignored).
loadEnv({ path: ".env.local" });
loadEnv(); // fallback to .env for CI/CD environments that set it directly

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection; falls back to
    // DATABASE_URL for local dev against a non-pooled database.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
