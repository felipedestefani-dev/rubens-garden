import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parse } from 'date-fns'

const dayOffSchema = z.object({
  date: z.string(),
  reason: z.string().optional(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const dayOffs = await prisma.dayOff.findMany({
      orderBy: {
        date: 'asc',
      },
    })

    // Sempre retornar um array
    return NextResponse.json(Array.isArray(dayOffs) ? dayOffs : [])
  } catch (error) {
    console.error('Erro ao buscar dias de folga:', error)
    
    // Sempre retornar array vazio em caso de erro para não quebrar o frontend
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = dayOffSchema.parse(body)

    const date = parse(validatedData.date, 'yyyy-MM-dd', new Date())

    // Verificar se já existe folga para esta data
    const existing = await prisma.dayOff.findFirst({
      where: {
        date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma folga cadastrada para esta data' },
        { status: 400 }
      )
    }

    const dayOff = await prisma.dayOff.create({
      data: {
        date,
        reason: validatedData.reason || null,
      },
    })

    return NextResponse.json(dayOff, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar dia de folga:', error)
    return NextResponse.json(
      { error: 'Erro ao criar dia de folga' },
      { status: 500 }
    )
  }
}


