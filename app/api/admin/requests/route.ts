import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const where: any = {}

    if (status) {
      where.status = status
    }

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    
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
        error: 'Erro ao buscar solicitações',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        code: 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}

