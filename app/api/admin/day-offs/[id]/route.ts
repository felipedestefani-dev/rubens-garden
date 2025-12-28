import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.dayOff.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Dia de folga removido com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar dia de folga:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar dia de folga' },
      { status: 500 }
    )
  }
}


