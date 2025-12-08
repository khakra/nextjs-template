import "dotenv/config";
import { defineConfig, env } from "prisma/config";

console.log("DATABASE_URL:", env("DATABASE_URL"));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
