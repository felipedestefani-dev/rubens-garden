import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function verifyApiAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Não autenticado' },
          { status: 401 }
        ),
      }
    }

    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return {
      authenticated: true,
      user: {
        username: payload.username as string,
        role: payload.role as string,
      },
      response: null,
    }
  } catch (error) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      ),
    }
  }
}


