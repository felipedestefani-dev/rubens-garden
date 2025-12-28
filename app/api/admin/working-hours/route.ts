import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const workingHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  isActive: z.boolean().optional(),
})

export async function GET() {
  try {
    const workingHours = await prisma.workingHours.findMany({
      orderBy: {
        dayOfWeek: 'asc',
      },
    })

    return NextResponse.json(workingHours)
  } catch (error) {
    console.error('Erro ao buscar horários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar horários' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = workingHoursSchema.parse(body)

    // Verificar se já existe horário para este dia
    const existing = await prisma.workingHours.findFirst({
      where: {
        dayOfWeek: validatedData.dayOfWeek,
      },
    })

    if (existing) {
      // Atualizar existente
      const updated = await prisma.workingHours.update({
        where: { id: existing.id },
        data: {
          startTime: validatedData.startTime,
          endTime: validatedData.endTime,
          isActive: validatedData.isActive ?? true,
        },
      })

      return NextResponse.json(updated)
    }

    // Criar novo
    const workingHours = await prisma.workingHours.create({
      data: {
        dayOfWeek: validatedData.dayOfWeek,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        isActive: validatedData.isActive ?? true,
      },
    })

    return NextResponse.json(workingHours, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao salvar horário:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar horário' },
      { status: 500 }
    )
  }
}


