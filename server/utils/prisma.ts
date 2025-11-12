import Prisma from '@prisma/client'

// Workaround pour le conflit ESM/CommonJS sur Vercel
const PrismaClient = Prisma.PrismaClient || (Prisma as any).default?.PrismaClient

const globalForPrisma = global as unknown as { prisma: InstanceType<typeof PrismaClient> }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

