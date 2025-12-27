import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parse, startOfDay } from 'date-fns'

const updateRequestSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  adminNotes: z.string().optional().nullable(),
  bookingDate: z.string().optional(),
  bookingTime: z.string().optional(),
  bookingPrice: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const num = parseFloat(val)
      return isNaN(num) ? undefined : num
    }
    return undefined
  }, z.number().optional()),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log('Dados recebidos:', body)
    const validatedData = updateRequestSchema.parse(body)
    console.log('Dados validados:', validatedData)

    // Buscar a solicitação antes de atualizar
    const existingRequest = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        service: true,
      },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    // Se for aprovar, validar TUDO antes de atualizar o status
    if (validatedData.status === 'approved') {
      // Validar que data, hora e valor foram fornecidos
      if (!validatedData.bookingDate || !validatedData.bookingTime) {
        return NextResponse.json(
          { error: 'É necessário informar a data e horário para aprovar a solicitação.' },
          { status: 400 }
        )
      }

      const bookingPrice = validatedData.bookingPrice
      console.log('Valor do serviço recebido:', bookingPrice, 'Tipo:', typeof bookingPrice)
      
      if (bookingPrice === undefined || bookingPrice === null) {
        return NextResponse.json(
          { error: 'É necessário informar o valor do serviço para aprovar a solicitação.' },
          { status: 400 }
        )
      }
      
      const priceNumber = typeof bookingPrice === 'number' ? bookingPrice : parseFloat(String(bookingPrice))
      if (isNaN(priceNumber) || priceNumber <= 0) {
        return NextResponse.json(
          { error: 'O valor do serviço deve ser um número maior que zero.' },
          { status: 400 }
        )
      }
      
      // Armazenar o valor validado para usar depois
      validatedData.bookingPrice = priceNumber

      // Validar data, horário e disponibilidade ANTES de atualizar
      try {
        const selectedDate = parse(validatedData.bookingDate, 'yyyy-MM-dd', new Date())
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
            { error: 'Este dia está marcado como folga. Não foi possível criar o agendamento.' },
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
            { error: 'Sem horário de funcionamento para este dia. Não foi possível criar o agendamento.' },
            { status: 400 }
          )
        }

        // Verificar se o horário está dentro do horário de funcionamento
        const [selectedHour, selectedMin] = validatedData.bookingTime.split(':').map(Number)
        const [startHour, startMin] = workingHours.startTime.split(':').map(Number)
        const [endHour, endMin] = workingHours.endTime.split(':').map(Number)

        const selectedTimeMinutes = selectedHour * 60 + selectedMin
        const startTimeMinutes = startHour * 60 + startMin
        const endTimeMinutes = endHour * 60 + endMin

        if (selectedTimeMinutes < startTimeMinutes || selectedTimeMinutes >= endTimeMinutes) {
          return NextResponse.json(
            { error: 'Horário fora do horário de funcionamento. Não foi possível criar o agendamento.' },
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
            time: validatedData.bookingTime,
            status: {
              in: ['pending', 'confirmed'],
            },
          },
        })

        if (existingBooking) {
          return NextResponse.json(
            { error: 'Este horário já está ocupado. Não foi possível criar o agendamento.' },
            { status: 400 }
          )
        }
      } catch (validationError) {
        console.error('Erro na validação:', validationError)
        return NextResponse.json(
          { error: 'Erro ao validar dados do agendamento. Verifique a data e horário informados.' },
          { status: 400 }
        )
      }
    }

    // Atualizar a solicitação (só chega aqui se tudo estiver válido)
    const serviceRequest = await prisma.serviceRequest.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
        adminNotes: validatedData.adminNotes || null,
      },
      include: {
        service: true,
      },
    })

    // Se foi aprovada e passou todas as validações, criar o agendamento
    if (validatedData.status === 'approved' && validatedData.bookingDate && validatedData.bookingTime) {
      // O preço já foi validado e convertido acima
      const bookingPrice = validatedData.bookingPrice!
      try {
        const selectedDate = parse(validatedData.bookingDate, 'yyyy-MM-dd', new Date())
        
        console.log('Criando agendamento com dados:', {
          serviceId: existingRequest.serviceId,
          clientName: existingRequest.clientName,
          clientPhone: existingRequest.clientPhone,
          date: selectedDate,
          time: validatedData.bookingTime,
          price: bookingPrice,
          priceType: typeof bookingPrice,
        })

        // Criar o agendamento (validações já foram feitas acima)
        // Garantir que o preço seja um número válido
        const finalPrice = typeof bookingPrice === 'number' && !isNaN(bookingPrice) && bookingPrice > 0
          ? bookingPrice
          : null
        
        if (!finalPrice) {
          throw new Error('Valor do serviço inválido')
        }
        
        const booking = await prisma.booking.create({
          data: {
            serviceId: existingRequest.serviceId,
            clientName: existingRequest.clientName,
            clientPhone: existingRequest.clientPhone,
            date: selectedDate,
            time: validatedData.bookingTime,
            price: finalPrice,
            notes: existingRequest.notes || null,
            status: 'pending',
          },
        })
        
        console.log('Agendamento criado com sucesso:', booking.id)
      } catch (bookingError) {
        console.error('Erro ao criar agendamento:', bookingError)
        console.error('Detalhes do erro:', {
          message: bookingError instanceof Error ? bookingError.message : 'Erro desconhecido',
          stack: bookingError instanceof Error ? bookingError.stack : undefined,
        })
        
        // Reverter o status da solicitação
        await prisma.serviceRequest.update({
          where: { id: params.id },
          data: { status: 'pending' },
        })
        
        const errorMessage = bookingError instanceof Error 
          ? bookingError.message 
          : 'Erro desconhecido ao criar agendamento'
        
        return NextResponse.json(
          { 
            error: 'Erro ao criar agendamento. A solicitação permanece pendente.',
            details: errorMessage
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(serviceRequest)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Erro de validação Zod:', error.errors)
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: error.errors,
          message: 'Verifique se todos os campos obrigatórios foram preenchidos corretamente.'
        },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar solicitação:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao atualizar solicitação',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.serviceRequest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Solicitação deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar solicitação' },
      { status: 500 }
    )
  }
}

