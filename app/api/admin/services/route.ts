import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().int().positive(),
  active: z.boolean().optional(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    
    if (error instanceof Error) {
      // Verificar erros específicos do Prisma
      if (error.message.includes('P1001') || error.message.includes('Can\'t reach database server')) {
        return NextResponse.json(
          { 
            error: 'Erro de conexão com banco de dados',
            details: 'Não foi possível conectar ao banco PostgreSQL. Verifique se o DATABASE_URL está correto.',
            code: 'DATABASE_CONNECTION_ERROR'
          },
          { status: 500 }
        )
      }
      
      if (error.message.includes('P2025') || error.message.includes('table') || error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Tabelas do banco de dados não encontradas',
            details: 'Execute: npx prisma db push ou npm run db:setup',
            code: 'SCHEMA_ERROR'
          },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar serviços',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        code: 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('\n========== [API POST /api/admin/services] ==========')
  console.log('[API POST /api/admin/services] Iniciando criação de serviço...')
  console.log('[API POST /api/admin/services] Timestamp:', new Date().toISOString())
  
  try {
    // Verificar variáveis de ambiente
    console.log('[API POST /api/admin/services] Verificando variáveis de ambiente...')
    console.log('[API POST /api/admin/services] DATABASE_URL existe?', !!process.env.DATABASE_URL)
    console.log('[API POST /api/admin/services] DIRECT_URL existe?', !!process.env.DIRECT_URL)
    console.log('[API POST /api/admin/services] NODE_ENV:', process.env.NODE_ENV)
    
    if (!process.env.DATABASE_URL) {
      console.error('[API POST /api/admin/services] ❌ DATABASE_URL não está configurado!')
      console.error('[API POST /api/admin/services] Variáveis de ambiente disponíveis:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DIRECT')))
      return NextResponse.json(
        { 
          error: 'DATABASE_URL não configurado',
          details: 'A variável de ambiente DATABASE_URL não está definida.',
          availableEnvVars: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DIRECT'))
        },
        { status: 500 }
      )
    }

    // Testar conexão antes de criar
    console.log('[API POST /api/admin/services] Testando conexão com banco...')
    try {
      await prisma.$connect()
      console.log('[API POST /api/admin/services] ✅ Conexão estabelecida com sucesso')
    } catch (connectError) {
      console.error('[API POST /api/admin/services] ❌ Erro ao conectar:', connectError)
      if (connectError instanceof Error) {
        console.error('[API POST /api/admin/services] Erro message:', connectError.message)
        console.error('[API POST /api/admin/services] Erro code:', (connectError as any).code)
        console.error('[API POST /api/admin/services] Erro meta:', (connectError as any).meta)
      }
      throw connectError
    }

    console.log('[API POST /api/admin/services] Lendo body da requisição...')
    const body = await request.json()
    console.log('[API POST /api/admin/services] Body recebido:', {
      name: body.name,
      description: body.description ? 'presente' : 'ausente',
      duration: body.duration,
      active: body.active
    })

    console.log('[API POST /api/admin/services] Validando dados com Zod...')
    const validatedData = serviceSchema.parse(body)
    console.log('[API POST /api/admin/services] ✅ Dados validados:', validatedData)

    console.log('[API POST /api/admin/services] Criando serviço no banco de dados...')
    console.log('[API POST /api/admin/services] Dados a serem inseridos:', {
      name: validatedData.name,
      description: validatedData.description || null,
      duration: validatedData.duration,
      active: validatedData.active ?? true,
    })
    
    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        duration: validatedData.duration,
        active: validatedData.active ?? true,
      },
    })

    const duration = Date.now() - startTime
    console.log(`[API POST /api/admin/services] ✅ Serviço criado com sucesso em ${duration}ms:`, {
      id: service.id,
      name: service.name,
      duration: service.duration
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`\n========== [API POST /api/admin/services] ERRO após ${duration}ms ==========`)
    console.error('[API POST /api/admin/services] Tipo do erro:', error?.constructor?.name || typeof error)
    
    if (error instanceof z.ZodError) {
      console.error('[API POST /api/admin/services] ❌ Erro de validação Zod')
      console.error('[API POST /api/admin/services] Erros:', JSON.stringify(error.errors, null, 2))
      console.error('[API POST /api/admin/services] Issues:', error.issues.map(issue => ({
        path: issue.path,
        message: issue.message,
        code: issue.code
      })))
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      console.error('[API POST /api/admin/services] ❌ Erro capturado')
      console.error('[API POST /api/admin/services] Mensagem:', error.message)
      console.error('[API POST /api/admin/services] Stack:', error.stack)
      console.error('[API POST /api/admin/services] Nome:', error.name)
      
      // Log de propriedades adicionais do Prisma
      const prismaError = error as any
      if (prismaError.code) {
        console.error('[API POST /api/admin/services] Prisma Error Code:', prismaError.code)
      }
      if (prismaError.meta) {
        console.error('[API POST /api/admin/services] Prisma Error Meta:', JSON.stringify(prismaError.meta, null, 2))
      }
      if (prismaError.clientVersion) {
        console.error('[API POST /api/admin/services] Prisma Client Version:', prismaError.clientVersion)
      }
      
      // Verificar erros específicos do Prisma
      const errorMessage = error.message.toLowerCase()
      const errorCode = prismaError.code || ''
      
      console.error('[API POST /api/admin/services] Verificando tipo de erro...')
      console.error('[API POST /api/admin/services] Error message contém "P1001"?', errorMessage.includes('p1001'))
      console.error('[API POST /api/admin/services] Error message contém "can\'t reach"?', errorMessage.includes("can't reach") || errorMessage.includes('cant reach'))
      console.error('[API POST /api/admin/services] Error code:', errorCode)
      
      if (errorCode === 'P1001' || errorMessage.includes('p1001') || errorMessage.includes("can't reach") || errorMessage.includes('cant reach') || errorMessage.includes('connection')) {
        console.error('[API POST /api/admin/services] ❌ Erro de conexão com banco detectado')
        console.error('[API POST /api/admin/services] DATABASE_URL no momento do erro:', process.env.DATABASE_URL ? 'DEFINIDO' : 'NÃO DEFINIDO')
        return NextResponse.json(
          { 
            error: 'Erro de conexão com banco de dados',
            details: 'Não foi possível conectar ao banco PostgreSQL. Verifique se o DATABASE_URL está correto.',
            code: 'DATABASE_CONNECTION_ERROR',
            prismaCode: errorCode,
            errorMessage: error.message
          },
          { status: 500 }
        )
      }
      
      if (error.message.includes('Authentication failed') || error.message.includes('credentials') || error.message.includes('not valid')) {
        console.error('[API POST /api/admin/services] Erro de autenticação detectado')
        return NextResponse.json(
          { 
            error: 'Erro de autenticação com banco de dados',
            details: 'As credenciais do banco de dados estão inválidas ou expiradas.',
            code: 'DATABASE_AUTH_ERROR',
            solution: '1. Acesse o Supabase Dashboard → Settings → Database\n2. Copie a Connection string atualizada\n3. Ou resete a senha do banco (Database password → Reset)\n4. Atualize DATABASE_URL e DIRECT_URL no .env.local\n5. Reinicie o servidor (npm run dev)',
            testCommand: 'Execute: npm run db:test para diagnosticar o problema'
          },
          { status: 500 }
        )
      }
      
      if (error.message.includes('P2002') || error.message.includes('Unique constraint')) {
        console.error('[API POST /api/admin/services] Erro de constraint único detectado')
        return NextResponse.json(
          { 
            error: 'Serviço já existe',
            details: 'Já existe um serviço com este nome.',
            code: 'UNIQUE_CONSTRAINT_ERROR'
          },
          { status: 409 }
        )
      }
      
      if (error.message.includes('P2025') || error.message.includes('table') || error.message.includes('does not exist')) {
        console.error('[API POST /api/admin/services] Erro de schema detectado')
        return NextResponse.json(
          { 
            error: 'Tabelas do banco de dados não encontradas',
            details: 'Execute: npx prisma db push',
            code: 'SCHEMA_ERROR'
          },
          { status: 500 }
        )
      }
    }

    console.error('[API POST /api/admin/services] ❌ Erro desconhecido')
    console.error('[API POST /api/admin/services] Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    console.error('========== [FIM DO ERRO] ==========\n')
    
    return NextResponse.json(
      { 
        error: 'Erro ao criar serviço',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        code: 'UNKNOWN_ERROR',
        fullError: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

