import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
    return NextResponse.json(
      { error: 'Erro ao buscar serviços' },
      { status: 500 }
    )
  }
}

