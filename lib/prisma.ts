import { PrismaClient } from '@prisma/client'
import type { Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Logs de diagnóstico
console.log('[Prisma] Inicializando Prisma Client...')
console.log('[Prisma] NODE_ENV:', process.env.NODE_ENV)
console.log('[Prisma] DATABASE_URL existe?', !!process.env.DATABASE_URL)
console.log('[Prisma] DATABASE_URL (primeiros 50 chars):', process.env.DATABASE_URL?.substring(0, 50) || 'NÃO DEFINIDO')
console.log('[Prisma] DIRECT_URL existe?', !!process.env.DIRECT_URL)
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL
  // Mostrar apenas informações não sensíveis
  const urlParts = dbUrl.match(/^([^:]+):\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)$/)
  if (urlParts) {
    console.log('[Prisma] DATABASE_URL parseado:', {
      protocol: urlParts[1],
      user: urlParts[2],
      host: urlParts[4],
      database: urlParts[5].split('?')[0],
      hasParams: urlParts[5].includes('?')
    })
  }
}

// Configuração do Prisma Client
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'query'] : ['error'],
}

let prisma: PrismaClient

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)
  console.log('[Prisma] ✅ Prisma Client criado com sucesso')
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
    console.log('[Prisma] ✅ Prisma Client armazenado no global (dev mode)')
  }
} catch (error) {
  console.error('[Prisma] ❌ Erro ao criar Prisma Client:', error)
  if (error instanceof Error) {
    console.error('[Prisma] Erro message:', error.message)
    console.error('[Prisma] Erro stack:', error.stack)
  }
  throw error
}

export { prisma }

