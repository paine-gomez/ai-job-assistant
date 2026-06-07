import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});
