import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parse, startOfDay } from 'date-fns'
import { z } from 'zod'

const bookingSchema = z.object({
  serviceId: z.string(),
  date: z.string(),
  time: z.string(),
  clientName: z.string().min(1),
  clientPhone: z.string().min(1),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = bookingSchema.parse(body)

    const selectedDate = parse(validatedData.date, 'yyyy-MM-dd', new Date())
    const dayOfWeek = selectedDate.getDay()

    // Verificar se é dia de folga
    const dayStart = startOfDay(selectedDate)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    
    const dayOff = await prisma.dayOff.findFirst({
      where: {
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
    })

    if (dayOff) {
      return NextResponse.json(
        { error: 'Este dia está marcado como folga' },
        { status: 400 }
      )
    }

    // Verificar horário de funcionamento
    const workingHours = await prisma.workingHours.findFirst({
      where: {
        dayOfWeek,
        isActive: true,
      },
    })

    if (!workingHours) {
      return NextResponse.json(
        { error: 'Sem horário de funcionamento para este dia' },
        { status: 400 }
      )
    }

    // Verificar se o horário está dentro do horário de funcionamento
    const [selectedHour, selectedMin] = validatedData.time.split(':').map(Number)
    const [startHour, startMin] = workingHours.startTime.split(':').map(Number)
    const [endHour, endMin] = workingHours.endTime.split(':').map(Number)

    const selectedTimeMinutes = selectedHour * 60 + selectedMin
    const startTimeMinutes = startHour * 60 + startMin
    const endTimeMinutes = endHour * 60 + endMin

    if (selectedTimeMinutes < startTimeMinutes || selectedTimeMinutes >= endTimeMinutes) {
      return NextResponse.json(
        { error: 'Horário fora do horário de funcionamento' },
        { status: 400 }
      )
    }

    // Verificar se já existe agendamento no mesmo horário
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
        time: validatedData.time,
        status: {
          in: ['pending', 'confirmed'],
        },
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Este horário já está ocupado' },
        { status: 400 }
      )
    }

    // Criar agendamento
    const booking = await prisma.booking.create({
      data: {
        service: {
          connect: { id: validatedData.serviceId },
        },
        clientName: validatedData.clientName,
        clientPhone: validatedData.clientPhone,
        date: selectedDate,
        time: validatedData.time,
        notes: validatedData.notes || null,
        status: 'pending',
      },
      include: {
        service: true,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar agendamento:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: 'Erro ao criar agendamento',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}

