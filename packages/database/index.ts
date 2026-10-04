import { PrismaClient } from '@prisma/client';
import {
  PrismaSourceRepository,
  PrismaArticleRepository,
  PrismaScoreRepository,
  PrismaSummaryRepository
} from './src/PrismaRepositories';

export const prisma = process.env.DATABASE_URL
  ? new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
  : new PrismaClient();

// Instâncias prontas dos repositórios
export const sourceRepository = new PrismaSourceRepository(prisma);
export const articleRepository = new PrismaArticleRepository(prisma);
export const scoreRepository = new PrismaScoreRepository(prisma);
export const summaryRepository = new PrismaSummaryRepository(prisma);

export * from './src/PrismaRepositories';
export { PrismaClient } from '@prisma/client';
