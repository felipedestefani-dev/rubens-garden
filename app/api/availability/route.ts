import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTimeSlots } from '@/lib/utils'
import { parse, format, isSameDay, startOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const serviceId = searchParams.get('serviceId')
    const dateStr = searchParams.get('date')

    if (!serviceId || !dateStr) {
      return NextResponse.json(
        { error: 'serviceId e date são obrigatórios' },
        { status: 400 }
      )
    }

    const selectedDate = parse(dateStr, 'yyyy-MM-dd', new Date())
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
      return NextResponse.json({
        available: false,
        hasSlots: false,
        reason: 'Dia de folga',
      })
    }

    // Buscar horários de funcionamento para o dia da semana
    const workingHours = await prisma.workingHours.findFirst({
      where: {
        dayOfWeek,
        isActive: true,
      },
    })

    if (!workingHours) {
      return NextResponse.json({
        available: false,
        hasSlots: false,
        reason: 'Sem horário de funcionamento para este dia',
      })
    }

    // Buscar serviço para obter duração
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Gerar todos os slots possíveis
    const allSlots = generateTimeSlots(
      workingHours.startTime,
      workingHours.endTime,
      service.duration
    )

    // Buscar agendamentos existentes para este dia com seus serviços
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      include: {
        service: true,
      },
    })

    // Criar um conjunto de horários ocupados
    const occupiedSlots = new Set<string>()
    
    bookings.forEach((booking) => {
      const bookingTime = booking.time
      const bookingDuration = booking.service.duration
      
      // Calcular horário de término do agendamento
      const [bookingHour, bookingMin] = bookingTime.split(':').map(Number)
      const bookingStartMinutes = bookingHour * 60 + bookingMin
      const bookingEndMinutes = bookingStartMinutes + bookingDuration
      
      // Marcar todos os slots que se sobrepõem com este agendamento
      allSlots.forEach((slot) => {
        const [slotHour, slotMin] = slot.split(':').map(Number)
        const slotStartMinutes = slotHour * 60 + slotMin
        const slotEndMinutes = slotStartMinutes + service.duration
        
        // Verificar sobreposição
        if (slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes) {
          occupiedSlots.add(slot)
        }
      })
    })

    // Filtrar slots disponíveis
    const availableSlots = allSlots.filter((slot) => !occupiedSlots.has(slot))

    return NextResponse.json({
      available: true,
      hasSlots: availableSlots.length > 0,
      timeSlots: availableSlots,
    })
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar disponibilidade' },
      { status: 500 }
    )
  }
}

