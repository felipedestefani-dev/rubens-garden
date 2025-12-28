#!/usr/bin/env node

/**
 * Script para testar a conexão com o banco de dados
 */

const { PrismaClient } = require('@prisma/client')
const path = require('path')
const dotenv = require('dotenv')

// Carregar variáveis de ambiente do .env
// override: true garante que valores do .env sobrescrevam variáveis do ambiente
const projectRoot = path.join(__dirname, '..')
const envPath = path.join(projectRoot, '.env')
dotenv.config({ path: envPath, override: true })

console.log('DATABASE_URL:', process.env.DATABASE_URL)

// Verificar se DATABASE_URL está configurado
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está configurado no arquivo .env')
  process.exit(1)
}

// Testar conexão
const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
