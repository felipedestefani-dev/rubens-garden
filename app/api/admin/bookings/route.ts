import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (date) {
      const dateObj = new Date(date)
      const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
      const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1)
      
      where.date = {
        gte: startOfDay,
        lt: endOfDay,
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    
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
      { error: 'Erro ao buscar agendamentos', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

