#!/usr/bin/env node

/**
 * Script para criar as tabelas no banco de dados
 * Executa prisma db push de forma rápida
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Função para carregar variáveis de ambiente de arquivos .env
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  const env = {}
  
  content.split('\n').forEach(line => {
    line = line.trim()
    // Ignorar comentários e linhas vazias
    if (!line || line.startsWith('#')) {
      return
    }
    
    // Processar linhas no formato KEY=VALUE ou KEY="VALUE"
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      let key = match[1].trim()
      let value = match[2].trim()
      
      // Remover aspas se houver
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      
      env[key] = value
    }
  })
  
  return env
}

// Carregar variáveis de ambiente de .env.local ou .env
const projectRoot = path.join(__dirname, '..')
const envLocalPath = path.join(projectRoot, '.env.local')
const envPath = path.join(projectRoot, '.env')

let envVars = {}
if (fs.existsSync(envLocalPath)) {
  envVars = loadEnvFile(envLocalPath)
  console.log('📄 Carregando variáveis de .env.local...\n')
} else if (fs.existsSync(envPath)) {
  envVars = loadEnvFile(envPath)
  console.log('📄 Carregando variáveis de .env...\n')
}

// Mesclar variáveis do arquivo com as do ambiente (variáveis do ambiente têm prioridade)
Object.keys(envVars).forEach(key => {
  if (!process.env[key]) {
    process.env[key] = envVars[key]
  }
})

console.log('🔧 Criando tabelas no banco de dados...\n')

try {
  // Verificar se DATABASE_URL está configurado
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não está configurado!')
    console.error('   Configure DATABASE_URL no arquivo .env.local ou .env')
    process.exit(1)
  }

  // Para Supabase com connection pooling, usar DIRECT_URL para migrações
  // Se não estiver definido, usar DATABASE_URL (removendo pgbouncer se houver)
  if (!process.env.DIRECT_URL) {
    // Se DATABASE_URL tem pgbouncer, criar DIRECT_URL sem ele
    if (process.env.DATABASE_URL.includes('pgbouncer=true')) {
      process.env.DIRECT_URL = process.env.DATABASE_URL
        .replace(':6543', ':5432')
        .replace('?pgbouncer=true', '')
        .replace('&pgbouncer=true', '')
      console.log('ℹ️  DIRECT_URL não encontrado. Criando a partir de DATABASE_URL (removendo pgbouncer).\n')
    } else {
      // Se não tem pgbouncer, usar DATABASE_URL diretamente
      process.env.DIRECT_URL = process.env.DATABASE_URL
      console.log('ℹ️  DIRECT_URL não encontrado. Usando DATABASE_URL como DIRECT_URL.\n')
    }
  } else {
    console.log('ℹ️  DIRECT_URL detectado. Usando para migrações (Supabase connection pooling).\n')
  }

  const prismaPath = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma')
  
  console.log('📦 Executando prisma db push (pode levar alguns segundos)...\n')
  
  const startTime = Date.now()
  
  // Usar o prisma local do node_modules para ser mais rápido
  // Adicionar variáveis de ambiente para conexão mais rápida
  // O Prisma usa automaticamente DIRECT_URL se configurado no schema.prisma
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

