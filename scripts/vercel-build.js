#!/usr/bin/env node

/**
 * Script de build para Vercel
 * Tenta criar as tabelas do banco automaticamente durante o build
 * Se falhar, não quebra o build (as tabelas podem ser criadas manualmente depois)
 */

const { execSync } = require('child_process')
const path = require('path')

console.log('🔧 Verificando banco de dados...\n')

// Verificar se DATABASE_URL está configurado
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL não está configurado. Pulando criação de tabelas.')
  console.log('   Configure DATABASE_URL na Vercel e execute: npm run db:setup\n')
  process.exit(0)
}

// Verificar se é PostgreSQL (não SQLite)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
  console.log('ℹ️  SQLite detectado. Pulando criação de tabelas (usar apenas em desenvolvimento).\n')
  process.exit(0)
}

try {
  const prismaPath = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma')
  
  console.log('📦 Tentando criar tabelas no banco de dados...\n')
  
  const startTime = Date.now()
  
  // Executar prisma db push de forma silenciosa
  // Se falhar, não quebrar o build
  try {
    execSync(`${prismaPath} db push --skip-generate --accept-data-loss`, {
      stdio: 'pipe', // Silencioso para não poluir logs do build
      env: {
        ...process.env,
        PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary',
      },
      cwd: path.join(__dirname, '..'),
      timeout: 30000 // 30 segundos de timeout
    })
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`✅ Tabelas criadas/verificadas com sucesso! (${duration}s)\n`)
  } catch (dbError) {
    // Se falhar, apenas avisar mas não quebrar o build
    console.warn('⚠️  Não foi possível criar as tabelas automaticamente durante o build.')
    console.warn('   Isso é normal se as tabelas já existem ou se houver problemas de conexão.')
    console.warn('   Execute manualmente: npm run db:setup\n')
    // Não falhar o build - as tabelas podem ser criadas depois
  }
} catch (error) {
  console.warn('⚠️  Erro ao verificar banco de dados:', error.message)
  console.warn('   Execute manualmente: npm run db:setup\n')
  // Não falhar o build
}

process.exit(0)

