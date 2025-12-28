#!/usr/bin/env node

/**
 * Script para criar as tabelas no banco de dados
 * Executa prisma db push de forma segura
 */

const { execSync } = require('child_process')

console.log('🔧 Verificando e criando tabelas no banco de dados...')

try {
  // Verificar se DATABASE_URL está configurado
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não está configurado!')
    console.error('Configure a variável de ambiente DATABASE_URL antes de executar este script.')
    process.exit(1)
  }

  console.log('📦 Executando prisma db push...')
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: process.env
  })
  
  console.log('✅ Tabelas criadas com sucesso!')
} catch (error) {
  console.error('❌ Erro ao criar tabelas:', error.message)
  process.exit(1)
}

