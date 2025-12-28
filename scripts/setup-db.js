#!/usr/bin/env node

/**
 * Script para criar as tabelas no banco de dados
 * Executa prisma db push de forma rápida
 */

const { execSync } = require('child_process')
const path = require('path')

console.log('🔧 Criando tabelas no banco de dados...\n')

try {
  // Verificar se DATABASE_URL está configurado
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não está configurado!')
    process.exit(1)
  }

  const prismaPath = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma')
  
  console.log('📦 Executando prisma db push (pode levar alguns segundos)...\n')
  
  const startTime = Date.now()
  
  // Usar o prisma local do node_modules para ser mais rápido
  // Adicionar variáveis de ambiente para conexão mais rápida
  const env = {
    ...process.env,
    PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary',
    PRISMA_ENGINE_CHECK_INTERVAL: '1000'
  }
  
  execSync(`${prismaPath} db push --skip-generate --accept-data-loss`, {
    stdio: 'inherit',
    env: env,
    cwd: path.join(__dirname, '..'),
    timeout: 60000 // 1 minuto de timeout
  })
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n✅ Tabelas criadas com sucesso! (${duration}s)`)
} catch (error) {
  if (error.signal === 'SIGTERM') {
    console.error('\n❌ Timeout: O comando demorou muito.')
    console.error('Verifique sua conexão com o banco de dados.')
  } else if (error.status === 1) {
    // Prisma já mostrou o erro, só sair
    process.exit(1)
  } else {
    console.error('\n❌ Erro:', error.message)
  }
  process.exit(1)
}

