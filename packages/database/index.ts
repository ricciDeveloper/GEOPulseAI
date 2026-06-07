import { PrismaClient } from '@prisma/client';
import {
  PrismaSourceRepository,
  PrismaArticleRepository,
  PrismaScoreRepository,
  PrismaSummaryRepository
} from './src/PrismaRepositories';

// Instância singleton do PrismaClient
export const prisma = new PrismaClient();

// Instâncias prontas dos repositórios
export const sourceRepository = new PrismaSourceRepository(prisma);
export const articleRepository = new PrismaArticleRepository(prisma);
export const scoreRepository = new PrismaScoreRepository(prisma);
export const summaryRepository = new PrismaSummaryRepository(prisma);

export * from './src/PrismaRepositories';
export { PrismaClient } from '@prisma/client';
