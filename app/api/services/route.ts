import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    
    // Verificar se é erro de conexão com banco
    if (error instanceof Error) {
      if (error.message.includes('P1001') || error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Erro de conexão com banco de dados. Verifique se o DATABASE_URL está configurado.' },
          { status: 500 }
        )
      }
      if (error.message.includes('P2025') || error.message.includes('table')) {
        return NextResponse.json(
          { error: 'Tabelas do banco de dados não encontradas. Execute: npx prisma db push' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Erro ao buscar serviços', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

