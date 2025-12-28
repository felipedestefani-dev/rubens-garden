import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().int().positive(),
  active: z.boolean().optional(),
})

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
    return NextResponse.json(
      { error: 'Erro ao buscar serviços' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('[API POST /api/admin/services] Iniciando criação de serviço...')
  
  try {
    // Verificar DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('[API POST /api/admin/services] ❌ DATABASE_URL não está configurado!')
      return NextResponse.json(
        { 
          error: 'DATABASE_URL não configurado',
          details: 'A variável de ambiente DATABASE_URL não está definida.'
        },
        { status: 500 }
      )
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
    console.error(`[API POST /api/admin/services] ❌ Erro após ${duration}ms:`)
    
    if (error instanceof z.ZodError) {
      console.error('[API POST /api/admin/services] Erro de validação Zod:', {
        errors: error.errors,
        issues: error.issues.map(issue => ({
          path: issue.path,
          message: issue.message,
          code: issue.code
        }))
      })
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      console.error('[API POST /api/admin/services] Mensagem do erro:', error.message)
      console.error('[API POST /api/admin/services] Stack trace:', error.stack)
      console.error('[API POST /api/admin/services] Tipo do erro:', error.constructor.name)
      
      // Verificar erros específicos do Prisma
      if (error.message.includes('P1001') || error.message.includes('Can\'t reach database server')) {
        console.error('[API POST /api/admin/services] Erro de conexão com banco detectado')
        return NextResponse.json(
          { 
            error: 'Erro de conexão com banco de dados',
            details: 'Não foi possível conectar ao banco PostgreSQL. Verifique se o DATABASE_URL está correto.',
            code: 'DATABASE_CONNECTION_ERROR'
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

    console.error('[API POST /api/admin/services] Erro desconhecido:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao criar serviço',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        code: 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}

