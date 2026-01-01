#!/usr/bin/env node

/**
 * Converte a URL do pooler Supabase para URL direta
 * Útil para migrations do Prisma
 */

const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')

if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env.local não encontrado!')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const poolerUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1]

if (!poolerUrl) {
  console.error('❌ DATABASE_URL não encontrado no .env.local')
  process.exit(1)
}

// Converter pooler para conexão direta
// De: ...pooler.supabase.com:6543/...
// Para: ...connect.psql.supabase.com:5432/...
const directUrl = poolerUrl
  .replace('pooler.supabase.com:6543', 'connect.psql.supabase.com:5432')
  .replace('?pgbouncer=true', '')

console.log('🔄 Convertendo URL do pooler para conexão direta...\n')
console.log('Pooler (atual):', poolerUrl.substring(0, 60) + '...')
console.log('Direta (nova): ', directUrl.substring(0, 60) + '...\n')

const newEnvContent = envContent.replace(
  /DATABASE_URL=.*/,
  `DATABASE_URL=${directUrl}`
)

fs.writeFileSync(envPath, newEnvContent)
console.log('✅ .env.local atualizado com a URL direta!')
console.log('\nAgora você pode executar:')
console.log('  npx prisma migrate dev --name init')


