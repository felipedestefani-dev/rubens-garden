import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const requestSchema = z.object({
  serviceId: z.string(),
  clientName: z.string().min(1),
  clientPhone: z.string().min(1),
  address: z.string().min(1),
  notes: z.string().optional(),
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = requestSchema.parse(body)

    // Verificar se o serviço existe e está ativo
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    })

    if (!service || !service.active) {
      return NextResponse.json(
        { error: 'Serviço não encontrado ou inativo' },
        { status: 400 }
      )
    }

    // Criar solicitação
    // Verificar se o modelo existe
    if (!prisma.serviceRequest) {
      console.error('Prisma Client não tem o modelo serviceRequest. Reinicie o servidor.')
      return NextResponse.json(
        { error: 'Erro interno: modelo não encontrado. Reinicie o servidor.' },
        { status: 500 }
      )
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        serviceId: validatedData.serviceId,
        clientName: validatedData.clientName,
        clientPhone: validatedData.clientPhone,
        address: validatedData.address,
        notes: validatedData.notes || null,
        status: 'pending',
      },
      include: {
        service: true,
      },
    })

    return NextResponse.json(serviceRequest, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar solicitação:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: 'Erro ao criar solicitação',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}

