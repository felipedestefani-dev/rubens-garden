import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  notes: z.string().optional(),
})

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateBookingSchema.parse(body)

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        service: true,
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.booking.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Agendamento deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar agendamento' },
      { status: 500 }
    )
  }
}


