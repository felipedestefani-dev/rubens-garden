import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rotas da API administrativa
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jwtVerify(token, secret)
      // Token válido, continuar
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
  }

  // Proteger rota /admin (exceto /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jwtVerify(token, secret)
      // Token válido, continuar
      return NextResponse.next()
    } catch (error) {
      // Token inválido, redirecionar para login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}


