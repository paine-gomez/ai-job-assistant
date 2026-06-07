/**
 * 一键创建 Turso 数据库表
 * 使用方式：npx tsx scripts/setup-turso.ts
 */
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("请设置 DATABASE_URL 环境变量");
  process.exit(1);
}

const client = createClient({ url });

async function main() {
  console.log("连接到 Turso...");
  console.log("创建 Document 表...");
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Document (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      content TEXT NOT NULL,
      fileType TEXT NOT NULL,
      fileUrl TEXT,
      fileSize INTEGER,
      chunkCount INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("创建 Chunk 表...");
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Chunk (
      id TEXT PRIMARY KEY,
      documentId TEXT NOT NULL,
      content TEXT NOT NULL,
      chunkIndex INTEGER NOT NULL,
      tokenCount INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (documentId) REFERENCES Document(id) ON DELETE CASCADE
    )
  `);

  console.log("创建 Chunk 索引...");
  await client.execute(`
    CREATE INDEX IF NOT EXISTS Chunk_documentId_idx ON Chunk(documentId)
  `);

  console.log("完成！Turso 数据库已就绪。");
  await client.close();
}

main().catch((e) => {
  console.error("失败:", e);
  process.exit(1);
});
