import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import {
  PrismaSourceRepository,
  PrismaArticleRepository,
  PrismaScoreRepository,
  PrismaSummaryRepository
} from './src/PrismaRepositories';

let databaseUrl: string | undefined = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Encontra o caminho absoluto do arquivo do SQLite dev.db
  const possiblePaths = [
    // Caminho relativo ao módulo compilado/executado
    path.join(__dirname, 'prisma', 'dev.db'),
    path.join(__dirname, 'dev.db'),
    // Monorepo serverless deployment paths (resolvidos a partir do process.cwd())
    path.join(/*turbopackIgnore: true*/ process.cwd(), '..', '..', 'packages', 'database', 'prisma', 'dev.db'),
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'packages', 'database', 'prisma', 'dev.db'),
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'dev.db'),
    // Outros fallbacks possíveis
    path.join(/*turbopackIgnore: true*/ process.cwd(), '..', 'database', 'prisma', 'dev.db')
  ];

  let foundPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      foundPath = p;
      break;
    }
  }

  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      if (foundPath) {
        try {
          fs.copyFileSync(foundPath, tmpDbPath);
          console.log(`[Database] Copied database template to writable /tmp/dev.db`);
        } catch (err) {
          console.error(`[Database] Failed to copy database to /tmp/dev.db:`, err);
        }
      }
    }
    databaseUrl = `file:${tmpDbPath}`;
  } else if (foundPath) {
    databaseUrl = `file:${foundPath}`;
  }
}

// Instância singleton do PrismaClient configurada dinamicamente
export const prisma = databaseUrl
  ? new PrismaClient({ datasources: { db: { url: databaseUrl } } })
  : new PrismaClient();

// Instâncias prontas dos repositórios
export const sourceRepository = new PrismaSourceRepository(prisma);
export const articleRepository = new PrismaArticleRepository(prisma);
export const scoreRepository = new PrismaScoreRepository(prisma);
export const summaryRepository = new PrismaSummaryRepository(prisma);

export * from './src/PrismaRepositories';
export { PrismaClient } from '@prisma/client';
